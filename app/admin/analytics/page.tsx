import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { AdminError, AdminHeader } from "@/features/admin/components/AdminPrimitives";
import {
  AdminInteractiveAnalytics,
  type RawCheckIn,
  type AnalyticsSummary,
} from "@/features/admin/components/AdminInteractiveAnalytics";

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const [{ data: rpcData, error: rpcError }, { data: rawCheckIns, error: checkInsError }] =
    await Promise.all([
      supabase.rpc("admin_analytics"),
      adminSupabase
        .from("check_ins")
        .select("id, visited_at, restaurant_id, dish_id, user_id, restaurants(name), dishes(name), profiles(display_name, student_code)")
        .order("visited_at", { ascending: false }),
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

  const formattedCheckIns: RawCheckIn[] = checkInsList.map((item: any) => ({
    id: item.id,
    visited_at: item.visited_at,
    restaurant_id: item.restaurant_id,
    restaurant_name: item.restaurants?.name || "Quán không xác định",
    dish_id: item.dish_id || null,
    dish_name: item.dishes?.name || null,
    user_id: item.user_id,
    user_name: item.profiles?.display_name || "Thành viên",
    student_code: item.profiles?.student_code || undefined,
  }));

  return (
    <AdminInteractiveAnalytics
      summary={summary}
      checkIns={formattedCheckIns}
    />
  );
}
