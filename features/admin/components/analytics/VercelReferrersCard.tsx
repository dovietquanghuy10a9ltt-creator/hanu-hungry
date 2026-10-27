"use client";

import { useState } from "react";
import {
  Globe,
  ExternalLink,
  Users,
  TrendingUp,
  Sparkles,
  HelpCircle,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import type { VercelAnalyticsData, VercelReferrerItem } from "./types";

interface VercelReferrersCardProps {
  data?: VercelAnalyticsData;
}

// Dữ liệu mẫu chuẩn xác từ thực tế dự án (dựa trên ảnh chụp màn hình Vercel Analytics của bạn)
const PREVIEW_REFERRERS: VercelReferrerItem[] = [
  { referrer: "l.threads.com", visitors: 384, percent: 71 },
  { referrer: "facebook.com", visitors: 73, percent: 14 },
  { referrer: "google.com", visitors: 30, percent: 6 },
  { referrer: "l.facebook.com", visitors: 29, percent: 5 },
  { referrer: "lm.facebook.com", visitors: 18, percent: 3 },
  { referrer: "m.facebook.com", visitors: 4, percent: 1 },
  { referrer: "bing.com", visitors: 2, percent: 1 },
];

function ReferrerIcon({ name }: { name: string }) {
  const lower = name.toLowerCase();

  if (lower.includes("threads")) {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-black text-white text-[11px] font-black font-sans shadow-2xs">
        @
      </span>
    );
  }

  if (lower.includes("facebook") || lower.includes("fb")) {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#1877f2] text-white text-[11px] font-black shadow-2xs">
        f
      </span>
    );
  }

  if (lower.includes("google")) {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200 text-[#ea4335] text-[11px] font-black shadow-2xs">
        G
      </span>
    );
  }

  if (lower.includes("bing")) {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#008373] text-white text-[10px] font-black shadow-2xs">
        b
      </span>
    );
  }

  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
      <Globe className="h-3.5 w-3.5" />
    </span>
  );
}

export function VercelReferrersCard({ data }: VercelReferrersCardProps) {
  const isRealConnected = Boolean(data?.isConnected && data?.referrers?.length);
  const [showGuide, setShowGuide] = useState(false);
  const [previewMode, setPreviewMode] = useState(!isRealConnected);

  const displayReferrers = isRealConnected && !previewMode ? data!.referrers : PREVIEW_REFERRERS;
  const totalVisitors = isRealConnected && !previewMode
    ? data!.totalVisitors || displayReferrers.reduce((s, r) => s + r.visitors, 0)
    : 540;

  const topSource = displayReferrers[0];

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-white shadow-xs overflow-hidden mb-6">
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-[var(--color-line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-linear-to-r from-slate-50/60 to-white">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-[var(--color-ink)] flex items-center gap-2">
              <Globe className="h-4 w-4 text-[var(--color-red)]" />
              <span>Nguồn truy cập & Khách vào website (Vercel Analytics)</span>
            </h3>

            {isRealConnected && !previewMode ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> Live Vercel
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                <Sparkles className="h-3 w-3 text-amber-600" /> Dữ liệu mẫu (Preview)
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">
            Thống kê lượt khách ghé thăm (Visitors) theo từng nguồn giới thiệu (Referrers) như Threads, Facebook, Google...
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!isRealConnected && (
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="flex items-center gap-1 text-xs font-bold text-[var(--color-red)] hover:underline cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{showGuide ? "Đóng hướng dẫn" : "Cách lấy dữ liệu thật"}</span>
            </button>
          )}

          <a
            href="https://vercel.com/analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg border border-[var(--color-line)] bg-white px-2.5 py-1.5 text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-pale)] transition shadow-xs"
          >
            <span>Vercel Analytics</span>
            <ExternalLink className="h-3 w-3 text-[var(--color-muted)]" />
          </a>
        </div>
      </div>

      {/* Guide Accordion when not configured */}
      {showGuide && !isRealConnected && (
        <div className="bg-amber-50/60 border-b border-amber-200 p-4 text-xs space-y-2 text-amber-950 animate-fadeIn">
          <div className="flex items-center gap-1.5 font-black text-amber-900">
            <KeyRound className="h-4 w-4 text-amber-700" />
            <span>Cách kết nối trực tiếp Vercel Web Analytics API vào hệ thống:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-amber-900/90 pl-1">
            <li>
              Vào <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer" className="font-bold underline text-amber-950">Vercel Account Settings &rarr; Tokens</a>, tạo 1 Token mới.
            </li>
            <li>
              Vào Project trên Vercel &rarr; Settings &rarr; General &rarr; sao chép <strong>Project ID</strong> (bắt đầu bằng <code>prj_...</code>).
            </li>
            <li>
              Thêm vào biến môi trường (Environment Variables) trên Vercel:
              <pre className="mt-1.5 rounded-lg bg-black text-white p-2.5 font-mono text-[11px] overflow-x-auto">
                VERCEL_TOKEN=your_token_here{"\n"}
                VERCEL_PROJECT_ID=prj_xxxxxxxxxxxx
              </pre>
            </li>
          </ol>
          <p className="text-[11px] text-amber-800 italic">
            * Sau khi thêm biến môi trường, hệ thống sẽ tự động chuyển sang số liệu thực tế thời gian thực thay cho dữ liệu mẫu.
          </p>
        </div>
      )}

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
