import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Điều khoản Dịch vụ",
  description: "Điều khoản sử dụng và quy ước cộng đồng sinh viên văn minh trên nền tảng Hanu Hungry.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl py-6 sm:py-10">
      <div className="rounded-3xl border border-[var(--color-line)] bg-white/80 p-6 shadow-sm backdrop-blur sm:p-10">
        <div className="border-b border-[var(--color-line)] pb-6">
          <span className="inline-block rounded-full bg-[var(--color-pale)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--color-red)]">
            Quy ước cộng đồng
          </span>
          <h1 className="brand-display mt-3 text-2xl text-[var(--color-red)] sm:text-4xl">
            Điều khoản Dịch vụ
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Chào mừng bạn đến với cộng đồng ẩm thực sinh viên Đại học Hà Nội (HANU)
          </p>
        </div>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-[var(--color-ink)] sm:text-base">
          <section>
            <h2 className="font-heading text-lg font-bold text-[var(--color-ink)] sm:text-xl">
              1. Chấp thuận Điều khoản
            </h2>
            <p className="mt-2">
              Khi đăng ký tài khoản hoặc sử dụng website <strong>Hanu Hungry</strong>, bạn đồng ý tuân thủ các quy tắc văn minh cộng đồng
              và điều khoản được nêu tại trang này.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-[var(--color-ink)] sm:text-xl">
              2. Chuẩn mực Đánh giá & Bình luận (Review)
            </h2>
            <ul className="mt-2 list-disc pl-5 space-y-2">
              <li>
                <strong>Trung thực & khách quan:</strong> Đánh giá cần dựa trên trải nghiệm thực tế của chính bạn khi dùng bữa tại quán.
              </li>
              <li>
                <strong>Văn minh & tôn trọng:</strong> Nghiêm cấm mọi hành vi sử dụng từ ngữ xúc phạm, thô tục, kỳ thị, vu khống hoặc công kích cá nhân nhắm vào chủ quán hay sinh viên khác.
              </li>
              <li>
                <strong>Chống cạnh tranh không lành mạnh:</strong> Nghiêm cấm các đánh giá nhằm mục đích hạ bệ đối thủ hoặc quảng cáo spam không liên quan. Ban quản trị có quyền ẩn hoặc gỡ bỏ các bình luận vi phạm mà không cần báo trước.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-[var(--color-ink)] sm:text-xl">
              3. Thông tin Thực đơn và Giá cả
            </h2>
            <p className="mt-2">
              Thông tin địa chỉ, menu và giá tiền trên Hanu Hungry được đội ngũ sinh viên khảo sát trực tiếp và cập nhật liên tục.
              Tuy nhiên, giá món ăn thực tế có thể thay đổi tùy thuộc vào thời điểm, chương trình khuyến mãi hoặc điều chỉnh của chủ quán.
              Chúng mình rất hoan nghênh các bạn báo cáo cập nhật qua trang{" "}
              <Link href="/contact" className="font-bold text-[var(--color-red)] underline hover:text-[#b32b35]">
                Liên hệ
              </Link>{" "}
              để dữ liệu luôn chính xác nhất.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-[var(--color-ink)] sm:text-xl">
              4. Giới hạn Trách nhiệm
            </h2>
            <p className="mt-2">
              Hanu Hungry là nền tảng chia sẻ thông tin và đánh giá ẩm thực phi thương mại. Chúng mình không trực tiếp kinh doanh,
              chế biến thực phẩm hay chịu trách nhiệm về dịch vụ ăn uống tại các quán ăn đối tác.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
