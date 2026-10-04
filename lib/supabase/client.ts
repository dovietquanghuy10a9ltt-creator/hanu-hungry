import { createBrowserClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return typeof document === "undefined" ? [] : parseCookieHeader(document.cookie);
        },
        setAll(cookiesToSet) {
          if (typeof document === "undefined") return;
          const remember = parseCookieHeader(document.cookie)
            .find((cookie) => cookie.name === "hanu_remember")?.value !== "0";
          cookiesToSet.forEach(({ name, value, options }) => {
            const isRemoval = options.maxAge === 0;
            const effectiveOptions = remember || isRemoval
              ? options
              : { ...options, maxAge: undefined, expires: undefined };
            document.cookie = serializeCookieHeader(name, value, effectiveOptions);
          });
        },
      },
    },
  );
}
