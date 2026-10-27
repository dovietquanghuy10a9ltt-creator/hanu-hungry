"use client";

import { useState, useEffect } from "react";
import { Globe, Users, TrendingUp, Loader2 } from "lucide-react";
import type { VercelAnalyticsData, VercelReferrerItem } from "./types";

export type TimeRange = "24h" | "7d" | "30d";

interface VercelReferrersCardProps {
  data?: VercelAnalyticsData;
}

// Dữ liệu mẫu chuẩn xác từ thực tế Vercel Analytics của dự án
const PREVIEW_BY_RANGE: Record<TimeRange, { visitors: number; referrers: VercelReferrerItem[] }> = {
  "24h": {
    visitors: 347,
    referrers: [
      { referrer: "Direct / Truy cập trực tiếp", visitors: 403, percent: 52 },
      { referrer: "l.threads.com", visitors: 376, percent: 48 },
      { referrer: "facebook.com", visitors: 67, percent: 9 },
      { referrer: "google.com", visitors: 29, percent: 4 },
      { referrer: "l.facebook.com", visitors: 24, percent: 3 },
      { referrer: "lm.facebook.com", visitors: 15, percent: 2 },
    ],
  },
  "7d": {
    visitors: 807,
    referrers: [
      { referrer: "Direct / Truy cập trực tiếp", visitors: 869, percent: 52 },
      { referrer: "l.threads.com", visitors: 583, percent: 35 },
      { referrer: "facebook.com", visitors: 143, percent: 9 },
      { referrer: "google.com", visitors: 89, percent: 5 },
      { referrer: "l.facebook.com", visitors: 63, percent: 4 },
    ],
  },
  "30d": {
    visitors: 965,
    referrers: [
      { referrer: "Direct / Truy cập trực tiếp", visitors: 1039, percent: 53 },
      { referrer: "l.threads.com", visitors: 583, percent: 30 },
      { referrer: "facebook.com", visitors: 144, percent: 7 },
      { referrer: "google.com", visitors: 102, percent: 5 },
      { referrer: "l.facebook.com", visitors: 76, percent: 4 },
      { referrer: "lm.facebook.com", visitors: 18, percent: 1 },
    ],
  },
};

function ReferrerIcon({ name }: { name: string }) {
  const lower = name.toLowerCase();

  // 1. Threads
  if (lower.includes("threads")) {
    return (
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-black text-white shadow-2xs"
        title="Meta Threads"
      >
        <svg className="h-3.5 w-3.5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.186 24C5.454 24 0 18.647 0 12.036 0 5.426 5.454.073 12.186.073c6.643 0 11.968 5.215 11.968 11.751 0 4.316-2.316 7.744-6.044 9.074-1.042.37-2.128.563-3.228.575-3.87 0-6.195-2.029-6.195-5.429 0-3.325 2.298-5.352 5.952-5.352 1.341 0 2.627.24 3.729.695-.084-2.222-1.391-3.663-3.882-3.663-1.636 0-3.003.626-3.754 1.716l-2.096-1.52C9.07 5.753 10.985 4.8 13.91 4.8c4.088 0 6.645 2.502 6.645 6.442v8.035c-1.332.55-2.793.844-4.314.844-2.887 0-4.836-1.528-4.836-3.883 0-2.356 1.95-3.884 4.836-3.884 1.09 0 2.057.218 2.802.584l.056-.475c0-1.884-1.294-2.92-3.376-2.92-1.84 0-3.084.774-3.585 2.23l-2.302-.916c.86-2.33 3.036-3.626 5.887-3.626 3.655 0 5.867 2.016 5.867 5.378v4.542c0 2.825 1.543 4.417 4.148 4.417 2.766 0 4.605-1.928 4.605-4.833 0-4.99-4.223-9.06-9.67-9.06-5.447 0-9.67 4.07-9.67 9.06 0 4.99 4.223 9.06 9.67 9.06 1.624 0 3.167-.367 4.582-1.09l1.168 2.067C19.163 23.36 15.787 24 12.186 24z" />
        </svg>
      </span>
    );
  }

  // 2. Facebook
  if (lower.includes("facebook") || lower.includes("fb")) {
    return (
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#1877F2] text-white shadow-2xs"
        title="Facebook"
      >
        <svg className="h-3.5 w-3.5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </span>
    );
  }

  // 3. Google (Official 4-color G)
  if (lower.includes("google")) {
    return (
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200 shadow-2xs"
        title="Google Search"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
      </span>
    );
  }

  // 4. Microsoft Bing
  if (lower.includes("bing")) {
    return (
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#008373] text-white shadow-2xs"
        title="Microsoft Bing"
      >
        <svg className="h-3.5 w-3.5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5.4 0v24l4.2-2.4V7.4l6.6 3.8-3 5.4 4.8 2.8 5.4-8.8L5.4 0z" />
        </svg>
      </span>
    );
  }

  // 5. TikTok
  if (lower.includes("tiktok")) {
    return (
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-black text-white shadow-2xs"
        title="TikTok"
      >
        <svg className="h-3.5 w-3.5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-6.6 6.32 6.34 6.34 0 0 0 10.84 4.5 6.3 6.3 0 0 0 1.8-4.5V8.5a8.27 8.27 0 0 0 4.77 1.5V6.69z" />
        </svg>
      </span>
    );
  }

  // 6. Instagram
  if (lower.includes("instagram") || lower.includes("ig")) {
    return (
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-linear-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-2xs"
        title="Instagram"
      >
        <svg className="h-3.5 w-3.5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      </span>
    );
  }

  // 7. X (Twitter)
  if (lower.includes("twitter") || lower === "x.com" || lower.includes("t.co")) {
    return (
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-black text-white shadow-2xs"
        title="X (Twitter)"
      >
        <svg className="h-3 w-3 fill-white" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </span>
    );
  }

  // 8. Zalo
  if (lower.includes("zalo")) {
    return (
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#0068FF] text-white text-[10px] font-black shadow-2xs"
        title="Zalo"
      >
        Z
      </span>
    );
  }

  // Fallback: Globe
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
      <Globe className="h-3.5 w-3.5" />
    </span>
  );
}

