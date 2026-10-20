import Link from "next/link";
import type { Metadata } from "next";
import { SocialIconsRow, ContactDirectDetails } from "@/components/shared/social-links";

export const metadata: Metadata = {
  title: "Về chúng mình",
  description:
    "Tìm hiểu câu chuyện thành lập Hanu Hungry bởi nhóm sinh viên Macaron, sứ mệnh kết nối và giải quyết câu hỏi 'Hôm nay ăn gì?' cho sinh viên Đại học Hà Nội.",
  alternates: {
    canonical: "https://hanuhungry.id.vn/about",
  },
  openGraph: {
    title: "Về chúng mình - Nhóm Macaron | Hanu Hungry",
    description:
      "Câu chuyện ra đời của Hanu Hungry - Sổ tay ẩm thực được tạo ra bởi sinh viên HANU, vì sinh viên HANU.",
    url: "https://hanuhungry.id.vn/about",
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-12">
      {/* Hero Banner */}
      <div className="brand-gradient rounded-[2rem] px-6 py-12 text-white sm:px-12 shadow-lg">
        <p className="text-xs font-extrabold uppercase tracking-widest opacity-90">
          Về Chúng Mình · Đội Ngũ Macaron
        </p>
        <h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl text-white">
          Hanu Hungry
        </h1>
        <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-white/95 font-medium">
          Macaron - gửi lời chào thân ái đến Hanuer!!! 💌
        </p>
        <p className="mt-2 text-sm sm:text-base leading-relaxed text-white/85">
          Hanu Hungry được thành lập vào năm 2026 - được xây dựng bởi <strong>Macaron</strong> (nhóm những người gặp khó khăn trong việc chọn món ở Hanu).
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6">
        {/* Hanu Hungry là gì? */}
        <section className="card p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-[var(--color-red)] font-bold text-sm uppercase tracking-wider">
            <span>🍽️</span> Giới thiệu
          </div>
          <h2 className="text-2xl font-black text-[var(--color-ink)]">
            Hanu Hungry là gì?
          </h2>
          <p className="text-base leading-relaxed text-[var(--color-muted)]">
            Hanu Hungry là website khám phá đồ ăn dành cho sinh viên Trường Đại học Hà Nội, giúp bạn dễ dàng tìm kiếm và khám phá các địa điểm ăn uống xung quanh Hanu. Từ món ăn, thực đơn, mức giá đến địa điểm, chúng mình tập hợp những thông tin cần thiết để việc lựa chọn đồ ăn trở nên đơn giản và thuận tiện hơn.
          </p>
        </section>

        {/* Tại sao chúng mình tạo ra Hanu Hungry? */}
        <section className="card p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-[var(--color-red)] font-bold text-sm uppercase tracking-wider">
            <span>💡</span> Câu chuyện khởi đầu
          </div>
          <h2 className="text-2xl font-black text-[var(--color-ink)]">
            Tại sao chúng mình tạo ra Hanu Hungry?
          </h2>
          <p className="text-base leading-relaxed text-[var(--color-muted)]">
            Bắt nguồn từ một câu hỏi vốn quen thuộc nhưng thật khó để trả lời: <strong className="text-[var(--color-red)] font-extrabold">HÔM NAY ĂN GÌ?</strong> Macaron xây dựng Hanu Hungry nhằm giúp các bạn sinh viên dễ dàng tìm được lựa chọn phù hợp, thay vì phải tìm kiếm thông tin ở nhiều nơi hay mất quá nhiều thời gian để quyết định.
          </p>
        </section>

        {/* Mục tiêu của chúng mình là gì nhỉ? */}
        <section className="card p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-[var(--color-red)] font-bold text-sm uppercase tracking-wider">
            <span>🎯</span> Sứ mệnh & Mục tiêu
          </div>
          <h2 className="text-2xl font-black text-[var(--color-ink)]">
            Mục tiêu của chúng mình là gì nhỉ?
          </h2>
          <p className="text-base leading-relaxed text-[var(--color-muted)]">
            Chúng mình mong rằng Hanu Hungry không chỉ giúp Hanuer tìm được quán ăn một cách nhanh chóng để lấp đầy chiếc bụng đói sau giờ học căng thẳng mà còn giúp Hanuer cùng bạn bè khám phá ra được nhiều quán mới, được thưởng thức thêm nhiều đồ ăn ngon quanh Hanu và có thêm thật nhiều kỉ niệm với Hanu nhé ạ!
          </p>
        </section>

        {/* Ai là người đứng sau Hanu Hungry? */}
        <section className="card p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-[var(--color-red)] font-bold text-sm uppercase tracking-wider">
            <span>👥</span> Đội ngũ sáng lập
          </div>
          <h2 className="text-2xl font-black text-[var(--color-ink)]">
            Ai là người đứng sau Hanu Hungry?
          </h2>
          <p className="text-base leading-relaxed text-[var(--color-muted)]">
            Chúng mình là <strong>Macaron</strong> - một đội ngũ nhỏ gồm các thành viên đến từ Khoa Quản trị Kinh doanh và Du lịch, Trường Đại học Hà Nội. Không chỉ là một dự án môn học, chúng mình cũng như những sinh viên khác, bọn mình từng không ít lần đau đầu với câu hỏi “Hôm nay ăn gì?” và Hanu Hungry là đứa con tinh thần mà Macaron ấp ủ từ những lần đau đầu đó.
          </p>
          <p className="text-base leading-relaxed text-[var(--color-muted)] pt-1">
            Nếu bạn muốn phản hồi, cần giúp đỡ hoặc muốn chia sẻ thêm những quán lowkey quanh trường thì có thể liên hệ bọn mình qua <strong>hanuhungry.mcr</strong> ở Instagram hoặc Threads nha.
          </p>
        </section>

        {/* Kêu gọi hành động & Mạng xã hội */}
        <section className="card p-6 sm:p-8 bg-[#fffcf5] border-[var(--color-line)] space-y-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--color-ink)]">
              Cùng Hanu Hungry khám phá ngay thôi nào!
            </h2>
            <p className="mt-2 text-base leading-relaxed text-[var(--color-muted)]">
              Vậy thì, còn chần chờ gì nữa, hãy cùng Hanu Hungry bắt đầu hành trình khám phá những món ngon quanh Hanu ngay thôi nào! Và đừng quên theo dõi thêm hành trình của chúng mình tại:
            </p>
          </div>

          {/* Social Icons & Contact Info */}
          <div className="space-y-4 pt-1">
            <SocialIconsRow />
            <div className="border-t border-[var(--color-line)] pt-4">
              <ContactDirectDetails />
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Link href="/restaurants" className="button button-primary">
          Khám phá các quán ăn quanh Hanu ↗
        </Link>
        <Link href="/contact" className="button button-secondary">
          Gửi tin nhắn liên hệ cho nhóm
        </Link>
      </div>
    </div>
  );
}
