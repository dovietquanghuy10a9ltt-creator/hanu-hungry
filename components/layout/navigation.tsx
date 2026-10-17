"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

function NavIcon({ href }: { href: string }) {
  if (href === "/") {
    return <span className="text-lg leading-none select-none">🏠</span>;
  }
  if (href === "/restaurants") {
    return <span className="text-lg leading-none select-none">🔍</span>;
  }
  if (href === "/gacha") {
    return <span className="text-lg leading-none select-none">🎲</span>;
  }
  if (href === "/blog") {
    return <span className="text-lg leading-none select-none">📝</span>;
  }
  if (href === "/support") {
    return <span className="text-lg leading-none select-none">💬</span>;
  }
  if (href === "/profile") {
    return <span className="text-lg leading-none select-none">👤</span>;
  }
  if (href === "/admin/analytics" || href.startsWith("/admin")) {
    return <span className="text-lg leading-none select-none">⚙️</span>;
  }
  return null;
}

export function Navigation({ mobile = false, isAdmin = false, signedIn = false }: { mobile?: boolean; isAdmin?: boolean; signedIn?: boolean }) {
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
        const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`${mobile ? "mobile-nav-link" : "nav-link"} ${active ? "is-active" : ""}`}
          >
            {mobile && (
              <span aria-hidden="true" className="flex items-center justify-center leading-none">
                <NavIcon href={item.href} />
              </span>
            )}
            {item.label}
            {item.href === "/gacha" && (
              <span className="text-[10px] ml-0.5" aria-hidden="true">🌸</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
