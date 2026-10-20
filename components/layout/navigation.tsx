"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

const NAV_ICONS: Record<string, { src: string; alt: string }> = {
  "/": { src: "/icons/nav/home.png", alt: "Trang chủ" },
  "/restaurants": { src: "/icons/nav/explore.png", alt: "Khám phá" },
  "/gacha": { src: "/icons/nav/gacha.png", alt: "Gacha" },
  "/blog": { src: "/icons/nav/blog.png", alt: "Blog" },
  "/support": { src: "/icons/nav/support.png", alt: "Hỗ trợ" },
  "/profile": { src: "/icons/nav/profile.png", alt: "Cá nhân" },
  "/admin/analytics": { src: "/icons/nav/admin.png", alt: "Quản trị" },
};

function NavIcon({
  href,
  size = 24,
  className = "",
}: {
  href: string;
  size?: number;
  className?: string;
}) {
  const icon = NAV_ICONS[href] || (href.startsWith("/admin") ? NAV_ICONS["/admin/analytics"] : null);
  if (!icon) return null;
  return (
    <Image
      src={icon.src}
      alt={icon.alt}
      width={size}
      height={size}
      unoptimized
      className={`object-contain transition-transform duration-200 select-none ${className}`}
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
                <NavIcon href={item.href} size={24} />
              </span>
            ) : (
              <span aria-hidden="true" className="flex items-center justify-center leading-none nav-desktop-icon">
                <NavIcon href={item.href} size={18} />
              </span>
            )}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
