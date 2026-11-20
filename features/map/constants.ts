/**
 * Tọa độ trung tâm và các khu vực ngõ ẩm thực quanh Trường Đại học Hà Nội (HANU)
 * Tọa độ gốc HANU: Km9 Đường Nguyễn Trãi, Trung Văn, Nam Từ Liêm, Hà Nội
 */

import { decodePlusCode, extractPlusCode } from "./plus-code.ts";

export interface LatLng {
  lat: number;
  lng: number;
}

export const HANU_CENTER_COORDS: LatLng = {
  lat: 20.9885,
  lng: 105.7954,
};

/**
 * Cổng chính HANU — mốc tính khoảng cách đi bộ. Lấy từ Plus Code "XQQW+6F", mã mà các quán
 * khu "Cổng trường" dùng trên Google Maps (nằm đúng mép đông nam khuôn viên).
 */
export const HANU_MAIN_GATE_COORDS: LatLng = {
  lat: 20.9880625,
  lng: 105.7961875,
};

/**
 * Đường bao khuôn viên Trường Đại học Hà Nội, lấy từ OpenStreetMap
 * (way 829266414, amenity=university, "Trường Đại học Hà Nội"). Thứ tự điểm theo [lat, lng].
 */
export const HANU_CAMPUS_OUTLINE: [number, number][] = [
  [20.987853, 105.795218],
  [20.987658, 105.795368],
  [20.988152, 105.796079],
  [20.989169, 105.797509],
  [20.989334, 105.797353],
  [20.989168, 105.797144],
  [20.989247, 105.797073],
  [20.988969, 105.796724],
  [20.990314, 105.795603],
  [20.990446, 105.795759],
  [20.990483, 105.795784],
  [20.990901, 105.795458],
  [20.99057, 105.794986],
  [20.990144, 105.794412],
  [20.989966, 105.794229],
  [20.989461, 105.793906],
  [20.988985, 105.794308],
  [20.988542, 105.794658],
];

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
/**
 * Toạ độ thật của quán, theo đúng thứ tự mà nút "Mở trên Google Maps" (mapsUrl) dùng:
 * 1. latitude/longitude trong DB  2. Plus Code (cột plus_code, hoặc nằm trong address_text).
 * Trả về null nếu quán chưa có dữ liệu vị trí thật.
 */
export function getRealRestaurantCoordinates(restaurant: {
  latitude?: number | null;
  longitude?: number | null;
  plus_code?: string | null;
  address_text?: string | null;
}): LatLng | null {
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

  const plusCode = extractPlusCode(restaurant.plus_code) ?? extractPlusCode(restaurant.address_text);
  if (plusCode) {
    const area = decodePlusCode(plusCode, HANU_CENTER_COORDS);
    if (area) return { lat: area.lat, lng: area.lng };
  }

  return null;
}

export function getRestaurantCoordinates(restaurant: {
  id: string;
  area?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  plus_code?: string | null;
  address_text?: string | null;
}): LatLng {
  const real = getRealRestaurantCoordinates(restaurant);
  if (real) return real;

  // Quán chưa có vị trí thật: ước lượng theo ngõ để vẫn hiện trên bản đồ.

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

/**
 * Xếp các ghim trùng đúng một vị trí (nhiều quán chung Plus Code) thành vòng tròn bán kính ~5m
 * quanh điểm thật để có thể bấm từng ghim. Ghim không trùng giữ nguyên vị trí.
 */
export function spreadOverlappingCoordinates(
  items: { id: string; coords: LatLng }[],
  radiusDegrees = 0.000045
): Map<string, LatLng> {
  const groups = new Map<string, { id: string; coords: LatLng }[]>();
  for (const item of items) {
    const key = `${item.coords.lat.toFixed(6)},${item.coords.lng.toFixed(6)}`;
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }

  const result = new Map<string, LatLng>();
  for (const group of groups.values()) {
    if (group.length === 1) {
      result.set(group[0].id, group[0].coords);
      continue;
    }
    // Sắp theo id để vị trí của từng quán ổn định giữa các lần render
    const sorted = [...group].sort((a, b) => a.id.localeCompare(b.id));
    const lngScale = 1 / Math.cos((sorted[0].coords.lat * Math.PI) / 180);
    sorted.forEach((item, index) => {
      const angle = (2 * Math.PI * index) / sorted.length - Math.PI / 2;
      result.set(item.id, {
        lat: item.coords.lat + radiusDegrees * Math.sin(angle),
        lng: item.coords.lng + radiusDegrees * Math.cos(angle) * lngScale,
      });
    });
  }
  return result;
}
