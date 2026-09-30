import type { ReactNode } from "react";
import Link from "next/link";

export function AdminHeader({ title, description, children }: {
  title: string; description?: string; children?: ReactNode;
}) {
  return <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#76645d]">{description}</p>}
    </div>
    {children}
  </div>;
}

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-[#eddfd8] bg-white p-5 shadow-sm sm:p-6 ${className}`}>{children}</section>;
}

export function AdminError({ children }: { children: ReactNode }) {
  return <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{children}</p>;
}

export function AdminPager({ base, page, hasNext, query = "" }: {
  base: string; page: number; hasNext: boolean; query?: string;
}) {
  const href = (target: number) => `${base}?page=${target}${query ? `&q=${encodeURIComponent(query)}` : ""}`;
  return <nav aria-label="Trang dữ liệu" className="mt-6 flex items-center justify-between gap-3 text-sm">
    {page > 1 ? <Link href={href(page - 1)} className="inline-flex min-h-11 items-center rounded-xl border border-[#e8d8d0] bg-white px-4 font-semibold">← Trang trước</Link> : <span />}
    <span className="text-[#76645d]">Trang {page}</span>
    {hasNext ? <Link href={href(page + 1)} className="inline-flex min-h-11 items-center rounded-xl border border-[#e8d8d0] bg-white px-4 font-semibold">Trang sau →</Link> : <span />}
  </nav>;
}
