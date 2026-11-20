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

function StarburstBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 68 38"
        className="h-4.5 w-auto overflow-visible drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon
          points="34,2 40,8 48,4 51,12 60,13 58,21 66,26 59,30 57,37 49,34 43,38 37,33 30,37 25,32 17,35 17,27 8,27 12,19 4,14 13,11 14,4 23,7"
          fill="#c51f30"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <text
          x="34"
          y="23.5"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="11"
          fontWeight="900"
          fontFamily="inherit"
          letterSpacing="-0.3px"
        >
          Sắp mở
        </text>
      </svg>
    </span>
  );
}

export function Navigation({
  mobile = false,
  isAdmin = false,
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
                  <span className="absolute -top-3 -right-4.5 z-10 rotate-[-10deg]">
                    <StarburstBadge />
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
            <span className="relative z-1 inline-flex items-center gap-1.5 whitespace-nowrap">
              <span>{item.label}</span>
              {!mobile && isMap && (
                <span className="rotate-[-6deg]">
                  <StarburstBadge />
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
