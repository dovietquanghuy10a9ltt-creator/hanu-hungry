import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type CheckIn = {
  id: string;
  restaurant_id: string;
  dish_id: string | null;
  visited_at: string;
  restaurants: { id: string; name: string; area: string | null } | null;
  dishes: { id: string; name: string } | null;
};

export async function getOwnCheckIns(): Promise<CheckIn[]> {
  const { user } = await requireUser();
  const supabase = await createClient();
  const result: CheckIn[] = [];
  const pageSize = 500;
  for (let start = 0; ; start += pageSize) {
    const { data, error } = await supabase.from("check_ins")
      .select("id,restaurant_id,dish_id,visited_at,restaurants(id,name,area),dishes(id,name)")
      .eq("user_id", user.id)
      .order("visited_at", { ascending: false })
      .range(start, start + pageSize - 1);
    if (error) throw new Error("Không thể tải lịch sử đã ăn.");
    const page = (data ?? []) as unknown as CheckIn[];
    result.push(...page);
    if (page.length < pageSize) break;
  }
  return result;
}
