const missingValues = new Set(["none", "null", "n/a", "na", "undefined", "-"]);

export function readableText(value: string | null | undefined, fallback = "Thông tin đang được cập nhật") {
  const clean = value?.trim();
  return clean && !missingValues.has(clean.toLowerCase()) ? clean : fallback;
}

export function formatVnd(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${new Intl.NumberFormat("vi-VN").format(value)}đ`
    : "Chưa có dữ liệu giá";
}

export function formatPrice(priceText: string | null | undefined, min?: number | null, max?: number | null) {
  const clean = priceText?.trim();
  if (clean && !missingValues.has(clean.toLowerCase())) return clean;
  if (typeof min !== "number") return "Chưa có dữ liệu giá";
  if (typeof max === "number" && max !== min) return `${formatVnd(min)} – ${formatVnd(max)}`;
  return formatVnd(min);
}

export function mapsUrl(location: {
  latitude?: number | null;
  longitude?: number | null;
  address_text?: string | null;
  plus_code?: string | null;
}) {
  if (typeof location.latitude === "number" && typeof location.longitude === "number"
    && Number.isFinite(location.latitude) && Number.isFinite(location.longitude)) {
    return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
  }
  const text = location.address_text?.trim() || location.plus_code?.trim();
  return text ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}` : null;
}
