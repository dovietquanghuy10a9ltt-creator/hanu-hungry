import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";

export async function createClient() {
  const cookieStore = await cookies();
  const remember = cookieStore.get("hanu_remember")?.value !== "0";

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, remember
                ? options
                : { ...options, maxAge: undefined, expires: undefined });
            });
          } catch {
            // Server Components cannot write cookies. The proxy refreshes sessions.
          }
        },
      },
    },
  );
}
