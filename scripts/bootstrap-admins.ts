import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

type AdminSeed = { email: string; studentCode: string; passwordEnv: string };

export const INITIAL_ADMINS: readonly AdminSeed[] = [
  { email: "linhphamhn342@gmail.com", studentCode: "2404060021", passwordEnv: "BOOTSTRAP_ADMIN_1_PASSWORD" },
  { email: "mtvzzn@gmail.com", studentCode: "2404060034", passwordEnv: "BOOTSTRAP_ADMIN_2_PASSWORD" },
];

function displayName(email: string): string {
  return email.split("@", 1)[0];
}

async function findAuthUser(admin: SupabaseClient, email: string): Promise<User | null> {
  const perPage = 1000;
  for (let page = 1; page <= 1000; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const user = data.users.find((item) => item.email?.toLowerCase() === email.toLowerCase());
    if (user) return user;
    if (data.users.length < perPage) return null;
  }
  throw new Error("Auth user listing exceeded safe page limit");
}

export async function ensureAdmin(admin: SupabaseClient, seed: AdminSeed, password?: string): Promise<"created" | "updated"> {
  if (!/^[0-9]{10}$/.test(seed.studentCode)) throw new Error("Invalid bootstrap MSSV");
  let user = await findAuthUser(admin, seed.email);
  let result: "created" | "updated" = "updated";

  if (!user) {
    if (!password || password.length < 8) {
      throw new Error(`${seed.passwordEnv} is required (at least 8 characters) to create ${seed.email}`);
    }
    const { data, error } = await admin.auth.admin.createUser({
      email: seed.email,
      password,
      email_confirm: true,
      user_metadata: { student_code: seed.studentCode },
    });
    if (error) throw error;
    user = data.user;
    result = "created";
  }

  if (!user) throw new Error(`Unable to resolve auth account for ${seed.email}`);
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id,student_code")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) throw profileError;
  if (profile && profile.student_code !== seed.studentCode) {
    throw new Error(`Existing profile MSSV differs for ${seed.email}; inspect manually`);
  }
  const { data: codeOwner, error: codeError } = await admin
    .from("profiles")
    .select("id")
    .eq("student_code", seed.studentCode)
    .maybeSingle();
  if (codeError) throw codeError;
  if (codeOwner && codeOwner.id !== user.id) {
    throw new Error(`MSSV is already attached to a different account: ${seed.studentCode}`);
  }

  const { error: upsertError } = await admin.from("profiles").upsert({
    id: user.id,
    student_code: seed.studentCode,
    display_name: displayName(seed.email),
    role: "ADMIN",
  }, { onConflict: "id" });
  if (upsertError) throw upsertError;

  if (user.user_metadata?.student_code !== seed.studentCode) {
    const { error: metadataError } = await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, student_code: seed.studentCode },
    });
    if (metadataError) throw metadataError;
  }
  return result;
}

export async function bootstrapAdmins(): Promise<void> {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase URL and service role key are required at runtime");
  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const seed of INITIAL_ADMINS) {
    const result = await ensureAdmin(admin, seed, process.env[seed.passwordEnv]);
    console.log(`${result}: ${seed.email}`);
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  bootstrapAdmins().catch((error: unknown) => {
    // Provider errors may contain request details. Never print arbitrary error objects.
    const safeMessage = error instanceof Error && (
      error.message.includes("is required") ||
      error.message.includes("differs") ||
      error.message.includes("already attached")
    ) ? error.message : "Inspect service configuration and database state";
    console.error(`Admin bootstrap failed: ${safeMessage}`);
    process.exitCode = 1;
  });
}
