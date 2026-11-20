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

export interface AlleyCorridor {
  start: LatLng;
  end: LatLng;
}

/**
 * Hành lang tuyến tính (Start - End) của từng con ngõ thực tế quanh HANU
 * Cho phép phân bổ các quán trải dài tự nhiên dọc hai bên lòng ngõ như số nhà thật
 */
export const HANU_ALLEY_CORRIDORS: Record<string, AlleyCorridor> = {
  // Ngõ A4 kẹp giữa Sân vận động HANU và Đường Lương Thế Vinh
  "Ngõ A4": {
    start: { lat: 20.98935, lng: 105.79645 },
    end: { lat: 20.98978, lng: 105.79685 },
  },
  // Ngõ 1 nằm cùng phía cổng HANU (số 246 Nguyễn Trãi chạy dọc vào khu ẩm thực)
  "Ngõ 1": {
    start: { lat: 20.98750, lng: 105.79675 },
    end: { lat: 20.98795, lng: 105.79718 },
  },
  // Dãy tập thể A8 nằm giáp phía Bắc SVĐ / sau nhà D11 (thuộc địa phận HANU)
  "Ngõ A8": {
    start: { lat: 20.99080, lng: 105.79585 },
    end: { lat: 20.99120, lng: 105.79612 },
  },
  // Vỉa hè phía trường dọc theo đường Nguyễn Trãi hai bên Cổng chính
  "Trước cổng trường": {
    start: { lat: 20.98755, lng: 105.79610 },
    end: { lat: 20.98770, lng: 105.79665 },
  },
  "Ngõ A5": {
    start: { lat: 20.98990, lng: 105.79635 },
    end: { lat: 20.99020, lng: 105.79665 },
  },
  "Ngõ A6": {
    start: { lat: 20.99020, lng: 105.79620 },
    end: { lat: 20.99050, lng: 105.79648 },
  },
  "Ngõ A7": {
    start: { lat: 20.99060, lng: 105.79605 },
    end: { lat: 20.99090, lng: 105.79630 },
  },
  "Ngõ A3": {
    start: { lat: 20.98900, lng: 105.79670 },
    end: { lat: 20.98930, lng: 105.79700 },
  },
  "Ngõ A2": {
    start: { lat: 20.98850, lng: 105.79685 },
    end: { lat: 20.98880, lng: 105.79715 },
  },
  "Ngõ A9": {
    start: { lat: 20.99120, lng: 105.79565 },
    end: { lat: 20.99140, lng: 105.79585 },
  },
  "Giữa ngõ A4-A5": {
    start: { lat: 20.98970, lng: 105.79640 },
    end: { lat: 20.98995, lng: 105.79668 },
  },
  "Giữa ngõ A7-A8": {
    start: { lat: 20.99075, lng: 105.79590 },
    end: { lat: 20.99105, lng: 105.79618 },
  },
  "Cổng trường": {
    start: { lat: 20.98770, lng: 105.79620 },
    end: { lat: 20.98790, lng: 105.79640 },
  },
  "Trong trường": {
    start: { lat: 20.98830, lng: 105.79520 },
    end: { lat: 20.98870, lng: 105.79560 },
  },
};

/**
 * Tọa độ tâm các khu vực ngõ ẩm thực thực tế quanh HANU (giữ tương thích)
 */
export const HANU_ALLEY_CENTROIDS: Record<string, LatLng> = {
  "Ngõ 1": { lat: 20.9877, lng: 105.7970 },
  "Ngõ A4": { lat: 20.9896, lng: 105.7967 },
  "Ngõ A5": { lat: 20.9901, lng: 105.7965 },
  "Ngõ A6": { lat: 20.9904, lng: 105.7963 },
  "Ngõ A7": { lat: 20.9908, lng: 105.7961 },
  "Ngõ A8": { lat: 20.9910, lng: 105.7960 },
  "Ngõ A3": { lat: 20.9891, lng: 105.7969 },
  "Ngõ A2": { lat: 20.9886, lng: 105.7970 },
  "Ngõ A9": { lat: 20.9913, lng: 105.7957 },
  "Giữa ngõ A4-A5": { lat: 20.9898, lng: 105.7966 },
  "Giữa ngõ A7-A8": { lat: 20.9910, lng: 105.7960 },
  "Cổng trường": { lat: 20.9878, lng: 105.7963 },
  "Trước cổng trường": { lat: 20.9876, lng: 105.7964 },
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
  const corridor = HANU_ALLEY_CORRIDORS[areaName];

  // 1. Nếu ngõ có hành lang tuyến tính, phân bổ dọc theo chiều dài ngõ như các số nhà thật
  if (corridor) {
    const hash = hashString(restaurant.id);
    // Tỷ lệ t dọc theo chiều dài ngõ (12% - 88% để không đè vào ngã ba/ngã tư đầu ngõ)
    const t = 0.12 + ((hash % 100) / 100) * 0.76;

    const baseLat = corridor.start.lat + t * (corridor.end.lat - corridor.start.lat);
    const baseLng = corridor.start.lng + t * (corridor.end.lng - corridor.start.lng);

    // Vector pháp tuyến vuông góc với trục ngõ để tách quán sang hai bên vỉa hè (~1.5m - 3.5m)
    const dLat = corridor.end.lat - corridor.start.lat;
    const dLng = corridor.end.lng - corridor.start.lng;
    const len = Math.sqrt(dLat * dLat + dLng * dLng) || 1;
    const perpLat = -dLng / len;
    const perpLng = dLat / len;

    const side = (hash >> 4) % 2 === 0 ? 1 : -1;
    const lateralMeters = 0.000015 + ((hash % 30) / 30) * 0.00002;

    return {
      lat: baseLat + perpLat * lateralMeters * side,
      lng: baseLng + perpLng * lateralMeters * side,
    };
  }

  // 2. Dự phòng cho các khu vực chưa có corridor cụ thể
  const baseCoords = HANU_ALLEY_CENTROIDS[areaName] || HANU_CENTER_COORDS;
  const hash = hashString(restaurant.id);
  const angle = (hash % 360) * (Math.PI / 180);
  const radius = 0.00004 + ((hash % 100) / 100) * 0.00006; // ~4m - 10m

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
