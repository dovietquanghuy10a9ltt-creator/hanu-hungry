import { RevealOnScroll } from "@/components/shared/reveal-on-scroll";
import Link from "next/link";
import { BlogNewsWidget } from "@/components/shared/blog-news-widget";
import type { BlogPostSummary } from "@/features/blog/data";
import { Compass, Sparkles, BookOpen, MessageSquareHeart } from "lucide-react";

export function SystemIntro({ recentPosts = [] }: { recentPosts?: BlogPostSummary[] }) {
  const features = [
    {
      Icon: Compass,
      tag: "Khám phá địa điểm",
      badgeClass: "bg-[#9E3B33] text-white border border-[#7A2822]",
      title: "Sổ địa điểm quanh trường",
      description: "Tra cứu danh sách quán ăn theo tên món, danh mục ẩm thực (cơm, bún phở, đồ ăn vặt, đồ uống...) hoặc khoảng giá min – max phù hợp túi tiền sinh viên.",
    },
    {
      Icon: Sparkles,
      tag: "Gacha vũ trụ",
      badgeClass: "bg-[#C87D4B] text-white border border-[#A35E30]",
      title: "Để vũ trụ chọn giúp bạn",
      description: "Không biết ăn gì hay uống gì? Vòng quay Gacha với 3 chế độ riêng biệt: Gacha theo quán, Gacha theo đồ ăn và Gacha theo đồ uống sẽ giúp bạn có bữa ăn bất ngờ.",
    },
    {
      Icon: BookOpen,
      tag: "Nhật ký ẩm thực",
      badgeClass: "bg-[#C5D1B8] text-[#3A2618] border border-[#A3B194]",
      title: "Lưu giữ những bữa ngon",
      description: "Lưu lại những quán bạn đã ghé qua, theo dõi chuỗi ngày ăn ngon và thống kê hành trình khám phá ẩm thực quanh khu vực Đại học Hà Nội.",
    },
    {
      Icon: MessageSquareHeart,
      tag: "Review thực tế",
      badgeClass: "bg-[#F4C978] text-[#3A2618] border border-[#D9AA52]",
      title: "Chia sẻ từ sinh viên Hanu",
      description: "Đọc những cảm nhận và đánh giá chân thực từ cộng đồng sinh viên Hanu; đóng góp nhận xét của chính bạn về món ăn và không gian quán.",
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section với poster banner Ảnh 4 */}
      <section className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.35fr)_340px]">
        <div className="flex flex-col justify-between rounded-3xl border border-[var(--color-line)] bg-[#fffdf8] p-8 sm:p-12 shadow-sm">
          <div className="space-y-6 max-w-lg lg:max-w-xl">
            <p className="eyebrow">Sổ tay ẩm thực · Đại học Hà Nội</p>
            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl text-[var(--color-ink)]">
              Hanu Hungry
            </h1>
            <p className="text-lg font-black text-[var(--color-red)] sm:text-xl">
              Quanh trường · Quanh bàn · Quanh một bữa ngon.
            </p>
            <div className="space-y-3 text-[15px] sm:text-base leading-relaxed text-[#1a1210] font-medium">
              <p className="font-extrabold text-[var(--color-red)] text-sm sm:text-base">
                Macaron - gửi lời chào thân ái đến Hanuer!!! 💌
              </p>
              <p className="text-[#1a1210]">
                Hanu Hungry được thành lập vào năm 2026 - được xây dựng bởi <strong className="text-[var(--color-red)] font-extrabold">Macaron</strong> (nhóm những người gặp khó khăn trong việc chọn món ở Hanu).
              </p>
              <p className="text-[#1a1210]">
                Hanu Hungry là website khám phá đồ ăn dành cho sinh viên Trường Đại học Hà Nội, giúp bạn dễ dàng tìm kiếm và khám phá các địa điểm ăn uống xung quanh Hanu. Từ món ăn, thực đơn, mức giá đến địa điểm, chúng mình tập hợp những thông tin cần thiết để việc lựa chọn đồ ăn trở nên đơn giản và thuận tiện hơn.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/login" className="button button-primary px-6 py-3 text-base">
                Đăng nhập để khám phá ↗
              </Link>
              <Link href="/register" className="button button-secondary px-6 py-3 text-base">
                Tạo tài khoản mới
              </Link>
            </div>
          </div>
          <div className="relative z-10 mt-8 border-t border-[var(--color-line)] pt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-[#2a1d1a]">
              <span>✓ 50+ quán quanh trường</span>
              <span>✓ 900+ món ăn & đồ uống</span>
              <span>✓ Dữ liệu khảo sát thực tế sinh viên Hanu</span>
            </div>
          </div>
        </div>

        {/* Poster banner phong cách ảnh 4 */}
        <div className="hero-poster hidden md:flex flex-col justify-between">
          <div className="poster-top">
            <span>HÀ NỘI</span>
            <span>ĂN GÌ / 01</span>
          </div>
          <div className="poster-word">
            đói<br /><span>chưa?</span>
          </div>
          <div className="poster-orbit" aria-hidden="true">✳</div>
          <div className="poster-note">
            Đi một vòng nhỏ.<br />Gặp một quán ngon.
          </div>
          <Link href="/login" className="poster-link">
            Để vũ trụ chọn giúp <span>↗</span>
          </Link>
        </div>
      </section>

      {/* Main features + Blog News Widget */}
      <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1.1fr)]">
        <div className="space-y-6">
          <div>
            <p className="eyebrow">Tiện ích dành riêng cho bạn</p>
            <h2 className="section-title mt-2">Các tính năng nổi bật của hệ thống</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)] sm:text-base">
              Đăng nhập vào hệ thống để mở khóa toàn bộ tiện ích:
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 pt-2">
            {features.map((feature, idx) => (
              <RevealOnScroll key={idx} delay={idx * 90} className="h-full">
                <article className="group relative flex h-full flex-col justify-between rounded-2xl border-2 border-[#4A3525] bg-[#FDFBF7] p-6 sm:p-7 shadow-[0_6px_0_0_#D8C8B4,0_8px_16px_rgba(74,53,37,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_0_0_#D8C8B4,0_12px_20px_rgba(74,53,37,0.12)]">
                  {/* Nội dung text tương tác */}
                  <div className="flex h-full flex-col justify-between">
                    <div>
                      {/* Badge phân biệt màu sắc kiểu sticker với Lucide icon */}
                      <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs md:text-sm font-semibold shadow-sm ${feature.badgeClass}`}>
                        <feature.Icon className="h-4 w-4 shrink-0" />
                        <span>{feature.tag}</span>
                      </span>

                      {/* Tiêu đề */}
                      <h3 className="mt-4 w-full font-serif text-2xl md:text-[28px] font-bold text-[#2D1E17] leading-[1.2] tracking-tight">
                        {feature.title}
                      </h3>

                      {/* Mô tả tính năng */}
                      <p className="mt-3.5 text-[#4E3E34] text-sm md:text-[15px] leading-relaxed w-full font-medium">
                        {feature.description}
                      </p>
                    </div>

                    {/* Footer của Card có đường kẻ ngang và nút CTA */}
                    <div className="border-t border-[#E6DEC8] mt-6 pt-3">
                      <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 text-sm md:text-[15px] font-bold text-[#8C1D18] hover:text-[#63120E] transition-colors"
                      >
                        <span>Đăng nhập để trải nghiệm</span>
                        <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5">→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>

        {/* Widget TIN TỨC kiểu Ảnh 1 */}
        <div className="sticky top-24">
          <BlogNewsWidget posts={recentPosts} title="TIN TỨC" />
        </div>
      </section>

      {/* Sửa triệt để lỗi màu chữ ở Ảnh 2: Banner đỏ đậm với chữ trắng tương phản cao */}
      <RevealOnScroll><section
        className="relative overflow-hidden rounded-3xl p-8 sm:p-12 text-white shadow-xl"
        style={{ background: "linear-gradient(135deg, #8c1d24 0%, #b52a34 100%)", border: "1px solid #b52a34" }}
      >
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-block rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">
            Gia nhập cộng đồng Hanu Hungry
          </span>
          <h2 className="text-3xl font-black leading-tight sm:text-4xl text-white">
            Sẵn sàng cho bữa ngon tiếp theo?
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-white/90">
            Đăng nhập bằng tài khoản của bạn để mở khóa toàn bộ tính năng tìm kiếm, quay Gacha, lưu nhật ký và chia sẻ đánh giá.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              href="/login"
              className="inline-block rounded-full bg-[#fffdf8] px-6 py-3 text-sm font-black text-[#8c1d24] shadow-md transition-transform hover:scale-105 hover:bg-white"
            >
              Đăng nhập ngay ↗
            </Link>
            <Link
              href="/register"
              className="inline-block rounded-full border border-white/60 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/15"
            >
              Tạo tài khoản mới
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 select-none text-[150px] leading-none text-white/10" aria-hidden="true">
          ✦
        </div>
      </section></RevealOnScroll>
    </div>
  );
}
