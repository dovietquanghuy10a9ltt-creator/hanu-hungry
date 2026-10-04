import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { safeReturnPath } from "@/lib/auth/validation";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = safeReturnPath(url.searchParams.get("next"));
  const supabase = await createClient();
  let verified = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    verified = !error;
  } else if (tokenHash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
    verified = !error;
  } else if (tokenHash && type === "signup") {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "signup" });
    verified = !error;
  }

  if (!verified) {
    return NextResponse.redirect(new URL("/login?auth=expired", url.origin));
  }
  if (next === "/reset-password" && (type === "recovery" || code)) {
    (await cookies()).set("hanu_recovery", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
