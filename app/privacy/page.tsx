import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chính sách Bảo mật Quyền riêng tư",
  description: "Chính sách bảo vệ quyền riêng tư và minh bạch mục đích sử dụng dữ liệu sinh viên trên Hanu Hungry.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl py-6 sm:py-10">
      <div className="rounded-3xl border border-[var(--color-line)] bg-white/80 p-6 shadow-sm backdrop-blur sm:p-10">
        <div className="border-b border-[var(--color-line)] pb-6">
          <span className="inline-block rounded-full bg-[var(--color-pale)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--color-red)]">
            Minh bạch dữ liệu
          </span>
          <h1 className="brand-display mt-3 text-2xl text-[var(--color-red)] sm:text-4xl">
            Chính sách Bảo mật Quyền riêng tư
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Cập nhật lần cuối: Tháng 10/2026 • Áp dụng cho cộng đồng sinh viên Đại học Hà Nội (HANU)
          </p>
        </div>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-[var(--color-ink)] sm:text-base">
          <section>
            <h2 className="font-heading text-lg font-bold text-[var(--color-ink)] sm:text-xl">
              1. Mục đích và Tôn chỉ Dự án
            </h2>
            <p className="mt-2">
              <strong>Hanu Hungry</strong> là một dự án phi thương mại được sáng lập và duy trì bởi nhóm sinh viên Macaron,
              với mục tiêu hỗ trợ sinh viên trường Đại học Hà Nội (HANU) khám phá các quán ăn ngon, rẻ tại Khu vực quanh trường Đại học Hà Nội (HANU), đường Nguyễn Trãi, Thanh Xuân, Hà Nội
              và giải quyết câu hỏi thường nhật <em>&quot;Hôm nay ăn gì?&quot;</em>.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-[var(--color-ink)] sm:text-xl">
              2. Dữ liệu Thu thập và Mục đích Sử dụng
            </h2>
            <div className="mt-3 space-y-4">
              <div className="rounded-2xl bg-[var(--color-pale)]/50 p-4 border border-[var(--color-line)]/50">
                <h3 className="font-bold text-[var(--color-red)]">Mã số sinh viên (MSSV)</h3>
                <p className="mt-1 text-sm">
                  Được dùng làm định danh tài khoản để đảm bảo chỉ sinh viên HANU mới có thể tham gia viết đánh giá và chấm điểm quán ăn.
                  Điều này giúp chống review ảo từ bên ngoài. Hệ thống <strong>không lưu trữ</strong> bất kỳ hồ sơ điểm số hay dữ liệu học vụ nào từ nhà trường.
                </p>
              </div>

              <div className="rounded-2xl bg-[var(--color-pale)]/50 p-4 border border-[var(--color-line)]/50">
                <h3 className="font-bold text-[var(--color-red)]">Địa chỉ Email</h3>
                <p className="mt-1 text-sm">
                  Được sử dụng độc quyền cho mục đích xác thực đăng ký tài khoản và gửi liên kết đặt lại mật khẩu khi bạn quên.
                  Chúng mình <strong>cam kết 100% không bao giờ</strong> gửi email quảng cáo, tiếp thị thương mại hay làm phiền bạn.
                </p>
              </div>

              <div className="rounded-2xl bg-[var(--color-pale)]/50 p-4 border border-[var(--color-line)]/50">
                <h3 className="font-bold text-[var(--color-red)]">Lịch sử Check-in và Đánh giá quán</h3>
                <p className="mt-1 text-sm">
                  Phục vụ tính năng theo dõi thói quen ăn uống của riêng bạn (chuỗi ngày ăn Streak, quán quen) và hiển thị điểm đánh giá
                  trung bình để các bạn sinh viên khác có cái nhìn khách quan trước khi đến quán.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-[var(--color-ink)] sm:text-xl">
              3. Cam kết Bảo mật & Không Chia sẻ cho Bên Thứ ba
            </h2>
            <p className="mt-2">
              Toàn bộ dữ liệu mật khẩu được mã hóa một chiều (hashing an toàn) và quản lý qua hạ tầng Supabase đạt tiêu chuẩn bảo mật quốc tế.
              Chúng mình <strong>tuyệt đối không bán, không chuyển giao và không thương mại hóa</strong> bất kỳ thông tin nào của sinh viên cho các đối tác quảng cáo bên ngoài.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-[var(--color-ink)] sm:text-xl">
              4. Quyền của Bạn đối với Dữ liệu Cá nhân
            </h2>
            <p className="mt-2">
              Bạn có toàn quyền chỉnh sửa tên hiển thị, ảnh đại diện, hoặc yêu cầu xóa toàn bộ lịch sử check-in, đánh giá và tài khoản của mình
              khỏi hệ thống bất kỳ lúc nào thông qua trang{" "}
              <Link href="/support" className="font-bold text-[var(--color-red)] underline hover:text-[#b32b35]">
                Câu hỏi thường gặp (FAQ) & Hỗ trợ
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
