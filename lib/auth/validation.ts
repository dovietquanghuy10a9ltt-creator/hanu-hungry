const STUDENT_CODE_PATTERN = /^[0-9]{10}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Danh sách domain rác, temp mail và typo spam
export const DISPOSABLE_OR_SPAM_DOMAINS = new Set([
  "contact.me",
  "gmaill.com",
  "gmai.com",
  "yaho.com",
  "hotmial.com",
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "mailinator.com",
  "guerrillamail.com",
  "throwawaymail.com",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "dispostable.com",
  "maildrop.cc",
  "mytemp.email",
  "mohmal.com",
  "fakemailgenerator.com",
]);

export function isValidStudentCode(value: string): boolean {
  return STUDENT_CODE_PATTERN.test(value);
}

/**
 * Kiểm tra mã sinh viên trường Đại học Hà Nội (HANU):
 * - Đúng 10 chữ số
 * - Khóa tuyển sinh hợp lệ (2 chữ số đầu từ 18 đến 26: sinh viên K18 - K26)
 * - Không phải dãy số lặp đơn giản (5555555555, 1111111111,...)
 */
export function isValidHanuStudentCode(value: string): boolean {
  if (!STUDENT_CODE_PATTERN.test(value)) return false;
  // Chặn các dãy số lặp
  if (/^(\d)\1{9}$/.test(value)) return false;
  if (value === "1234567890" || value === "0123456789") return false;

  const cohort = parseInt(value.slice(0, 2), 10);
  // Khóa hợp lệ của sinh viên HANU đang theo học (K18: 2018 đến K26: 2026)
  return cohort >= 18 && cohort <= 26;
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isDisposableOrSpamEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  const parts = normalized.split("@");
  if (parts.length !== 2) return true;
  const [localPart, domain] = parts;

  // Kiểm tra domain rác
  if (DISPOSABLE_OR_SPAM_DOMAINS.has(domain)) return true;

  // Kiểm tra prefix tấn công của script bot
  if (localPart.includes("tested_by_") || localPart.includes("hoangxuanlam")) {
    return true;
  }

  // Chặn các email bot tự sinh có dạng test_... hoặc bot_...
  if (/^bot[_-]?\d+$/i.test(localPart)) return true;

  return false;
}

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_PATTERN.test(value) && !isDisposableOrSpamEmail(value);
}

export function displayNameFromEmail(email: string): string {
  return normalizeEmail(email).split("@", 1)[0] ?? "";
}

export function validatePassword(value: string): string | null {
  if (value.length < 8) return "Mật khẩu cần ít nhất 8 ký tự.";
  if (value.length > 72) return "Mật khẩu không được quá 72 ký tự.";
  return null;
}

export function safeReturnPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\") || Array.from(value).some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) {
    return fallback;
  }
  return value;
}

export function siteUrl(env: NodeJS.ProcessEnv = process.env): URL {
  const previewHost = env.VERCEL_ENV === "preview" ? env.VERCEL_URL : undefined;
  const configured = previewHost ? `https://${previewHost}` : env.APP_URL;
  if (!configured && env.NODE_ENV === "production") {
    throw new Error("APP_URL is required in production outside Vercel Preview");
  }
  const url = new URL(configured || "http://localhost:3000");
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error("APP_URL must use HTTP or HTTPS");
  }
  if (env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("APP_URL must use HTTPS in production");
  }
  return url;
}
