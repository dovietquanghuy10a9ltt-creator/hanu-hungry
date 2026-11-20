"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import {
  Home,
  Compass,
  MapPin,
  Sparkles,
  BookOpen,
  HelpCircle,
  User,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

const NAV_ICONS: Record<string, LucideIcon> = {
  "/": Home,
  "/restaurants": Compass,
  "/map": MapPin,
  "/gacha": Sparkles,
  "/blog": BookOpen,
  "/support": HelpCircle,
  "/profile": User,
  "/admin/analytics": ShieldCheck,
};

function NavIcon({
  href,
  className = "",
}: {
  href: string;
  size?: number;
  className?: string;
}) {
  const Icon = NAV_ICONS[href] || (href.startsWith("/admin") ? NAV_ICONS["/admin/analytics"] : null);
  if (!Icon) return null;
  return (
    <Icon
      className={`shrink-0 transition-transform duration-200 select-none ${className}`}
    />
  );
}

export function Navigation({
  mobile = false,
  isAdmin = false,
  signedIn = false,
}: {
  mobile?: boolean;
  isAdmin?: boolean;
  signedIn?: boolean;
}) {
  const pathname = usePathname();
  const studentNavItems = [
    ...siteConfig.navigation,
    { href: "/support", label: "Hỗ trợ" },
  ];
  const items = [
    ...(isAdmin ? siteConfig.navigation : studentNavItems),
    ...(mobile && signedIn ? [{ href: "/profile", label: "Cá nhân" }] : []),
    ...(isAdmin ? [{ href: "/admin/analytics", label: "Quản trị" }] : []),
  ];
  return (
    <nav
      aria-label={mobile ? "Điều hướng di động" : "Điều hướng chính"}
      className={mobile ? "mobile-navigation md:hidden" : "hidden items-center gap-1 md:flex"}
    >
      {items.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const isGacha = item.href === "/gacha";
        const isMap = item.href === "/map";
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`${mobile ? "mobile-nav-link" : "nav-link"} ${active ? "is-active" : ""} ${
              isGacha ? "gacha-nav-link" : ""
            }`}
          >
            {mobile ? (
              <span
                aria-hidden="true"
                className={`relative flex items-center justify-center leading-none mobile-nav-icon ${
                  isGacha ? "gacha-sparkle-icon" : ""
                }`}
              >
                <NavIcon href={item.href} className="w-5 h-5" />
                {isMap && (
                  <span className="absolute -top-1.5 -right-3 whitespace-nowrap rounded-full bg-[var(--color-red)] px-1 py-0.2 text-[8px] font-black text-white leading-none shadow-xs">
                    Sắp mở
                  </span>
                )}
              </span>
            ) : (
              <span
                aria-hidden="true"
                className={`flex items-center justify-center leading-none nav-desktop-icon ${
                  isGacha ? "gacha-sparkle-icon" : ""
                }`}
              >
                <NavIcon href={item.href} className="w-4 h-4" />
              </span>
            )}
            <span className="relative z-1 inline-flex items-center gap-1.5">
              <span>{item.label}</span>
              {!mobile && isMap && (
                <span className="rounded-full bg-[#fdf2f2] border border-[#f0c2c6] px-1.5 py-0.2 text-[9px] font-extrabold text-[var(--color-red)] leading-tight tracking-tight">
                  Sắp mở
                </span>
              )}
            </span>
            {isGacha && (
              <span className="gacha-shimmer-beam" aria-hidden="true" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
