import { createAdminClient } from "@/lib/supabase/admin";

export type RateLimitOptions = {
  action: string;
  identifier?: string;
  maxAttempts: number;
  windowSeconds: number;
  blockSeconds?: number;
};

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; remainingSeconds: number; message: string };

export async function getClientIp(): Promise<string> {
  try {
    const { headers } = await import("next/headers");
    const headerList = await headers();
    const vercelIp = headerList.get("x-vercel-ip");
    if (vercelIp) return vercelIp.trim();
    const realIp = headerList.get("x-real-ip");
    if (realIp) return realIp.trim();
    const forwarded = headerList.get("x-forwarded-for");
    if (forwarded) {
      const firstIp = forwarded.split(",")[0].trim();
      if (firstIp) return firstIp;
    }
  } catch {
    // Running in unit test or non-HTTP context
  }
  return "127.0.0.1";
}

export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const ip = options.identifier || (await getClientIp());
  const key = `${options.action}:${ip}`;
  const now = new Date();

  try {
    const admin = createAdminClient();
    const { data: record, error: fetchError } = await admin
      .from("rate_limits")
      .select("key, attempts, first_attempt_at, blocked_until")
      .eq("key", key)
      .maybeSingle();

    if (fetchError) {
      console.error("[rate-limit] Error querying rate_limits:", fetchError.message);
      // Graceful degradation: fail-open if rate limit DB check fails
      return { allowed: true };
    }

    if (record) {
      if (record.blocked_until && new Date(record.blocked_until) > now) {
        const remainingSeconds = Math.max(
          1,
          Math.ceil((new Date(record.blocked_until).getTime() - now.getTime()) / 1000)
        );
        return {
          allowed: false,
          remainingSeconds,
          message: `Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau ${remainingSeconds} giây.`,
        };
      }

      const windowMs = options.windowSeconds * 1000;
      const windowExpired = now.getTime() - new Date(record.first_attempt_at).getTime() > windowMs;

      if (windowExpired) {
        await admin
          .from("rate_limits")
          .update({
            attempts: 1,
            first_attempt_at: now.toISOString(),
            last_attempt_at: now.toISOString(),
            blocked_until: null,
          })
          .eq("key", key);
        return { allowed: true };
      }

      const nextAttempts = record.attempts + 1;
      if (nextAttempts > options.maxAttempts) {
        const cooldownSeconds = options.blockSeconds ?? options.windowSeconds;
        const blockedUntil = new Date(now.getTime() + cooldownSeconds * 1000);
        await admin
          .from("rate_limits")
          .update({
            attempts: nextAttempts,
            last_attempt_at: now.toISOString(),
            blocked_until: blockedUntil.toISOString(),
          })
          .eq("key", key);

        return {
          allowed: false,
          remainingSeconds: cooldownSeconds,
          message: `Bạn đã thử quá số lần cho phép. Vui lòng chờ ${cooldownSeconds} giây trước khi thử lại.`,
        };
      }

      await admin
        .from("rate_limits")
        .update({
          attempts: nextAttempts,
          last_attempt_at: now.toISOString(),
        })
        .eq("key", key);

      return { allowed: true };
    }

    // First attempt in this window
    await admin.from("rate_limits").insert({
      key,
      attempts: 1,
      first_attempt_at: now.toISOString(),
      last_attempt_at: now.toISOString(),
      blocked_until: null,
    });

    return { allowed: true };
  } catch (err) {
    console.error("[rate-limit] Unexpected error checking rate limit:", err);
    return { allowed: true };
  }
}

export async function clearRateLimit(action: string, identifier?: string): Promise<void> {
  const ip = identifier || (await getClientIp());
  const key = `${action}:${ip}`;
  try {
    const admin = createAdminClient();
    await admin.from("rate_limits").delete().eq("key", key);
  } catch (err) {
    console.error("[rate-limit] Error clearing rate limit:", err);
  }
}
