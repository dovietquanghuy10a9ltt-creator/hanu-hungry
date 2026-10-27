"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Users,
  GraduationCap,
  ShieldCheck,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SearchX,
} from "lucide-react";
import type { SystemAccount, VercelAnalyticsData } from "./types";
import { formatRelativeTime } from "./utils";
import { VercelReferrersCard } from "./VercelReferrersCard";

const ACCOUNTS_PER_PAGE = 15;
const CLUSTER_SIZE = 5;

interface AccountsTableProps {
  accounts: SystemAccount[];
  vercelAnalytics?: VercelAnalyticsData;
}

export function AccountsTable({ accounts, vercelAnalytics }: AccountsTableProps) {
  const [accountSearch, setAccountSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "USER" | "ADMIN">("all");
  const [accountPage, setAccountPage] = useState(1);

  // Sắp xếp tài khoản:
  // 1. Tất cả tài khoản Quản trị viên (ADMIN) luôn được ghim lên đầu trang (STT 1 và 2)
  // 2. Các tài khoản khác sắp xếp theo lần đăng nhập gần nhất (last_sign_in_at mới nhất lên trước)
  // 3. Nếu chưa đăng nhập: xếp sau cùng theo ngày tạo (created_at mới nhất)
  const sortedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => {
      // 1. Ưu tiên ADMIN lên đầu
      if (a.role === "ADMIN" && b.role !== "ADMIN") return -1;
      if (a.role !== "ADMIN" && b.role === "ADMIN") return 1;

      // 2. Trong các tài khoản ADMIN:
      if (a.role === "ADMIN" && b.role === "ADMIN") {
        if (a.display_name === "mtvzzn") return -1;
        if (b.display_name === "mtvzzn") return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }

      // 3. Các tài khoản còn lại: sắp xếp theo đăng nhập gần nhất
      const timeA = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
      const timeB = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
      if (timeA !== timeB) {
        return timeB - timeA;
      }

      // 4. Nếu chưa đăng nhập: sắp xếp theo ngày đăng ký mới nhất
      const createdA = new Date(a.created_at).getTime();
      const createdB = new Date(b.created_at).getTime();
      return createdB - createdA;
    });
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    return sortedAccounts.filter((acc) => {
      if (roleFilter !== "all" && acc.role !== roleFilter) return false;
      if (!accountSearch.trim()) return true;
      const q = accountSearch.toLowerCase().trim();
      return (
        acc.display_name.toLowerCase().includes(q) ||
        acc.student_code.toLowerCase().includes(q) ||
        acc.email.toLowerCase().includes(q)
      );
    });
  }, [sortedAccounts, accountSearch, roleFilter]);

  const totalAccountPages = Math.max(1, Math.ceil(filteredAccounts.length / ACCOUNTS_PER_PAGE));
  const paginatedAccounts = useMemo(() => {
    const start = (accountPage - 1) * ACCOUNTS_PER_PAGE;
    return filteredAccounts.slice(start, start + ACCOUNTS_PER_PAGE);
  }, [filteredAccounts, accountPage]);

  // 5-page cluster calculation for mobile and desktop
  const currentCluster = Math.floor((accountPage - 1) / CLUSTER_SIZE);
  const clusterStart = currentCluster * CLUSTER_SIZE + 1;
  const clusterEnd = Math.min(clusterStart + CLUSTER_SIZE - 1, totalAccountPages);
  const hasPrevCluster = clusterStart > 1;
  const hasNextCluster = clusterEnd < totalAccountPages;
  const clusterPages = useMemo(() => {
    return Array.from(
      { length: clusterEnd - clusterStart + 1 },
      (_, i) => clusterStart + i
    );
  }, [clusterStart, clusterEnd]);

  const accountStats = useMemo(() => {
    const total = accounts.length;
    const userCount = accounts.filter((a) => a.role === "USER").length;
    const adminCount = accounts.filter((a) => a.role === "ADMIN").length;
    return { total, userCount, adminCount };
  }, [accounts]);

  return (
    <div className="space-y-6">
      {/* Vercel Web Analytics Widget (Referrers & Visitors) */}
      <VercelReferrersCard data={vercelAnalytics} />

      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">
              Tổng tài khoản hệ thống
            </p>
            <Users className="h-4 w-4 text-[var(--color-red)]" />
          </div>
          <p className="mt-1.5 text-2xl font-black text-[var(--color-red)]">{accountStats.total}</p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">Số tài khoản sinh viên và quản trị viên</p>
        </div>
        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">
              Tài khoản Sinh viên (USER)
            </p>
            <GraduationCap className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-1.5 text-2xl font-black text-emerald-600">{accountStats.userCount}</p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">Sinh viên tham gia sử dụng Hanu Hungry</p>
        </div>
        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">
              Quản trị viên (ADMIN)
            </p>
            <ShieldCheck className="h-4 w-4 text-purple-700" />
          </div>
          <p className="mt-1.5 text-2xl font-black text-purple-700">{accountStats.adminCount}</p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">Tài khoản có quyền kiểm duyệt nội dung</p>
        </div>
      </div>

      {/* Directory Table Container */}
      <div className="rounded-2xl border border-[var(--color-line)] bg-white shadow-xs overflow-hidden">
        {/* Header, Search & Filter Controls */}
        <div className="p-4 sm:p-5 border-b border-[var(--color-line)] flex flex-col gap-3 sm:gap-4">
          <div>
            <h3 className="text-base font-extrabold text-[var(--color-ink)] flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--color-red)]" />
              <span>Danh sách người dùng trong hệ thống</span>
            </h3>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">
              Hiển thị {filteredAccounts.length} / {accounts.length} tài khoản (15 tài khoản mỗi trang)
            </p>
          </div>

          {/* Filters & Search Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 w-full">
            <div className="relative w-full sm:max-w-xs flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-muted)] pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm MSSV, tên, email..."
                value={accountSearch}
                onChange={(e) => {
                  setAccountSearch(e.target.value);
                  setAccountPage(1);
                }}
                className="w-full rounded-xl border border-[var(--color-line)] bg-[#fcf9f5] pl-9 pr-8 py-2 text-xs font-medium placeholder:text-[var(--color-muted)] focus:outline-[var(--color-red)] shadow-xs"
              />
              {accountSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setAccountSearch("");
                    setAccountPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] p-0.5 cursor-pointer"
                  aria-label="Xóa tìm kiếm"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 rounded-xl bg-[var(--color-pale)] p-1 border border-[var(--color-line)] overflow-x-auto max-w-full shrink-0">
              <button
                type="button"
                onClick={() => {
                  setRoleFilter("all");
                  setAccountPage(1);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                  roleFilter === "all"
                    ? "bg-[var(--color-ink)] text-white shadow-xs"
                    : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Tất cả ({accountStats.total})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRoleFilter("USER");
                  setAccountPage(1);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                  roleFilter === "USER"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Sinh viên ({accountStats.userCount})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRoleFilter("ADMIN");
                  setAccountPage(1);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                  roleFilter === "ADMIN"
                    ? "bg-purple-700 text-white shadow-xs"
                    : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Admin ({accountStats.adminCount})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredAccounts.length === 0 ? (
          <p className="py-12 text-center text-sm text-[var(--color-muted)]">
            Không tìm thấy tài khoản nào phù hợp với bộ lọc tìm kiếm.
          </p>
        ) : (
          <div className="overflow-x-auto w-full max-w-full touch-pan-x">
            <div className="block sm:hidden text-[11px] text-[var(--color-muted)] px-4 py-1.5 bg-[#fdfaf5] border-b border-[var(--color-line)] italic">
              👉 Cuộn ngang bảng để xem đầy đủ cột thông tin
            </div>
            <table className="w-full text-left text-sm min-w-[620px]">
              <thead className="border-b border-[var(--color-line)] bg-[#fcf8f3] text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 text-center w-14">STT</th>
                  <th className="py-3 px-4">Thành viên</th>
                  <th className="py-3 px-4">Mã sinh viên (MSSV)</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">Vai trò</th>
                  <th className="py-3 px-4">Ngày tham gia</th>
                  <th className="py-3 px-4 text-right">Đăng nhập gần nhất</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)]">
                {paginatedAccounts.map((acc, index) => {
                  const isAdmin = acc.role === "ADMIN";
                  const stt = (accountPage - 1) * ACCOUNTS_PER_PAGE + index + 1;
                  return (
                    <tr key={acc.id} className="hover:bg-[#faf5ee] transition-colors">
                      <td className="py-3.5 px-3 text-center text-xs">
                        {isAdmin ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-900 font-black shadow-2xs">
                            {stt}
                          </span>
                        ) : (
                          <span className="font-semibold text-[var(--color-muted)]">{stt}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {acc.avatar_url ? (
                            <Image
                              src={acc.avatar_url}
                              alt=""
                              width={32}
                              height={32}
                              unoptimized
                              className="h-8 w-8 shrink-0 rounded-full object-cover border border-[var(--color-line)]"
                            />
                          ) : (
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                isAdmin
                                  ? "bg-red-100 text-[var(--color-red)] ring-1 ring-red-300"
                                  : "bg-teal-100 text-teal-800"
                              }`}
                            >
                              {isAdmin ? (
                                <ShieldCheck className="h-4 w-4" />
                              ) : (
                                (acc.display_name || "S")[0].toUpperCase()
                              )}
                            </div>
                          )}
                          <span className="font-bold text-[var(--color-ink)]">
                            {acc.display_name || "Thành viên"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900 font-mono">
                          {acc.student_code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs text-[var(--color-ink)] font-mono">
                          {acc.email}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap shrink-0 ${
                            isAdmin
                              ? "bg-red-50 text-[var(--color-red)] border border-red-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {isAdmin ? (
                            <>
                              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                              <span>Admin</span>
                            </>
                          ) : (
                            <>
                              <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                              <span>Sinh viên</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[var(--color-muted)]">
                        {new Date(acc.created_at).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs">
                        {acc.last_sign_in_at ? (
                          <div>
                            <span className="font-bold text-[var(--color-ink)]">
                              {formatRelativeTime(acc.last_sign_in_at)}
                            </span>
                            <p className="text-[11px] text-[var(--color-muted)]">
                              {new Date(acc.last_sign_in_at).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[var(--color-muted)] italic">Chưa ghi nhận</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls (5 trang liên tiếp nhau kèm nút chuyển cụm trang trước / sau) */}
        {totalAccountPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--color-line)] bg-[#fdfbf7] p-4 text-xs">
            <span className="text-[var(--color-muted)] font-medium text-center sm:text-left">
              Trang <strong className="text-[var(--color-red)] font-bold">{accountPage}</strong> /{" "}
              <strong className="text-[var(--color-ink)] font-bold">{totalAccountPages}</strong> (Hiển thị{" "}
              <strong className="text-[var(--color-ink)] font-bold">
                {(accountPage - 1) * ACCOUNTS_PER_PAGE + 1}
              </strong>{" "}
              –{" "}
              <strong className="text-[var(--color-ink)] font-bold">
                {Math.min(accountPage * ACCOUNTS_PER_PAGE, filteredAccounts.length)}
              </strong>{" "}
              trong tổng số <strong className="text-[var(--color-red)] font-bold">{filteredAccounts.length}</strong> tài khoản)
            </span>

            <div className="flex items-center gap-1 flex-wrap justify-center">
              {/* Nút lùi về cụm 5 trang trước */}
              <button
                type="button"
                disabled={!hasPrevCluster}
                onClick={() => setAccountPage(Math.max(1, clusterStart - CLUSTER_SIZE))}
                className="flex h-8 items-center gap-1 rounded-lg border border-[var(--color-line)] bg-white px-2 text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-pale)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition shadow-xs"
                title="Cụm trang trước (-5 trang)"
                aria-label="Cụm trang trước"
              >
                <ChevronsLeft className="h-4 w-4" />
                <span className="hidden md:inline">Cụm trước</span>
              </button>

              {/* Nút lùi 1 trang */}
              <button
                type="button"
                disabled={accountPage <= 1}
                onClick={() => setAccountPage((p) => Math.max(1, p - 1))}
                className="flex h-8 items-center gap-1 rounded-lg border border-[var(--color-line)] bg-white px-2.5 text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-pale)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition shadow-xs"
                title="Trang trước"
                aria-label="Trang trước"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Trước</span>
              </button>

              {/* 5 trang liên tiếp nhau */}
              <div className="flex items-center gap-1">
                {clusterPages.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAccountPage(p)}
                    className={`h-8 min-w-[2rem] px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                      accountPage === p
                        ? "bg-[var(--color-red)] text-white shadow-xs"
                        : "border border-[var(--color-line)] bg-white text-[var(--color-ink)] hover:bg-[var(--color-pale)]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Nút tiến 1 trang */}
              <button
                type="button"
                disabled={accountPage >= totalAccountPages}
                onClick={() => setAccountPage((p) => Math.min(totalAccountPages, p + 1))}
                className="flex h-8 items-center gap-1 rounded-lg border border-[var(--color-line)] bg-white px-2.5 text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-pale)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition shadow-xs"
                title="Trang sau"
                aria-label="Trang sau"
              >
                <span className="hidden sm:inline">Sau</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Nút tiến sang cụm 5 trang tiếp theo */}
              <button
                type="button"
                disabled={!hasNextCluster}
                onClick={() => setAccountPage(Math.min(totalAccountPages, clusterStart + CLUSTER_SIZE))}
                className="flex h-8 items-center gap-1 rounded-lg border border-[var(--color-line)] bg-white px-2 text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-pale)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition shadow-xs"
                title="Cụm trang tiếp theo (+5 trang)"
                aria-label="Cụm trang tiếp theo"
              >
                <span className="hidden md:inline">Cụm sau</span>
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
