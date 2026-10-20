import Link from "next/link";
import type { Metadata } from "next";
import { sendContactMessage } from "@/features/contact/actions";
import { getCurrentProfile } from "@/lib/auth/session";
import { SocialIconsRow, ContactDirectDetails } from "@/components/shared/social-links";

export const metadata: Metadata = {
  title: "Liên hệ & Góp ý",
  description:
    "Gửi phản hồi, đóng góp thông tin quán ăn mới hoặc liên hệ hợp tác cùng đội ngũ phát triển Hanu Hungry - Đại học Hà Nội.",
  alternates: {
    canonical: "https://hanuhungry.id.vn/contact",
  },
  openGraph: {
    title: "Liên hệ & Góp ý | Hanu Hungry",
    description:
      "Góp ý dữ liệu, báo thông tin quán cần cập nhật hoặc chia sẻ ý tưởng cùng nhóm Macaron.",
    url: "https://hanuhungry.id.vn/contact",
  },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const [params, account] = await Promise.all([searchParams, getCurrentProfile()]);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="eyebrow">Kết nối với nhóm</p>
        <h1 className="section-title mt-2">Liên hệ Hanu Hungry</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
          Góp ý dữ liệu, báo thông tin quán cần cập nhật hoặc chia sẻ ý tưởng cùng nhóm Macaron.
        </p>
      </div>

      {/* Direct Contact & Social Card */}
      <div className="card p-5 sm:p-6 bg-[#fffcf5] border-[var(--color-line)] space-y-4">
        <h2 className="text-base font-extrabold text-[var(--color-ink)] flex items-center gap-2">
          <span>📞</span> Thông tin liên hệ trực tiếp
        </h2>
        <ContactDirectDetails />
        <div className="border-t border-[var(--color-line)] pt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold text-[var(--color-muted)]">
            Theo dõi chúng mình trên các nền tảng:
          </span>
          <SocialIconsRow />
        </div>
      </div>

      {params.sent && (
        <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          Cảm ơn bạn! Tin nhắn đã được gửi tới nhóm Macaron.
        </p>
      )}

      {account ? (
        <form action={sendContactMessage} className="card space-y-4 p-5 sm:p-7">
          <h2 className="text-lg font-bold text-[var(--color-ink)]">Gửi lời nhắn trực tuyến</h2>
          <label className="block text-sm font-bold">
            Nội dung
            <textarea
              name="message"
              rows={6}
              maxLength={5000}
              required
              placeholder="Bạn muốn nhắn điều gì cho nhóm Macaron?"
              className="field mt-1.5 min-h-36 resize-y"
            />
          </label>
          <div className="hidden" aria-hidden="true">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <button type="submit" className="button button-primary w-full sm:w-auto">
            Gửi liên hệ
          </button>
        </form>
      ) : (
        <div className="card p-6 text-sm text-[var(--color-muted)]">
          Vui lòng{" "}
          <Link href="/login?next=%2Fcontact" className="font-bold text-[var(--color-red)]">
            đăng nhập
          </Link>{" "}
          để gửi góp ý trực tuyến qua biểu mẫu.
        </div>
      )}
    </div>
  );
}