export function VercelReferrersCard({ data }: VercelReferrersCardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [liveData, setLiveData] = useState<VercelAnalyticsData | undefined>(data);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (data) {
      setLiveData(data);
    }
  }, [data]);

  // Xử lý chuyển đổi khoảng thời gian
  async function handleRangeChange(newRange: TimeRange) {
    if (newRange === timeRange) return;
    setTimeRange(newRange);

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/vercel-analytics?range=${newRange}`);
      if (res.ok) {
        const json = await res.json();
        setLiveData(json);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu Vercel Analytics:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const currentPreview = PREVIEW_BY_RANGE[timeRange];
  const hasLive = Boolean(liveData?.isConnected && liveData?.referrers?.length);

  const displayReferrers = hasLive ? liveData!.referrers : currentPreview.referrers;
  const totalVisitors = hasLive
    ? liveData!.totalVisitors || displayReferrers.reduce((s, r) => s + r.visitors, 0)
    : currentPreview.visitors;

  const topSource = displayReferrers[0];

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-white shadow-xs overflow-hidden mb-6">
      {/* Header: vercel analytic + 3 nút bộ lọc thời gian */}
      <div className="p-3.5 sm:p-4 border-b border-[var(--color-line)] flex items-center justify-between gap-2 bg-gradient-to-r from-slate-50/60 to-white">
        <div className="flex items-center gap-2 min-w-0">
          <Globe className="h-4 w-4 text-[var(--color-red)] shrink-0" />
          <h3 className="text-sm sm:text-base font-extrabold text-[var(--color-ink)] truncate capitalize">
            vercel analytic
          </h3>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Bộ lọc thời gian: 24h, 7d, 30d */}
          <div className="flex items-center gap-0.5 rounded-xl bg-[var(--color-pale)] p-1 border border-[var(--color-line)]">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleRangeChange("24h")}
              className={`rounded-lg px-2 sm:px-2.5 py-1 text-xs font-bold transition cursor-pointer disabled:opacity-50 ${
                timeRange === "24h"
                  ? "bg-[var(--color-ink)] text-white shadow-xs"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              24 giờ
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleRangeChange("7d")}
              className={`rounded-lg px-2 sm:px-2.5 py-1 text-xs font-bold transition cursor-pointer disabled:opacity-50 ${
                timeRange === "7d"
                  ? "bg-[var(--color-ink)] text-white shadow-xs"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              7 ngày
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleRangeChange("30d")}
              className={`rounded-lg px-2 sm:px-2.5 py-1 text-xs font-bold transition cursor-pointer disabled:opacity-50 ${
                timeRange === "30d"
                  ? "bg-[var(--color-ink)] text-white shadow-xs"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              30 ngày
            </button>
          </div>

          {isLoading && (
            <span className="flex items-center text-[var(--color-muted)] animate-spin ml-0.5">
              <Loader2 className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 sm:p-5 pb-2">
        <div className="rounded-xl border border-[var(--color-line)] bg-[#fcf9f5] p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">
              Tổng lượt khách truy cập
            </p>
            <p className="mt-1 text-2xl font-black text-[var(--color-red)]">
              {totalVisitors.toLocaleString("vi-VN")}
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-[var(--color-red)]">
            <Users className="h-5 w-5" />
          </span>
        </div>

        <div className="rounded-xl border border-[var(--color-line)] bg-[#fcf9f5] p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">
              Nguồn giới thiệu dẫn đầu
            </p>
            <p className="mt-1 text-base font-extrabold text-[var(--color-ink)] truncate max-w-[200px]">
              {topSource?.referrer || "Chưa có"}
            </p>
            <p className="text-xs text-[var(--color-muted)]">
              {topSource ? `${topSource.visitors} khách (${topSource.percent}%)` : "—"}
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <TrendingUp className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* Referrers Table */}
      <div className="p-4 sm:p-5 pt-2">
        <div className="rounded-xl border border-[var(--color-line)] overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#fcf8f3] border-b border-[var(--color-line)] text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3.5">Nguồn giới thiệu (Referrers)</th>
                <th className="py-2.5 px-3.5 text-right w-28 sm:w-36">Khách (Visitors)</th>
                <th className="py-2.5 pr-4 pl-2 text-right w-24 hidden sm:table-cell">Tỉ lệ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)] bg-white">
              {displayReferrers.map((item) => (
                <tr key={item.referrer} className="hover:bg-[var(--color-pale)]/30 transition-colors">
                  <td className="py-2.5 px-3.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ReferrerIcon name={item.referrer} />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-[var(--color-ink)] truncate block">
                          {item.referrer}
                        </span>
                        {/* Progress Bar for mobile & desktop */}
                        <div className="mt-1 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-[#f4ebe1]">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-orange-400 to-[var(--color-red)] transition-all duration-300"
                            style={{ width: `${Math.max(3, item.percent)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-black text-[var(--color-ink)]">
                    {item.visitors.toLocaleString("vi-VN")}
                  </td>
                  <td className="py-2.5 pr-4 pl-2 text-right text-xs font-bold text-[var(--color-muted)] hidden sm:table-cell">
                    {item.percent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
