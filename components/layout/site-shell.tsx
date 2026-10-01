import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Navigation } from "@/components/layout/navigation";
import { createClient } from "@/lib/supabase/server";

export async function SiteShell({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = user
    ? (await supabase.from("profiles").select("display_name, role").eq("id", user.id).maybeSingle()).data
    : null;
  const isAdmin = profile?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[#faf7ef]/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex min-h-12 shrink-0 items-center gap-2" aria-label="HANU Hungry - Trang chủ">
            <Image src="/brand/logo.png" alt="" width={40} height={40} className="h-8 w-8 object-contain sm:h-10 sm:w-10" priority />
            <span className="brand-display text-[1.35rem] leading-none text-[var(--color-red)] sm:text-[1.65rem]">HANU Hungry</span>
          </Link>
          <Navigation isAdmin={isAdmin} />
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href="/notifications" className="icon-link" aria-label="Thông báo">♧</Link>
                <Link href="/profile" className="hidden min-h-11 items-center rounded-full bg-[var(--color-pale)] px-4 text-sm font-semibold text-[var(--color-red)] sm:flex">
                  {profile?.display_name || user.email?.split("@")[0] || "Tài khoản"}
                </Link>
              </>
            ) : (
              <Link href="/login" className="button button-primary shrink-0 whitespace-nowrap px-3 text-xs sm:px-4 sm:text-sm">Đăng nhập</Link>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto min-h-[calc(100vh-15rem)] max-w-7xl px-4 pb-28 pt-6 sm:px-6 md:pb-14 md:pt-10">
        {children}
      </main>

      <footer className="border-t border-[var(--color-line)] bg-[#f1eadd] pb-24 md:pb-0">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 text-sm text-[var(--color-muted)] sm:px-6 md:flex-row md:items-center md:justify-between">
          <div><strong className="text-[var(--color-red)]">HANU Hungry</strong><p>Dữ liệu quán ăn từ khảo sát của nhóm sinh viên HANU.</p></div>
          <div className="flex flex-wrap gap-5"><Link href="/about">Về chúng mình</Link><Link href="/contact">Liên hệ</Link><Link href="/blog">Blog</Link></div>
        </div>
      </footer>

      <Navigation mobile signedIn={Boolean(user)} />
    </div>
  );
}
