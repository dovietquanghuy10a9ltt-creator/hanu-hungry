import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SiteShell } from "@/components/layout/site-shell";
import { siteConfig } from "@/config/site";
import "./globals.css";

const hermeneus = localFont({ src: "./fonts/HermeneusOne-Regular.ttf", variable: "--font-body", display: "swap", weight: "400", fallback: ["Arial"] });
const calistoga = localFont({ src: "./fonts/Calistoga-Regular.ttf", variable: "--font-heading", display: "swap", weight: "400", fallback: ["Georgia"] });
const hennyPenny = localFont({ src: "./fonts/HennyPenny-Regular.ttf", variable: "--font-cosmic", display: "swap", weight: "400", fallback: ["Georgia"] });
const crayonette = localFont({ src: "./fonts/CrayonetteDJR.woff2", variable: "--font-crayonette", display: "swap", weight: "400", fallback: ["Georgia"] });
const hemgjord = localFont({ src: "./fonts/HemgjordLettering.otf", variable: "--font-hemgjord", display: "swap", weight: "400", fallback: ["var(--font-crayonette)", "Georgia", "serif"] });
const cdaMely = localFont({ src: "./fonts/CDAMeLyDisplay-Bold.woff2", variable: "--font-cda-mely", display: "swap", weight: "700", fallback: ["Arial", "sans-serif"] });

const siteUrl = "https://hanuhungry.id.vn";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hanu Hungry - Hôm nay ăn gì quanh Đại học Hà Nội (HANU)?",
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "Hanu Hungry",
    "quán ăn quanh HANU",
    "ăn gì ở HANU",
    "quán ăn sinh viên Đại học Hà Nội",
    "quán ngon Triều Khúc",
    "quán ngon Phùng Khoang",
    "Gacha chọn món",
    "review quán ăn HANU",
  ],
  authors: [{ name: "Macaron Team" }],
  creator: "Macaron Team - Hanu Hungry",
  publisher: "Hanu Hungry",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: siteUrl,
    siteName: siteConfig.name,
    title: "Hanu Hungry - Cẩm nang ăn uống quanh Đại học Hà Nội (HANU)",
    description:
      "Giải quyết câu hỏi 'Hôm nay ăn gì?' cho sinh viên HANU. Khám phá 50+ quán ăn ngon rẻ, review chi tiết và vòng quay Gacha chọn món ngẫu nhiên.",
  },
  twitter: {
    card: "summary",
    title: "Hanu Hungry - Hôm nay ăn gì quanh Đại học Hà Nội (HANU)?",
    description:
      "Khám phá 50+ quán ăn ngon, rẻ quanh Đại học Hà Nội. Xem review chân thực và quay Gacha chọn món trong 3 giây!",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/brand/logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/brand/logo.png" },
    ],
    shortcut: "/favicon.ico",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://hanuhungry.id.vn/#website",
      url: "https://hanuhungry.id.vn/",
      name: "Hanu Hungry",
      description: "Nền tảng gợi ý, review quán ăn và vòng quay Gacha chọn món quanh Đại học Hà Nội (HANU)",
      inLanguage: "vi-VN",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://hanuhungry.id.vn/restaurants?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "ItemList",
      itemListElement: [
        {
          "@type": "SiteNavigationElement",
          position: 1,
          name: "Khám phá Quán ăn",
          description: "Danh sách hơn 50+ quán ăn ngon, bún phở, cơm, đồ ăn vặt quanh trường HANU.",
          url: "https://hanuhungry.id.vn/restaurants",
        },
        {
          "@type": "SiteNavigationElement",
          position: 2,
          name: "Gacha Chọn món",
          description: "Vòng quay ngẫu nhiên giúp bạn quyết định trưa nay, tối nay ăn gì trong 3 giây.",
          url: "https://hanuhungry.id.vn/gacha",
        },
        {
          "@type": "SiteNavigationElement",
          position: 3,
          name: "Blog Ẩm thực",
          description: "Bài viết review chi tiết, cẩm nang ăn uống và các góc ẩm thực quanh HANU.",
          url: "https://hanuhungry.id.vn/blog",
        },
        {
          "@type": "SiteNavigationElement",
          position: 4,
          name: "Đăng nhập",
          description: "Đăng nhập tài khoản sinh viên HANU để lưu quán yêu thích và viết review.",
          url: "https://hanuhungry.id.vn/login",
        },
        {
          "@type": "SiteNavigationElement",
          position: 5,
          name: "Về chúng mình",
          description: "Câu chuyện thành lập Hanu Hungry và đội ngũ sinh viên Macaron.",
          url: "https://hanuhungry.id.vn/about",
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${hermeneus.variable} ${calistoga.variable} ${hennyPenny.variable} ${crayonette.variable} ${hemgjord.variable} ${cdaMely.variable}`}>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:p-3">Tới nội dung chính</a>
        <SiteShell>{children}</SiteShell>
        <Analytics />
      </body>
    </html>
  );
}
