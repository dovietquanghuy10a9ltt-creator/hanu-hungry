import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { AdminError, AdminHeader } from "@/features/admin/components/AdminPrimitives";
import {
  AdminInteractiveAnalytics,
  type RawCheckIn,
  type AnalyticsSummary,
  type SystemAccount,
  type VercelAnalyticsData,
} from "@/features/admin/components/AdminInteractiveAnalytics";
import { getVercelAnalyticsData } from "@/lib/analytics/vercel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getAllAuthUsers(adminSupabase: ReturnType<typeof createAdminClient>) {
  try {
    const allUsers: Array<{ id: string; email?: string; last_sign_in_at?: string | null }> = [];
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data, error } = await adminSupabase.auth.admin.listUsers({ page, perPage });
      if (error) {
        console.error("[admin-analytics] listUsers error:", error.message);
        break;
      }
      if (!data?.users || data.users.length === 0) break;
      allUsers.push(...data.users);
      if (!data.nextPage || data.users.length < perPage) break;
      page = data.nextPage;
    }
    return allUsers;
  } catch (err) {
    console.error("[admin-analytics] getAllAuthUsers error:", err);
    return [];
  }
}

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const [
    { data: rpcData, error: rpcError },
    { data: rawCheckIns, error: checkInsError },
    { data: rawProfiles },
    authUsers,
    vercelAnalytics,
  ] = await Promise.all([
    supabase.rpc("admin_analytics"),
    adminSupabase
      .from("check_ins")
      .select("id, visited_at, restaurant_id, dish_id, user_id, restaurants(name), dishes(name), profiles(display_name, student_code)")
      .order("visited_at", { ascending: false }),
    adminSupabase
      .from("profiles")
      .select("id, student_code, display_name, avatar_url, role, created_at, updated_at")
      .order("created_at", { ascending: false }),
    getAllAuthUsers(adminSupabase),
    getVercelAnalyticsData(),
  ]);

  if (rpcError && checkInsError) {
    return (
      <>
        <AdminHeader title="Thống kê" description="Các con số lấy từ dữ liệu check-in, review và nội dung thật." />
        <AdminError>Chưa tải được thống kê. Kiểm tra migration và quyền ADMIN.</AdminError>
      </>
    );
  }

  const rpcStats = (rpcData && typeof rpcData === "object" && !Array.isArray(rpcData)
    ? rpcData
    : {}) as Record<string, unknown>;

  const checkInsList = rawCheckIns ?? [];

  const summary: AnalyticsSummary = {
    totalRestaurants: Number(rpcStats.total_restaurants) || 0,
    totalDishes: Number(rpcStats.total_dishes) || 0,
    totalCheckIns: Number(rpcStats.total_check_ins) || checkInsList.length,
    totalReviews: Number(rpcStats.total_reviews) || 0,
    averageRating: rpcStats.average_rating !== null && rpcStats.average_rating !== undefined
      ? Number(rpcStats.average_rating)
      : null,
  };

  type CheckInRow = {
    id: string;
    visited_at: string;
    restaurant_id: string;
    dish_id: string | null;
    user_id: string;
    restaurants?: { name: string } | null;
    dishes?: { name: string } | null;
    profiles?: { display_name: string; student_code: string } | null;
  };

  type ProfileRow = {
    id: string;
    student_code: string;
    display_name: string;
    avatar_url: string | null;
    role: "USER" | "ADMIN";
    created_at: string;
    updated_at: string;
  };

  const formattedCheckIns: RawCheckIn[] = (checkInsList as unknown as CheckInRow[]).map((item) => {
    // Nếu check-in chưa gắn món cụ thể, fallback về tên quán để số liệu món ăn đồng bộ với lượt check-in
    const effectiveDishName = item.dishes?.name || (item.restaurants?.name ? `${item.restaurants.name}` : null);
    return {
      id: item.id,
      visited_at: item.visited_at,
      restaurant_id: item.restaurant_id,
      restaurant_name: item.restaurants?.name || "Quán không xác định",
      dish_id: item.dish_id || null,
      dish_name: effectiveDishName,
      user_id: item.user_id,
      user_name: item.profiles?.display_name || "Thành viên",
      student_code: item.profiles?.student_code || undefined,
    };
  });

  const emailMap = new Map(
    authUsers.map((u) => [
      u.id,
      { email: u.email ?? "—", lastSignIn: u.last_sign_in_at ?? null },
    ])
  );

  const formattedAccounts: SystemAccount[] = (rawProfiles as unknown as ProfileRow[] ?? []).map((p) => {
    const authInfo = emailMap.get(p.id);
    const email =
      authInfo?.email && authInfo.email !== "—"
        ? authInfo.email
        : p.student_code
        ? `${p.student_code}@hanu.edu.vn`
        : "—";

    return {
      id: p.id,
      student_code: p.student_code,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      role: p.role,
      email,
      created_at: p.created_at,
      last_sign_in_at: authInfo?.lastSignIn ?? null,
    };
  });

  return (
    <AdminInteractiveAnalytics
      summary={summary}
      checkIns={formattedCheckIns}
      accounts={formattedAccounts}
      vercelAnalytics={vercelAnalytics}
    />
  );
}
