/**
 * Tọa độ trung tâm và các khu vực ngõ ẩm thực quanh Trường Đại học Hà Nội (HANU)
 * Tọa độ gốc HANU: Km9 Đường Nguyễn Trãi, Trung Văn, Nam Từ Liêm, Hà Nội
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export const HANU_CENTER_COORDS: LatLng = {
  lat: 20.9885,
  lng: 105.7954,
};

export const HANU_MAIN_GATE_COORDS: LatLng = {
  lat: 20.9878,
  lng: 105.7963,
};

/**
 * Tọa độ tâm các khu vực ngõ ẩm thực thực tế quanh HANU
 */
export const HANU_ALLEY_CENTROIDS: Record<string, LatLng> = {
  "Ngõ 1": { lat: 20.9870, lng: 105.7975 },
  "Ngõ A4": { lat: 20.9892, lng: 105.7942 },
  "Ngõ A8": { lat: 20.9905, lng: 105.7938 },
  "Ngõ A5": { lat: 20.9897, lng: 105.7948 },
  "Cổng trường": { lat: 20.9878, lng: 105.7963 },
  "Trước cổng trường": { lat: 20.9877, lng: 105.7966 },
  "Ngõ A7": { lat: 20.9901, lng: 105.7940 },
  "Ngõ A3": { lat: 20.9888, lng: 105.7945 },
  "Ngõ A2": { lat: 20.9883, lng: 105.7948 },
  "Ngõ A9": { lat: 20.9908, lng: 105.7935 },
  "Trong trường": { lat: 20.9885, lng: 105.7954 },
};

/**
 * Danh sách các ngõ để lọc nhanh trên bản đồ
 */
export const POPULAR_ALLEY_FILTERS = [
  "Tất cả",
  "Ngõ A4",
  "Ngõ 1",
  "Ngõ A8",
  "Ngõ A5",
  "Cổng trường",
  "Ngõ A7",
  "Ngõ A3",
  "Ngõ A2",
] as const;

/**
 * Hàm băm chuỗi deterministic để tạo số phân bố ổn định theo ID quán
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Lấy tọa độ hiển thị cho quán ăn:
 * 1. Nếu quán đã có tọa độ thật trong DB -> Ưu tiên 100%
 * 2. Nếu chưa có -> Dùng tọa độ ngõ + vi dịch chuyển tự nhiên (micro-offset) để các ghim không đè lên nhau
 */
export function getRestaurantCoordinates(restaurant: {
  id: string;
  area?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}): LatLng {
  if (
    typeof restaurant.latitude === "number" &&
    typeof restaurant.longitude === "number" &&
    Number.isFinite(restaurant.latitude) &&
    Number.isFinite(restaurant.longitude) &&
    restaurant.latitude > 0 &&
    restaurant.longitude > 0
  ) {
    return { lat: restaurant.latitude, lng: restaurant.longitude };
  }

  const areaName = restaurant.area?.trim() || "";
  const baseCoords = HANU_ALLEY_CENTROIDS[areaName] || HANU_CENTER_COORDS;

  // Tính micro-offset theo ID để các quán cùng ngõ hiển thị dàn đều tự nhiên dọc theo ngõ (~15-35m)
  const hash = hashString(restaurant.id);
  const angle = (hash % 360) * (Math.PI / 180);
  const radius = 0.00012 + ((hash % 100) / 100) * 0.00018; // ~15m - 35m theo độ vĩ tuyến

  return {
    lat: baseCoords.lat + radius * Math.cos(angle),
    lng: baseCoords.lng + radius * Math.sin(angle) * 1.1,
  };
}

/**
 * Ước tính khoảng cách đi bộ và thời gian từ Cổng trường HANU tới quán
 */
export function calculateWalkingDistance(target: LatLng, from: LatLng = HANU_MAIN_GATE_COORDS): {
  distanceMeters: number;
  walkingMinutes: number;
  formattedText: string;
} {
  const R = 6371e3; // Bán kính Trái Đất (mét)
  const phi1 = (from.lat * Math.PI) / 180;
  const phi2 = (target.lat * Math.PI) / 180;
  const deltaPhi = ((target.lat - from.lat) * Math.PI) / 180;
  const deltaLambda = ((target.lng - from.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightMeters = Math.round(R * c);

  // Nhân hệ số uốn lượn đường phố/ngõ ngách (~1.25)
  const actualWalkingMeters = Math.max(30, Math.round(straightMeters * 1.25));
  // Vận tốc đi bộ sinh viên trung bình ~75m/phút (4.5 km/h)
  const walkingMinutes = Math.max(1, Math.round(actualWalkingMeters / 75));

  const distanceText =
    actualWalkingMeters >= 1000
      ? `${(actualWalkingMeters / 1000).toFixed(1)}km`
      : `${actualWalkingMeters}m`;

  return {
    distanceMeters: actualWalkingMeters,
    walkingMinutes,
    formattedText: `~${distanceText} • ${walkingMinutes} phút đi bộ`,
  };
}
