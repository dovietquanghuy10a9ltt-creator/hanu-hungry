/**
 * Giải mã Plus Code (Open Location Code) — cùng hệ toạ độ Google Maps dùng khi tìm "XQQW+VFR".
 * Hỗ trợ mã đầy đủ ("7PH7XQQW+VFR") và mã rút gọn ("XQQW+VFR"), mã rút gọn được khôi phục theo
 * điểm tham chiếu gần nhất (mặc định là khu HANU). Thuật toán theo đặc tả:
 * https://github.com/google/open-location-code/blob/main/docs/specification.md
 */

const ALPHABET = "23456789CFGHJMPQRVWX";
const PAIR_RESOLUTIONS = [20, 1, 0.05, 0.0025, 0.000125];
const GRID_ROWS = 5;
const GRID_COLUMNS = 4;
const SEPARATOR_POSITION = 8;

export interface PlusCodeArea {
  lat: number;
  lng: number;
  /** Kích thước ô theo độ, dùng để biết độ chính xác (~14m với 10 ký tự, ~3m với 11 ký tự). */
  latSize: number;
  lngSize: number;
}

/** Tìm Plus Code trong một chuỗi bất kỳ, ví dụ "XQQW+6F Đại Mỗ, Hà Nội" -> "XQQW+6F". */
export function extractPlusCode(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = text.toUpperCase().match(/(?:^|[^0-9A-Z])([2-9CFGHJMPQRVWX]{2,8}\+[2-9CFGHJMPQRVWX]{0,7})(?![0-9A-Z])/);
  return match ? match[1] : null;
}

function digitValue(char: string): number {
  return ALPHABET.indexOf(char);
}

function isValidCode(code: string): boolean {
  const sep = code.indexOf("+");
  if (sep === -1 || sep !== code.lastIndexOf("+") || sep > SEPARATOR_POSITION || sep % 2 !== 0) {
    return false;
  }
  const digits = code.replace("+", "");
  return digits.length >= 2 && [...digits].every((c) => digitValue(c) !== -1);
}

/** Mã hoá toạ độ thành 8 ký tự đầu (dùng để lấy tiền tố khi khôi phục mã rút gọn). */
function encodePrefix(lat: number, lng: number): string {
  let latVal = Math.min(Math.max(lat, -90), 90 - 1e-10) + 90;
  let lngVal = (((lng + 180) % 360) + 360) % 360;
  let code = "";
  for (const resolution of PAIR_RESOLUTIONS.slice(0, 4)) {
    const latDigit = Math.floor(latVal / resolution);
    const lngDigit = Math.floor(lngVal / resolution);
    latVal -= latDigit * resolution;
    lngVal -= lngDigit * resolution;
    code += ALPHABET[latDigit] + ALPHABET[lngDigit];
  }
  return code;
}

/** Giải mã một mã đầy đủ (có đủ 8 ký tự trước dấu "+") thành tâm ô. */
function decodeFull(code: string): PlusCodeArea | null {
  if (code.indexOf("+") !== SEPARATOR_POSITION || !isValidCode(code)) return null;
  const digits = code.replace("+", "");
  let lat = -90;
  let lng = -180;
  let latSize = PAIR_RESOLUTIONS[0];
  let lngSize = PAIR_RESOLUTIONS[0];

  const pairDigits = digits.slice(0, 10);
  for (let i = 0; i < pairDigits.length; i += 2) {
    const resolution = PAIR_RESOLUTIONS[i / 2];
    lat += digitValue(pairDigits[i]) * resolution;
    lng += digitValue(pairDigits[i + 1] ?? "2") * resolution;
    latSize = resolution;
    lngSize = resolution;
  }

  for (const char of digits.slice(10)) {
    latSize /= GRID_ROWS;
    lngSize /= GRID_COLUMNS;
    const value = digitValue(char);
    lat += Math.floor(value / GRID_COLUMNS) * latSize;
    lng += (value % GRID_COLUMNS) * lngSize;
  }

  return { lat: lat + latSize / 2, lng: lng + lngSize / 2, latSize, lngSize };
}

/**
 * Giải mã Plus Code. Mã rút gọn được ghép tiền tố từ điểm tham chiếu và chọn ô gần điểm đó nhất,
 * giống cách Google Maps hiểu "XQQW+VFR Đại Mỗ, Hà Nội".
 */
export function decodePlusCode(
  rawCode: string,
  reference: { lat: number; lng: number }
): PlusCodeArea | null {
  const code = rawCode.trim().toUpperCase();
  if (!isValidCode(code)) return null;

  const sep = code.indexOf("+");
  if (sep === SEPARATOR_POSITION) return decodeFull(code);

  const paddingLength = SEPARATOR_POSITION - sep;
  const resolution = Math.pow(20, 2 - paddingLength / 2);
  const area = decodeFull(encodePrefix(reference.lat, reference.lng).slice(0, paddingLength) + code);
  if (!area) return null;

  let { lat, lng } = area;
  const half = resolution / 2;
  if (reference.lat + half < lat && lat - resolution >= -90) lat -= resolution;
  else if (reference.lat - half > lat && lat + resolution <= 90) lat += resolution;
  if (reference.lng + half < lng) lng -= resolution;
  else if (reference.lng - half > lng) lng += resolution;

  return { ...area, lat, lng };
}
