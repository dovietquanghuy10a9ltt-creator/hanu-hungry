import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/footer";
import {
  AuthProvider,
  HeaderDesktopNavigation,
  HeaderUserNavActions,
  ClientMobileNavBars,
} from "@/components/auth/auth-context";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
        <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[#faf7ef]/95 backdrop-blur">
          <div className="mx-auto flex min-h-14 sm:min-h-16 w-full max-w-7xl items-center justify-between gap-1.5 sm:gap-3 px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="flex min-h-11 sm:min-h-12 shrink-0 items-center gap-1.5 sm:gap-2"
              aria-label="Hanu Hungry - Trang chủ"
            >
              <Image
                src="/brand/logo.png"
                alt=""
                width={40}
                height={40}
                className="h-7 w-7 object-contain sm:h-10 sm:w-10"
                priority
              />
              <span className="brand-display text-[1.15rem] leading-none text-[var(--color-red)] sm:text-[1.65rem]">
                Hanu Hungry
              </span>
            </Link>
            <HeaderDesktopNavigation />
            <HeaderUserNavActions />
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto min-h-[calc(100vh-15rem)] w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-28 pt-4 sm:pt-6 md:pb-14 md:pt-10 overflow-x-clip"
        >
          {children}
        </main>

        <SiteFooter />

        <ClientMobileNavBars />
      </div>
    </AuthProvider>
  );
}
