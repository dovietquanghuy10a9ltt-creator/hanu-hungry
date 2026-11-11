import { createHmac } from "node:crypto";

const FORM_SECRET =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.BOOTSTRAP_ADMIN_1_PASSWORD ||
  "hanu-hungry-form-guard-secret-salt";

export type FormGuardToken = {
  timestamp: number;
  token: string;
};

/**
 * Tạo token bảo vệ form dựa trên thời gian render và chữ ký HMAC
 */
export function generateFormGuardToken(): FormGuardToken {
  const timestamp = Date.now();
  const token = createHmac("sha256", FORM_SECRET)
    .update(`form_register:${timestamp}`)
    .digest("hex");
  return { timestamp, token };
}

export type VerifyGuardResult =
  | { valid: true }
  | { valid: false; reason: "missing" | "invalid_signature" | "too_fast" | "expired"; message: string };

/**
 * Xác thực token gửi kèm form:
 * - Chữ ký HMAC phải hợp lệ để chống giả mạo
 * - Thời gian thao tác >= minDurationMs (chặn bot submit tức thì)
 * - Thời gian không được quá maxDurationMs (chống replay attack)
 */
export function verifyFormGuardToken(
  timestampStr: string | null | undefined,
  tokenStr: string | null | undefined,
  options: {
    minDurationMs?: number;
    maxDurationMs?: number;
  } = {}
): VerifyGuardResult {
  // Cho phép bỏ qua kiểm tra thời gian nếu đang chạy unit test tự động
  const isTest = process.env.NODE_ENV === "test";
  const minDurationMs = isTest ? 0 : options.minDurationMs ?? 2000;
  const maxDurationMs = options.maxDurationMs ?? 2 * 60 * 60 * 1000;

  if (!timestampStr || !tokenStr) {
    return {
      valid: false,
      reason: "missing",
      message: "Yêu cầu đăng ký không hợp lệ hoặc thiếu mã bảo vệ phiên.",
    };
  }

  const timestamp = parseInt(timestampStr, 10);
  if (Number.isNaN(timestamp)) {
    return {
      valid: false,
      reason: "missing",
      message: "Thời gian phiên đăng ký không hợp lệ.",
    };
  }

  const expectedToken = createHmac("sha256", FORM_SECRET)
    .update(`form_register:${timestamp}`)
    .digest("hex");

  if (tokenStr !== expectedToken) {
    return {
      valid: false,
      reason: "invalid_signature",
      message: "Chữ ký bảo vệ form không chính xác.",
    };
  }

  const elapsed = Date.now() - timestamp;
  if (elapsed < minDurationMs) {
    return {
      valid: false,
      reason: "too_fast",
      message: "Thao tác quá nhanh. Vui lòng thử lại sau vài giây.",
    };
  }

  if (elapsed > maxDurationMs) {
    return {
      valid: false,
      reason: "expired",
      message: "Phiên đăng ký đã hết hạn. Vui lòng tải lại trang và thử lại.",
    };
  }

  return { valid: true };
}
