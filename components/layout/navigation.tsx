"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

export function Navigation({ mobile = false, isAdmin = false, signedIn = false }: { mobile?: boolean; isAdmin?: boolean; signedIn?: boolean }) {
  const pathname = usePathname();
  const studentNavItems = [
    ...siteConfig.navigation,
    { href: "/support", label: "Hỗ trợ", icon: "💬" },
  ];
  const items = [
    ...(isAdmin ? siteConfig.navigation : studentNavItems),
    ...(mobile && signedIn ? [{ href: "/profile", label: "Cá nhân", icon: "◎" }] : []),
    ...(isAdmin ? [{ href: "/admin/analytics", label: "Quản trị", icon: "▦" }] : []),
  ];
  return <nav aria-label={mobile ? "Điều hướng di động" : "Điều hướng chính"} className={mobile ? "mobile-navigation md:hidden" : "hidden items-center gap-1 md:flex"}>
    {items.map((item) => {
      const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
      return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`${mobile ? "mobile-nav-link" : "nav-link"} ${active ? "is-active" : ""}`}>
        {mobile && <span aria-hidden="true" className="text-xl leading-none">{item.icon}</span>}{item.label}
      </Link>;
    })}
  </nav>;
}
