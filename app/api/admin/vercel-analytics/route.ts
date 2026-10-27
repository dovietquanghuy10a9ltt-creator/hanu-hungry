import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getVercelAnalyticsData, type VercelAnalyticsRange } from "@/lib/analytics/vercel";

export async function GET(request: NextRequest) {
  // Kiểm tra quyền Admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const rawRange = searchParams.get("range");
  const range: VercelAnalyticsRange =
    rawRange === "24h" || rawRange === "7d" ? rawRange : "30d";

  const data = await getVercelAnalyticsData(range);
  return NextResponse.json(data);
}
