import type { ReactNode } from "react";
import Link from "next/link";

export function AuthShell({ children }: { children: ReactNode }) {
  return <div className="grid overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[#fffdf8] lg:grid-cols-[1fr_1.05fr]">
    <section className="relative hidden flex-col justify-between bg-[var(--color-red)] p-10 text-[#fff7e6] lg:flex"><Link href="/" className="brand-display text-2xl">HANU Hungry</Link><div className="py-16"><p className="mb-5 text-xs uppercase tracking-[.18em] text-white/65">Một chiếc bụng đói · Một cuốn sổ nhỏ</p><h1 className="text-5xl leading-[1.12]">Quán quen.<br />Món mới.<br />Hẹn bạn ở đây.</h1><p className="mt-6 max-w-xs text-base leading-relaxed text-white/75">Lưu những chỗ đã ghé. Tìm một bữa ngon cho ngày mai.</p></div><div className="flex items-center justify-between border-t border-white/25 pt-5 text-xs tracking-widest"><span>DÀNH CHO SINH VIÊN HANU</span><span className="text-3xl">✳</span></div></section>
    <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14"><div className="w-full max-w-md">{children}</div></section>
  </div>;
}
