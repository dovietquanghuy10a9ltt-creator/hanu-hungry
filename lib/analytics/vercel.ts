import type { VercelAnalyticsData, VercelReferrerItem } from "@/features/admin/components/analytics/types";

export type RawVercelAggregateRow = {
  key?: string;
  referrer?: string;
  total?: number;
  visitors?: number;
  count?: number;
  value?: number;
};

/**
 * Chuẩn hóa dữ liệu thô từ Vercel Web Analytics API thành danh sách VercelReferrerItem
 */
export function normalizeVercelReferrers(
  rows: RawVercelAggregateRow[],
  totalVisitors: number
): VercelReferrerItem[] {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [];
  }

  const items: VercelReferrerItem[] = rows.map((row) => {
    const raw = (row.key ?? row.referrer ?? "").trim();
    const cleanName = !raw || raw.toLowerCase() === "direct" ? "Direct / Trực tiếp" : raw;
    const count = Number(row.total ?? row.visitors ?? row.count ?? row.value ?? 0) || 0;

    return {
      referrer: cleanName,
      visitors: count,
      percent: 0,
    };
  });

  // Sắp xếp giảm dần theo số lượng khách
  items.sort((a, b) => b.visitors - a.visitors);

  // Tính phần trăm so với tổng lượt hoặc tổng của danh sách
  const sumCount = items.reduce((acc, curr) => acc + curr.visitors, 0);
  const denominator = Math.max(1, totalVisitors > 0 ? totalVisitors : sumCount);

  for (const item of items) {
    item.percent = Math.round((item.visitors / denominator) * 100);
  }

  return items;
}

/**
 * Gọi Vercel Web Analytics API phía server
 * Yêu cầu biến môi trường:
 * - VERCEL_TOKEN: Token tài khoản Vercel
 * - VERCEL_PROJECT_ID: ID của project Vercel (bắt đầu bằng prj_...)
 * - VERCEL_TEAM_ID: (Tùy chọn) ID của team nếu project thuộc team
 */
export async function getVercelAnalyticsData(): Promise<VercelAnalyticsData> {
  const token = process.env.VERCEL_TOKEN?.trim();
  const projectId = process.env.VERCEL_PROJECT_ID?.trim();
  const teamId = process.env.VERCEL_TEAM_ID?.trim();

  if (!token || !projectId) {
    return {
      isConnected: false,
      totalVisitors: 0,
      referrers: [],
    };
  }

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const teamParam = teamId ? `&teamId=${encodeURIComponent(teamId)}` : "";

    // 1. Lấy tổng số lượng khách truy cập (Visits count)
    const countUrl = `https://api.vercel.com/v1/query/web-analytics/visits/count?projectId=${encodeURIComponent(
      projectId
    )}${teamParam}`;

    // 2. Lấy danh sách thống kê theo nguồn giới thiệu (Referrers aggregate)
    const aggregateUrl = `https://api.vercel.com/v1/query/web-analytics/visits/aggregate?projectId=${encodeURIComponent(
      projectId
    )}&groupBy=referrer&limit=20${teamParam}`;

    const [countRes, aggregateRes] = await Promise.all([
      fetch(countUrl, { headers, next: { revalidate: 300 } }).catch(() => null),
      fetch(aggregateUrl, { headers, next: { revalidate: 300 } }).catch(() => null),
    ]);

    let totalVisitors = 0;
    if (countRes && countRes.ok) {
      const countJson = await countRes.json();
      totalVisitors = Number(countJson?.value ?? countJson?.count ?? 0) || 0;
    }

    let referrers: VercelReferrerItem[] = [];
    if (aggregateRes && aggregateRes.ok) {
      const aggJson = await aggregateRes.json();
      const rows = (aggJson?.data || aggJson?.rows || aggJson || []) as RawVercelAggregateRow[];
      referrers = normalizeVercelReferrers(rows, totalVisitors);
    } else if (aggregateRes && !aggregateRes.ok) {
      const errText = await aggregateRes.text().catch(() => "");
      console.error("[vercel-analytics] Aggregate API error:", aggregateRes.status, errText);
      return {
        isConnected: true,
        totalVisitors,
        referrers: [],
        error: `Lỗi kết nối API Vercel (${aggregateRes.status})`,
      };
    }

    return {
      isConnected: true,
      totalVisitors,
      referrers,
    };
  } catch (error) {
    console.error("[vercel-analytics] Exception while fetching:", error);
    return {
      isConnected: true,
      totalVisitors: 0,
      referrers: [],
      error: "Không thể kết nối đến Vercel Web Analytics API",
    };
  }
}
