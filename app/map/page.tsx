import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/session";
import { listCatalog } from "@/features/restaurants/catalog";
import { MapPageWrapper } from "@/features/map/components/MapPageWrapper";

export const metadata: Metadata = {
  title: "Bản đồ ẩm thực HANU (Sắp mở)",
  description:
    "Bản đồ tương tác 50+ quán ăn ngon quanh Đại học Hà Nội (HANU). Tính năng đang trong giai đoạn thử nghiệm hoàn thiện và sắp ra mắt.",
  alternates: {
    canonical: "https://hanuhungry.id.vn/map",
  },
  openGraph: {
    title: "Bản đồ ẩm thực HANU (Sắp mở) | Hanu Hungry",
    description:
      "Bản đồ tương tác 50+ quán ăn ngon quanh Đại học Hà Nội (HANU). Tính năng đang trong giai đoạn thử nghiệm hoàn thiện và sắp ra mắt.",
    url: "https://hanuhungry.id.vn/map",
  },
};

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const [catalog, account, params] = await Promise.all([
    listCatalog(),
    getCurrentProfile(),
    searchParams,
  ]);

  const isAdmin = account?.profile?.role === "ADMIN";
  const isPreview = params.preview === "1" || params.preview === "true" || params.preview === "admin";

  // Chế độ xem thử dành riêng cho Quản trị viên để test
  if (isAdmin && isPreview) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">🛠️</span>
            <span>
              <strong>Chế độ kiểm thử Quản trị viên:</strong> Bạn đang xem thử giao diện Bản đồ. Khách &amp; sinh viên hiện thấy màn hình thông báo &quot;Sắp mở&quot;.
            </span>
          </div>
          <Link
            href="/map"
            className="rounded-lg bg-amber-200 px-2.5 py-1 text-xs font-bold text-amber-900 transition hover:bg-amber-300"
          >
            Đóng xem thử
          </Link>
        </div>
        <MapPageWrapper initialCatalog={catalog} />
      </div>
    );
  }

  // Màn hình thông báo "Sắp mở" cho toàn bộ người dùng
  return (
    <div className="mx-auto max-w-md py-20 sm:py-32 text-center space-y-4">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--color-pale)] text-4xl shadow-xs">
        🗺️
      </div>
      <div className="space-y-2">
        <h1 className="section-title text-2xl sm:text-3xl text-[var(--color-ink)]">
          Bản đồ ẩm thực HANU
        </h1>
        <p className="text-sm font-bold text-[var(--color-red)] tracking-wide">
          Sắp mở
        </p>
      </div>
      {isAdmin && (
        <div className="pt-4">
          <Link
            href="/map?preview=1"
            className="button button-outline border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs"
          >
            🛠️ Xem thử Bản đồ (Admin Test)
          </Link>
        </div>
      )}
    </div>
  );
}
