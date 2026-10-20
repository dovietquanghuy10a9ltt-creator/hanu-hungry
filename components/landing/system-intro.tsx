import { RevealOnScroll } from "@/components/shared/reveal-on-scroll";
import Image from "next/image";
import Link from "next/link";
import { BlogNewsWidget } from "@/components/shared/blog-news-widget";
import type { BlogPostSummary } from "@/features/blog/data";

export function SystemIntro({ recentPosts = [] }: { recentPosts?: BlogPostSummary[] }) {
  const features = [
    {
      icon: "/icons/nav/explore.png",
      tag: "Khám phá địa điểm",
      title: "Sổ địa điểm quanh trường",
      description: "Tra cứu danh sách quán ăn theo tên món, danh mục ẩm thực (cơm, bún phở, đồ ăn vặt, đồ uống...) hoặc khoảng giá min – max phù hợp túi tiền sinh viên.",
    },
    {
      icon: "/icons/nav/gacha.png",
      tag: "Gacha vũ trụ",
      title: "Để vũ trụ chọn giúp bạn",
      description: "Không biết ăn gì hay uống gì? Vòng quay Gacha với 3 chế độ riêng biệt: Gacha theo quán, Gacha theo đồ ăn và Gacha theo đồ uống sẽ giúp bạn có bữa ăn bất ngờ.",
    },
    {
      icon: "/icons/nav/home.png",
      tag: "Nhật ký ẩm thực",
      title: "Lưu giữ những bữa ngon",
      description: "Lưu lại những quán bạn đã ghé qua, theo dõi chuỗi ngày ăn ngon và thống kê hành trình khám phá ẩm thực quanh khu vực Đại học Hà Nội.",
    },
    {
      icon: "/icons/nav/blog.png",
      tag: "Review thực tế",
      title: "Chia sẻ từ sinh viên Hanu",
      description: "Đọc những cảm nhận và đánh giá chân thực từ cộng đồng sinh viên Hanu; đóng góp nhận xét của chính bạn về món ăn và không gian quán.",
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section với poster banner Ảnh 4 */}
      <section className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.35fr)_340px]">
<div className="relative overflow-hidden flex flex-col justify-between rounded-3xl border border-[var(--color-line)] bg-[#fffdf8] p-8 sm:p-12 shadow-sm">
          {/* Background Thám tử Macaron thu nhỏ vừa vặn ở phía bên phải với độ mờ 60% */}
          <div
            className="pointer-events-none absolute inset-4 sm:inset-6 z-0 flex items-center justify-end overflow-hidden"
            aria-hidden="true"
          >
            <div
              className="h-full w-full sm:w-[48%] lg:w-[44%] rounded-2xl"
              style={{
                backgroundImage: "url('/brand/detective-macaron.jpg')",
                opacity: 0.6,
                backgroundSize: "contain",
                backgroundPosition: "center right",
                backgroundRepeat: "no-repeat",
              }}
            />
          </div>
          {/* Lớp nền trắng sạch 100% bên trái che hoàn toàn họa tiết sau chữ */}
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-[#fffdf8] from-45% via-[#fffdf8]/90 via-60% to-transparent sm:w-[70%]"
            aria-hidden="true"
          />
          <div className="relative z-10 space-y-6 max-w-lg lg:max-w-xl">
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

      {/* Main features + Blog News Widget (Ảnh 1) */}
      <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1.1fr)]">
        <div className="space-y-6">
          <div>
            <p className="eyebrow">Tiện ích dành riêng cho bạn</p>
            <h2 className="section-title mt-2">Các tính năng nổi bật của hệ thống</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)] sm:text-base">
              Đăng nhập vào hệ thống để mở khóa toàn bộ tiện ích:
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature, idx) => (
              <RevealOnScroll key={idx} delay={idx * 90} className="h-full">
                <article className="card flex h-full flex-col justify-between p-6 transition-transform hover:-translate-y-1">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-pale)] px-3 py-1 text-xs font-bold text-[var(--color-red)]">
                    <Image src={feature.icon} alt="" width={16} height={16} unoptimized className="object-contain shrink-0" />
                    <span>{feature.tag}</span>
                  </span>
                  <h3 className="mt-4 text-xl font-black text-[var(--color-ink)]">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">{feature.description}</p>
                </div>
                <div className="mt-6 border-t border-[var(--color-line)] pt-4">
                  <Link href="/login" className="text-sm font-bold text-[var(--color-red)] hover:underline">
                    Đăng nhập để trải nghiệm →
                  </Link>
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
