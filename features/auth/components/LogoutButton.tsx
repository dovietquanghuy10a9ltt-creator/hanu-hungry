"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { logoutAction } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { clearAuth } = useAuth();

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // 1. Immediately wipe client state and sessionStorage
      clearAuth();

      // 2. Sign out in browser Supabase client
      try {
        const supabase = createClient();
        await supabase.auth.signOut({ scope: "local" });
      } catch (e) {
        console.warn("[logout] browser signOut error:", e);
      }

      // 3. Sign out on server to delete session cookies
      await logoutAction();

      // 4. Client SPA navigation & invalidate RSC router cache
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("[logout] error:", err);
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={className || "button button-primary cursor-pointer disabled:cursor-wait disabled:opacity-70"}
    >
      {loading ? "Đang đăng xuất..." : "Đăng xuất"}
    </button>
  );
}
