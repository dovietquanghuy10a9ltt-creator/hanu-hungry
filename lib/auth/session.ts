import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type AuthenticatedProfile = { user: User; profile: Profile };

export async function getCurrentProfile(): Promise<AuthenticatedProfile | null> {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error || !profile) return null;
  return { user, profile };
}

export async function requireUser(): Promise<AuthenticatedProfile> {
  const account = await getCurrentProfile();
  if (!account) redirect("/login");
  return account;
}

export async function requireAdmin(): Promise<AuthenticatedProfile> {
  const account = await requireUser();
  if (account.profile.role !== "ADMIN") redirect("/");
  return account;
}
