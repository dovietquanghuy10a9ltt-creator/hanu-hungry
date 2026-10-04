import Link from "next/link";

export default function NotFoundPage() {
  return <div className="card mx-auto max-w-xl p-8 text-center"><p className="eyebrow">404</p><h1 className="mt-2 text-2xl font-black">Không tìm thấy nội dung</h1><p className="mt-3 text-sm text-[var(--color-muted)]">Trang có thể đã được chuyển hoặc không còn khả dụng.</p><Link href="/" className="button button-primary mt-5">Về trang chủ</Link></div>;
}
