const STUDENT_CODE_PATTERN = /^[0-9]{10}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidStudentCode(value: string): boolean {
  return STUDENT_CODE_PATTERN.test(value);
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_PATTERN.test(value);
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
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
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
