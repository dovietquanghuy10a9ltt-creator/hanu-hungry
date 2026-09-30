import Link from "next/link";
import type { Metadata } from "next";
import { sendContactMessage } from "@/features/contact/actions";
import { getCurrentProfile } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Liên hệ" };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const [params, account] = await Promise.all([searchParams, getCurrentProfile()]);
  return (
    <div className="mx-auto max-w-2xl space-y-6"><div><p className="eyebrow">Kết nối với nhóm</p><h1 className="section-title mt-2">Liên hệ HANU Hungry</h1><p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">Góp ý dữ liệu, báo thông tin quán cần cập nhật hoặc chia sẻ ý tưởng cho website.</p></div>
      {params.sent && <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">Cảm ơn bạn! Tin nhắn đã được gửi.</p>}
      {account ? <form action={sendContactMessage} className="card space-y-4 p-5 sm:p-7"><label className="block text-sm font-bold">Tên của bạn<input name="name" defaultValue={account.profile.display_name} maxLength={150} required className="field mt-1.5" /></label><label className="block text-sm font-bold">Email liên hệ<input type="email" name="email" defaultValue={account.user.email || ""} maxLength={320} required className="field mt-1.5" /></label><label className="block text-sm font-bold">Nội dung<textarea name="message" rows={6} maxLength={5000} required placeholder="Bạn muốn nhắn điều gì?" className="field mt-1.5 min-h-36 resize-y" /></label><div className="hidden" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div><button type="submit" className="button button-primary w-full sm:w-auto">Gửi liên hệ</button></form> : <div className="card p-6 text-sm text-[var(--color-muted)]">Vui lòng <Link href="/login?next=%2Fcontact" className="font-bold text-[var(--color-red)]">đăng nhập</Link> để gửi góp ý.</div>}
    </div>
  );
}
