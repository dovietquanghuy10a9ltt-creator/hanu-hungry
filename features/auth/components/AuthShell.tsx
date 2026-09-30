import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-9rem)] bg-[var(--color-pale)] text-[var(--color-ink)] lg:grid lg:min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <section className="brand-gradient relative hidden flex-col justify-between overflow-hidden px-6 py-8 text-white lg:flex lg:min-h-[calc(100vh-4rem)] lg:px-16 lg:py-12">
        <Link href="/" className="relative z-10 inline-flex min-h-11 items-center gap-2 tracking-tight">
          <Image src="/brand/logo.png" alt="" width={40} height={40} className="h-8 w-8 object-contain sm:h-10 sm:w-10" />
          <span className="brand-display text-2xl leading-none sm:text-3xl">{siteConfig.name}</span>
        </Link>
        <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-amber-200/10 blur-2xl" />
        <div className="relative z-10 max-w-xl lg:pb-16">
          <p className="mb-3 hidden text-sm font-bold uppercase tracking-[0.24em] text-white/75 lg:block">Dành cho sinh viên HANU</p>
          <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-6xl">
            {siteConfig.tagline}
          </h1>
          <p className="mt-5 hidden max-w-md text-lg leading-relaxed text-white/85 lg:block">
            {siteConfig.description}
          </p>
        </div>
      </section>
      <section className="flex items-start justify-center px-0 py-2 sm:px-8 sm:py-8 lg:min-h-[calc(100vh-4rem)] lg:items-center lg:px-10">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_18px_70px_-32px_rgba(97,27,25,0.42)] sm:p-9">
          {children}
        </div>
      </section>
    </div>
  );
}
