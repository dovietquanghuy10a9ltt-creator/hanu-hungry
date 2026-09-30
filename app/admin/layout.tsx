import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  const links = [
    ["/admin", "Tổng quan"],
    ["/admin/restaurants", "Quán ăn"],
    ["/admin/dishes", "Món ăn"],
    ["/admin/categories", "Category"],
    ["/admin/blog", "Blog"],
    ["/admin/analytics", "Thống kê"],
  ];
  return <main className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
    <header className="border-b border-[var(--color-line)] bg-white px-4 py-4 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <Link href="/admin" className="inline-flex min-h-11 items-center gap-2 text-[var(--color-red)]">
          <Image src="/brand/logo.png" alt="" width={36} height={36} className="h-9 w-9 object-contain" />
          <span className="brand-display text-2xl leading-none">{siteConfig.name}</span>
          <span className="text-xs font-bold uppercase tracking-wider">Admin</span>
        </Link>
        <Link href="/" className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-red)]">Về trang chủ</Link>
      </div>
      <nav aria-label="Quản trị" className="mx-auto mt-3 flex max-w-6xl gap-2 overflow-x-auto pb-1">
        {links.map(([href, text]) => <Link key={href} href={href} className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-[var(--color-line)] px-4 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-red)] hover:text-[var(--color-red)]">{text}</Link>)}
      </nav>
    </header>
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-8 sm:py-10">{children}</div>
  </main>;
}
