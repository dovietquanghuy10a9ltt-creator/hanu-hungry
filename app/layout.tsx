import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteShell } from "@/components/layout/site-shell";
import { siteConfig } from "@/config/site";
import "./globals.css";

const hermeneus = localFont({ src: "./fonts/HermeneusOne-Regular.ttf", variable: "--font-body", display: "swap", weight: "400", fallback: ["Arial"] });
const calistoga = localFont({ src: "./fonts/Calistoga-Regular.ttf", variable: "--font-heading", display: "swap", weight: "400", fallback: ["Georgia"] });
const hennyPenny = localFont({ src: "./fonts/HennyPenny-Regular.ttf", variable: "--font-cosmic", display: "swap", weight: "400", fallback: ["Georgia"] });
export const metadata: Metadata = { title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` }, description: siteConfig.description };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="vi" className={`${hermeneus.variable} ${calistoga.variable} ${hennyPenny.variable}`}><body className="min-h-screen antialiased"><a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:p-3">Tới nội dung chính</a><SiteShell>{children}</SiteShell></body></html>;
}
