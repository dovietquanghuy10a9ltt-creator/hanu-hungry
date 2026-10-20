import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  const links = [
    ["/admin/analytics", "Thống kê"],
    ["/admin/restaurants", "Quán ăn"],
    ["/admin/dishes", "Món ăn"],
    ["/admin/categories", "Category"],
    ["/admin/blog", "Blog"],
    ["/admin/messages", "Lời nhắn góp ý"],
  ];
  return <main className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)] w-full overflow-x-hidden">
    <header className="border-b border-[var(--color-line)] bg-white px-4 py-3 sm:px-8 sm:py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <Link href="/admin/analytics" className="inline-flex min-h-11 items-center gap-2 text-[var(--color-red)]">
          <Image src="/brand/logo.png" alt="" width={36} height={36} className="h-8 w-8 sm:h-9 sm:w-9 object-contain" />
          <span className="brand-display text-xl sm:text-2xl leading-none">{siteConfig.name}</span>
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-[var(--color-pale)] text-[var(--color-red)] px-2 py-0.5 rounded-full border border-[#f0c2c6]">
            <Image src="/icons/nav/admin.png" alt="" width={14} height={14} unoptimized className="object-contain shrink-0" />
            Admin
          </span>
        </Link>
        <Link href="/" className="inline-flex min-h-11 items-center text-xs sm:text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-red)] shrink-0">Về trang chủ ↗</Link>
      </div>
      <nav aria-label="Quản trị" className="mx-auto mt-2.5 flex max-w-6xl gap-1.5 sm:gap-2 overflow-x-auto pb-1 touch-pan-x">
        {links.map(([href, text]) => <Link key={href} href={href} className="inline-flex min-h-9 sm:min-h-11 shrink-0 items-center rounded-full border border-[var(--color-line)] px-3 sm:px-4 text-xs sm:text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-red)] hover:text-[var(--color-red)]">{text}</Link>)}
      </nav>
    </header>
    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-8 sm:py-10 min-w-0">{children}</div>
  </main>;
}
