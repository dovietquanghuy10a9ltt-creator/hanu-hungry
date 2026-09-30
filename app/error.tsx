"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="card mx-auto max-w-xl p-8 text-center"><p className="eyebrow">Có lỗi xảy ra</p><h1 className="mt-2 text-2xl font-black">Chưa thể tải nội dung</h1><p className="mt-3 text-sm text-[var(--color-muted)]">Vui lòng thử lại sau ít phút.</p><button type="button" onClick={reset} className="button button-primary mt-5">Thử lại</button></div>;
}
