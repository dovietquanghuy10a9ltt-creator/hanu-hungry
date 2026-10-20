import Image from "next/image";
import Link from "next/link";
import { FooterSocialButtons, CONTACT_INFO } from "@/components/shared/social-links";
import { ScrollToTopButton } from "@/components/layout/scroll-to-top";

export function SiteFooter() {
  return (
    <footer
      className="relative overflow-hidden text-[#fdfbf7] pb-28 md:pb-8 pt-12 sm:pt-16 shadow-2xl"
      style={{
        background: "linear-gradient(180deg, #8b1f28 0%, #741720 100%)",
        borderTop: "3px solid #631118",
      }}
    >
      {/* Decorative Cloud SVG Flourishes - matching the reference aesthetic */}
      <div
        className="pointer-events-none absolute -left-10 top-12 opacity-15 select-none hidden lg:block"
        aria-hidden="true"
      >
        <svg width="220" height="120" viewBox="0 0 220 120" fill="none">
          <path
            d="M20 90C10 90 0 80 0 70C0 58 10 48 22 48C25 28 42 12 65 12C85 12 102 26 107 44C114 38 123 35 132 35C148 35 162 48 162 64C172 64 180 72 180 82C180 92 172 100 162 100H20C15 100 10 96 10 90H20Z"
            fill="#ffffff"
          />
        </svg>
      </div>

      <div
        className="pointer-events-none absolute -right-10 top-20 opacity-15 select-none hidden lg:block"
        aria-hidden="true"
      >
        <svg width="240" height="130" viewBox="0 0 240 130" fill="none">
          <path
            d="M40 95C25 95 10 82 10 68C10 52 24 40 40 40C44 18 68 0 98 0C124 0 146 16 153 38C162 30 174 26 186 26C208 26 226 43 226 64C238 64 248 74 248 86C248 98 238 108 226 108H40V95Z"
            fill="#ffffff"
          />
        </svg>
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main 4-column layout */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Column 1: Brand & Slogan */}
          <div className="space-y-4 lg:col-span-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 transition-transform hover:scale-102"
              aria-label="Hanu Hungry - Trang chủ"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 p-1.5 backdrop-blur-xs">
                <Image
                  src="/brand/logo.png"
                  alt=""
                  width={36}
                  height={36}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="brand-display text-2xl font-black tracking-wide text-white drop-shadow-xs">
                Hanu Hungry
              </span>
            </Link>

            <div className="space-y-1.5 text-sm text-[#f5d9d7]">
              <p className="font-semibold text-white">
                Ăn ngon quanh Hanu, khỏi lo nghĩ nhiều.
              </p>
              <p className="text-xs leading-relaxed text-[#f5d9d7]/85">
                Một góc nhìn hôm nay, một tình yêu ở lại. Đồng hành cùng bữa ăn mỗi ngày của Hanuers.
              </p>
              <p className="pt-2 text-[11px] text-[#f5d9d7]/70">
                Dự án phi lợi nhuận phát triển bởi <strong>Đội ngũ Macaron</strong> · Trường Đại học Hà Nội.
              </p>
            </div>
          </div>

          {/* Column 2: Khám phá */}
          <div className="space-y-3.5 lg:col-span-2 lg:pl-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/95">
              Khám phá
            </h3>
            <ul className="space-y-2 text-xs font-medium text-[#f5d9d7]">
              <li>
                <Link href="/restaurants" className="transition-colors hover:text-white hover:underline">
                  Quán ăn quanh trường
                </Link>
              </li>
              <li>
                <Link href="/gacha" className="transition-colors hover:text-white hover:underline">
                  Gacha hôm nay ăn gì
                </Link>
              </li>
              <li>
                <Link href="/blog" className="transition-colors hover:text-white hover:underline">
                  Góc ẩm thực & mẹo
                </Link>
              </li>
              <li>
                <Link href="/history" className="transition-colors hover:text-white hover:underline">
                  Lịch sử quay & quán quen
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Gặp gỡ */}
          <div className="space-y-3.5 lg:col-span-3 lg:pl-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/95">
              Gặp gỡ & Trợ giúp
            </h3>
            <ul className="space-y-2 text-xs font-medium text-[#f5d9d7]">
              <li>
                <Link href="/about" className="transition-colors hover:text-white hover:underline">
                  Về dự án Macaron
                </Link>
              </li>
              <li>
                <Link href="/support" className="transition-colors hover:text-white hover:underline font-semibold text-white">
                  Câu hỏi thường gặp (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-white hover:underline">
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-white hover:underline">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Kết nối với chúng mình */}
          <div className="space-y-3.5 lg:col-span-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/95">
              Kết nối với chúng mình
            </h3>
            <div className="space-y-2 text-xs text-[#f5d9d7]">
              <p>
                Hotline:{" "}
                <a
                  href={CONTACT_INFO.phoneHref}
                  className="font-bold text-white transition-colors hover:underline"
                >
                  {CONTACT_INFO.phone}
                </a>
              </p>
              <p className="break-all">
                Email:{" "}
                <a
                  href={CONTACT_INFO.emailHref}
                  className="font-bold text-white transition-colors hover:underline"
                >
                  {CONTACT_INFO.email}
                </a>
              </p>
              <div className="pt-2">
                <p className="mb-2 text-[11px] font-semibold text-[#f5d9d7]/80 uppercase tracking-wider">
                  Mạng xã hội
                </p>
                <FooterSocialButtons />
              </div>
            </div>
          </div>
        </div>

        {/* Divider line matching reference */}
        <div className="my-8 border-t border-white/20" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 text-xs text-[#f5d9d7]/85 sm:flex-row">
          <p className="text-center sm:text-left">
            © 2026 <strong>HANU HUNGRY</strong> · Dự án sinh viên Macaron
          </p>
          <p className="hidden text-center text-xs text-[#f5d9d7]/70 md:block">
            Từ một chiếc bụng đói, đến những bữa ngon quanh Hanu.
          </p>
          <ScrollToTopButton />
        </div>
      </div>
    </footer>
  );
}
