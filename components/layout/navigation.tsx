"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import {
  Home,
  Compass,
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
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`${mobile ? "mobile-nav-link" : "nav-link"} ${active ? "is-active" : ""}`}
          >
            {mobile ? (
              <span aria-hidden="true" className="flex items-center justify-center leading-none mobile-nav-icon">
                <NavIcon href={item.href} className="w-5 h-5" />
              </span>
            ) : (
              <span aria-hidden="true" className="flex items-center justify-center leading-none nav-desktop-icon">
                <NavIcon href={item.href} className="w-4 h-4" />
              </span>
            )}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
