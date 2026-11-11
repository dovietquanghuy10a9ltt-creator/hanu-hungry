"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
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
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [streakData, setStreakData] = useState<StreakData>(defaultStreakData);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (!res.ok) {
        setAuthenticated(false);
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setUnreadCount(0);
        setStreakData(defaultStreakData);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.authenticated) {
        setAuthenticated(true);
        setUser(data.user);
        setProfile(data.profile);
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
    } catch {
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (!active) return;
        if (!res.ok) {
          setAuthenticated(false);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!active) return;
        if (data.authenticated) {
          setAuthenticated(true);
          setUser(data.user);
          setProfile(data.profile);
          setIsAdmin(Boolean(data.isAdmin));
          setUnreadCount(data.unreadNotificationsCount || 0);
          setStreakData(data.streakData || defaultStreakData);
        } else {
          setAuthenticated(false);
        }
      } catch {
        if (active) setAuthenticated(false);
      } finally {
        if (active) setLoading(false);
      }
    }

    init();

    // Listen for auth state changes in the browser (e.g. sign in, sign out)
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchSession();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [fetchSession]);

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
        refresh: fetchSession,
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
