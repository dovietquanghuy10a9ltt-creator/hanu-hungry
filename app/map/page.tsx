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
    <div className="mx-auto max-w-2xl py-14 sm:py-24 text-center space-y-6">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--color-pale)] text-4xl shadow-sm animate-bounce">
        🗺️
      </div>
      <div className="space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f0c2c6] bg-[#fdf2f2] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[var(--color-red)] shadow-xs">
          <span className="h-2 w-2 rounded-full bg-[var(--color-red)] animate-ping" />
          Đang hoàn thiện · Sắp mở
        </span>
        <h1 className="section-title text-3xl sm:text-4xl text-[var(--color-ink)]">
          Bản đồ ẩm thực HANU
        </h1>
        <p className="text-[var(--color-muted)] text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          Tính năng bản đồ tương tác với toạ độ thực tế và khoảng cách đi bộ của hơn 50+ quán ăn quanh trường đang được đội ngũ hoàn thiện và thử nghiệm kỹ lưỡng. Sẽ sớm ra mắt các bạn Hanuer trong thời gian tới!
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
        <Link href="/restaurants" className="button button-primary">
          Khám phá danh sách 50+ quán ăn →
        </Link>
        <Link href="/" className="button button-secondary">
          Về trang chủ
        </Link>
        {isAdmin && (
          <Link
            href="/map?preview=1"
            className="button button-outline border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
          >
            🛠️ Xem thử Bản đồ (Admin Test)
          </Link>
        )}
      </div>
    </div>
  );
}
