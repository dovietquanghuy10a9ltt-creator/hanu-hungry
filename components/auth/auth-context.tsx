"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Navigation } from "@/components/layout/navigation";
import { StreakIndicator, type StreakData } from "@/components/shared/streak-indicator";
import { SmartCheckInRecall } from "@/components/shared/smart-checkin-recall";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type AuthState = {
  loading: boolean;
  authenticated: boolean;
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  isAdmin: boolean;
  unreadNotificationsCount: number;
  streakData: StreakData;
  refresh: () => Promise<void>;
  clearAuth: () => void;
};

const defaultStreakData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  isTodayCheckedIn: false,
  weekDays: [],
};

const AuthContext = createContext<AuthState>({
  loading: true,
  authenticated: false,
  user: null,
  profile: null,
  isAdmin: false,
  unreadNotificationsCount: 0,
  streakData: defaultStreakData,
  refresh: async () => {},
  clearAuth: () => {},
});

const AUTH_CACHE_KEY = "hanu_auth_cache_v1";
const AUTH_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [streakData, setStreakData] = useState<StreakData>(defaultStreakData);

  const applyData = useCallback(
    (data: {
      authenticated: boolean;
      user?: { id: string; email?: string } | null;
      profile?: Profile | null;
      isAdmin?: boolean;
      unreadNotificationsCount?: number;
      streakData?: StreakData;
    }) => {
      if (data.authenticated && data.user) {
        setAuthenticated(true);
        setUser(data.user);
        setProfile(data.profile ?? null);
        setIsAdmin(Boolean(data.isAdmin));
        setUnreadCount(data.unreadNotificationsCount || 0);
        setStreakData(data.streakData || defaultStreakData);
      } else {
        setAuthenticated(false);
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setUnreadCount(0);
        setStreakData(defaultStreakData);
      }
    },
    []
  );

  const clearAuth = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(AUTH_CACHE_KEY);
      } catch {}
    }
    applyData({ authenticated: false });
    setLoading(false);
  }, [applyData]);

  const fetchSession = useCallback(
    async (force = false) => {
      try {
        if (!force && typeof window !== "undefined") {
          try {
            const cached = sessionStorage.getItem(AUTH_CACHE_KEY);
            if (cached) {
              const parsed = JSON.parse(cached);
              if (Date.now() - parsed.timestamp < AUTH_CACHE_TTL_MS && parsed.data) {
                applyData(parsed.data);
                setLoading(false);
                return;
              }
            }
          } catch {
            // ignore cache parse error
          }
        }

        const res = await fetch("/api/me", { cache: "no-store" });
        if (!res.ok) {
          clearAuth();
          return;
        }
        const data = await res.json();
        applyData(data);
        if (typeof window !== "undefined") {
          if (data.authenticated) {
            sessionStorage.setItem(AUTH_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
          } else {
            sessionStorage.removeItem(AUTH_CACHE_KEY);
          }
        }
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    },
    [applyData, clearAuth]
  );

  const refresh = useCallback(async () => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(AUTH_CACHE_KEY);
      } catch {}
    }
    await fetchSession(true);
  }, [fetchSession]);

  useEffect(() => {
    let active = true;

    async function init() {
      // 1. Check if auth cookie exists before doing ANY work
      const hasCookie =
        typeof document !== "undefined" &&
        document.cookie.split(";").some((c) => {
          const name = c.trim().split("=")[0];
          return name.startsWith("sb-") && !name.includes("code-verifier");
        });

      if (!hasCookie) {
        // Guest or bot: do not call /api/me at all!
        if (active) {
          clearAuth();
        }
        return;
      }

      // 2. Auth cookie found: check sessionStorage cache first
      try {
        const cached = sessionStorage.getItem(AUTH_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < AUTH_CACHE_TTL_MS && parsed.data?.authenticated) {
            if (active) {
              applyData(parsed.data);
              setLoading(false);
            }
            return;
          }
        }
      } catch {
        // ignore cache error
      }

      // 3. Cache expired or missing: fetch /api/me
      if (active) {
        await fetchSession(true);
      }
    }

    init();

    // Listen for real auth events (sign in, sign out)
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        if (typeof window !== "undefined") sessionStorage.removeItem(AUTH_CACHE_KEY);
        fetchSession(true);
      } else if (event === "SIGNED_OUT") {
        clearAuth();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [applyData, clearAuth, fetchSession]);

  const authenticatedRef = useRef(authenticated);
  useEffect(() => {
    authenticatedRef.current = authenticated;
  }, [authenticated]);

  // Watch route changes: auto-synchronize auth state on SPA transitions
  useEffect(() => {
    if (prevPathnameRef.current === null) {
      prevPathnameRef.current = pathname;
      return;
    }

    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;

      queueMicrotask(() => {
        const hasCookie =
          typeof document !== "undefined" &&
          document.cookie.split(";").some((c) => {
            const name = c.trim().split("=")[0];
            return name.startsWith("sb-") && !name.includes("code-verifier");
          });

        if (!hasCookie && authenticatedRef.current) {
          clearAuth();
        } else if (hasCookie && !authenticatedRef.current) {
          refresh();
        }
      });
    }
  }, [pathname, clearAuth, refresh]);

  return (
    <AuthContext.Provider
      value={{
        loading,
        authenticated,
        user,
        profile,
        isAdmin,
        unreadNotificationsCount: unreadCount,
        streakData,
        refresh,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/** Renders main desktop navigation bar only when user is authenticated */
export function HeaderDesktopNavigation() {
  const { authenticated, isAdmin } = useAuth();
  if (!authenticated) return null;
  return <Navigation isAdmin={isAdmin} signedIn={true} />;
}

/** Renders header actions: Streak, Notifications, Avatar OR Login/Register buttons */
export function HeaderUserNavActions() {
  const { authenticated, isAdmin, profile, user, unreadNotificationsCount, streakData } = useAuth();

  if (authenticated && user) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 animate-fadeIn">
        <StreakIndicator streak={streakData} />
        {!isAdmin && (
          <Link
            href="/notifications"
            prefetch={false}
            className="group relative inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[var(--color-pale)] text-[var(--color-red)] transition hover:bg-[#eadbc9] hover:scale-105 active:scale-95"
            aria-label={`Thông báo bài viết từ Admin${unreadNotificationsCount > 0 ? ` (${unreadNotificationsCount} chưa đọc)` : ""}`}
            title="Thông báo bài viết từ Admin"
          >
            <Image
              src="/icons/shared/bell.png"
              alt=""
              width={24}
              height={24}
              unoptimized
              className="h-5 w-5 sm:h-6 sm:w-6 object-contain transition-transform group-hover:scale-110"
            />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 sm:h-5 sm:min-w-5 items-center justify-center rounded-full bg-[var(--color-red)] px-1 text-[10px] sm:text-[11px] font-black text-white shadow-sm animate-pulse">
                {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
              </span>
            )}
          </Link>
        )}
        {isAdmin ? (
          <Link
            href="/profile"
            prefetch={false}
            className="flex min-h-9 sm:min-h-11 items-center gap-1.5 sm:gap-2 rounded-full border border-[#f0c2c6] bg-[#fdf2f2] px-2.5 sm:px-4 text-xs sm:text-sm font-bold text-[var(--color-red)] shadow-xs transition hover:bg-[#fae6e6]"
            title="Tài khoản Quản trị viên"
          >
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt=""
                width={24}
                height={24}
                unoptimized
                className="h-5 w-5 sm:h-6 sm:w-6 rounded-full object-cover border border-[var(--color-red)] shrink-0"
              />
            ) : (
              <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[var(--color-red)] text-white text-[10px] shrink-0">
                👑
              </span>
            )}
            <span className="hidden sm:inline truncate max-w-[110px] sm:max-w-[150px]">
              {profile?.display_name || user.email?.split("@")[0] || "Admin"}
            </span>
            <span className="inline-flex items-center rounded-full bg-[var(--color-red)] px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs shrink-0">
              Admin
            </span>
          </Link>
        ) : (
          <Link
            href="/profile"
            prefetch={false}
            className="flex min-h-9 sm:min-h-11 items-center gap-1.5 sm:gap-2 rounded-full bg-[var(--color-pale)] px-2.5 sm:px-4 text-xs sm:text-sm font-semibold text-[var(--color-red)] transition hover:bg-[#eadbc9]"
          >
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt=""
                width={24}
                height={24}
                unoptimized
                className="h-5 w-5 sm:h-6 sm:w-6 rounded-full object-cover shrink-0"
              />
            ) : (
              <Image
                src="/icons/nav/profile.png"
                alt=""
                width={24}
                height={24}
                unoptimized
                className="h-5 w-5 sm:h-6 sm:w-6 rounded-full object-contain shrink-0"
              />
            )}
            <span className="hidden sm:inline truncate max-w-[110px]">
              {profile?.display_name || user.email?.split("@")[0] || "Tài khoản"}
            </span>
            <span className="sm:hidden text-xs font-bold">Hồ sơ</span>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
      <Link
        href="/login"
        className="button button-secondary shrink-0 whitespace-nowrap px-2.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
      >
        Đăng nhập
      </Link>
      <Link
        href="/register"
        className="button button-primary shrink-0 whitespace-nowrap px-2.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
      >
        Đăng ký
      </Link>
    </div>
  );
}

/** Renders bottom mobile navigation and smart check-in recall only when authenticated */
export function ClientMobileNavBars() {
  const { authenticated, isAdmin } = useAuth();
  if (!authenticated) return null;
  return (
    <>
      <Navigation mobile signedIn={true} isAdmin={isAdmin} />
      <SmartCheckInRecall />
    </>
  );
}
