import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  displayNameFromEmail,
  isValidStudentCode,
  isValidHanuStudentCode,
  isDisposableOrSpamEmail,
  isAllowedRegistrationEmail,
  isValidEmail,
  normalizeEmail,
  safeReturnPath,
  siteUrl,
  validatePassword,
} from "../lib/auth/validation.ts";
import {
  generateFormGuardToken,
  verifyFormGuardToken,
} from "../lib/security/form-guard.ts";

test("MSSV is exactly ten ASCII digits", () => {
  assert.equal(isValidStudentCode("1234567890"), true);
  for (const invalid of ["123456789", "12345678901", "123456789x", "１２３４５６７８９０", " 1234567890 "]) {
    assert.equal(isValidStudentCode(invalid), false);
  }
});

test("display name is the email local part", () => {
  assert.equal(normalizeEmail(" StudentTester@Hanu.vn "), "studenttester@hanu.vn");
  assert.equal(displayNameFromEmail(" StudentTester@Hanu.vn "), "studenttester");
});

test("password and internal redirect validation", () => {
  assert.ok(validatePassword("short"));
  assert.equal(validatePassword("validpass123"), null);
  assert.equal(safeReturnPath("/history"), "/history");
  assert.equal(safeReturnPath("https://evil.example"), "/");
  assert.equal(safeReturnPath("//evil.example"), "/");
  assert.equal(safeReturnPath("/\\evil.example"), "/");
});

test("auth callback origin uses each Vercel Preview URL and an explicit production URL", () => {
  assert.equal(siteUrl({ NODE_ENV: "production", VERCEL_ENV: "preview", VERCEL_URL: "hanu-hungry-preview.vercel.app", APP_URL: "https://hanu.example" }).origin, "https://hanu-hungry-preview.vercel.app");
  assert.equal(siteUrl({ NODE_ENV: "production", VERCEL_ENV: "production", APP_URL: "https://hanu.example" }).origin, "https://hanu.example");
  assert.throws(() => siteUrl({ NODE_ENV: "production", VERCEL_ENV: "production" }), /APP_URL is required/);
  assert.throws(() => siteUrl({ NODE_ENV: "production", APP_URL: "http://hanu.example" }), /HTTPS/);
});

test("HANU MSSV strictly verifies valid cohort (18-26) and rejects repetitive patterns", () => {
  assert.equal(isValidHanuStudentCode("2401050341"), true);
  assert.equal(isValidHanuStudentCode("2104060021"), true);
  assert.equal(isValidHanuStudentCode("1801010001"), true);
  assert.equal(isValidHanuStudentCode("2601010001"), true);

  // Rejected invalid cohorts or repetitive junk
  assert.equal(isValidHanuStudentCode("5555555555"), false);
  assert.equal(isValidHanuStudentCode("8691058933"), false);
  assert.equal(isValidHanuStudentCode("1723820057"), false);
  assert.equal(isValidHanuStudentCode("1234567890"), false);
  assert.equal(isValidHanuStudentCode("0000000000"), false);
});

test("isDisposableOrSpamEmail blocks attack patterns and disposable domains", () => {
  // Attack patterns
  assert.equal(isDisposableOrSpamEmail("tested_by_hoangxuanlam2007_2401050341@contact.me"), true);
  assert.equal(isValidEmail("tested_by_hoangxuanlam2007_2401050341@contact.me"), false);
  assert.equal(isDisposableOrSpamEmail("student@contact.me"), true);
  assert.equal(isDisposableOrSpamEmail("test@gmaill.com"), true);
  assert.equal(isDisposableOrSpamEmail("bot_12345@gmail.com"), true);
  assert.equal(isDisposableOrSpamEmail("spam@tempmail.com"), true);
  assert.equal(isDisposableOrSpamEmail("user@mailinator.com"), true);

  // Security audit and test domains (RFC 2606)
  assert.equal(isDisposableOrSpamEmail("security-audit-20261104-e6d155@example.invalid"), true);
  assert.equal(isValidEmail("security-audit-20261104-e6d155@example.invalid"), false);
  assert.equal(isDisposableOrSpamEmail("security-audit-b-20261104-364f60@example.invalid"), true);
  assert.equal(isValidEmail("security-audit-b-20261104-364f60@example.invalid"), false);
  assert.equal(isDisposableOrSpamEmail("test@domain.test"), true);
  assert.equal(isDisposableOrSpamEmail("user@local.localhost"), true);

  // Legitimate student emails
  assert.equal(isDisposableOrSpamEmail("2401050341@hanu.edu.vn"), false);
  assert.equal(isValidEmail("2401050341@hanu.edu.vn"), true);
  assert.equal(isDisposableOrSpamEmail("huyennhung1213@gmail.com"), false);
  assert.equal(isValidEmail("huyennhung1213@gmail.com"), true);
});

test("isAllowedRegistrationEmail whitelists trusted providers and university domains", () => {
  // Allowed providers
  assert.equal(isAllowedRegistrationEmail("sinhvien@gmail.com"), true);
  assert.equal(isAllowedRegistrationEmail("student@googlemail.com"), true);
  assert.equal(isAllowedRegistrationEmail("user@outlook.com"), true);
  assert.equal(isAllowedRegistrationEmail("user@hotmail.com"), true);
  assert.equal(isAllowedRegistrationEmail("user@icloud.com"), true);
  assert.equal(isAllowedRegistrationEmail("user@yahoo.com"), true);
  assert.equal(isAllowedRegistrationEmail("user@yahoo.com.vn"), true);
  assert.equal(isAllowedRegistrationEmail("2401050341@hanu.edu.vn"), true);
  assert.equal(isAllowedRegistrationEmail("2401050341@s.hanu.edu.vn"), true);
  assert.equal(isAllowedRegistrationEmail("admin1@hanu.vn"), true);

  // Rejected unapproved / custom / attacker domains
  assert.equal(isAllowedRegistrationEmail("security-audit-20261104-e6d155@example.invalid"), false);
  assert.equal(isAllowedRegistrationEmail("attacker@evil-server.xyz"), false);
  assert.equal(isAllowedRegistrationEmail("random@contact.me"), false);
  assert.equal(isAllowedRegistrationEmail("user@protonmail.com"), false);
});

test("Form guard token creates valid signatures and catches manipulation or fast bot submission", () => {
  const { timestamp, token } = generateFormGuardToken();
  assert.ok(timestamp > 0);
  assert.ok(typeof token === "string" && token.length === 64);

  // Valid signature (setting minDurationMs: 0 for instant test execution)
  const validCheck = verifyFormGuardToken(String(timestamp), token, { minDurationMs: 0 });
  assert.equal(validCheck.valid, true);

  // Missing or altered parameters
  assert.equal(verifyFormGuardToken(null, token).valid, false);
  assert.equal(verifyFormGuardToken(String(timestamp), "tampered_token").valid, false);

  // Too fast submission check (explicitly setting minDurationMs)
  const fastGuard = generateFormGuardToken();
  const fastCheck = verifyFormGuardToken(String(fastGuard.timestamp), fastGuard.token, { minDurationMs: 5000 });
  assert.equal(fastCheck.valid, false);
  if (!fastCheck.valid) {
    assert.equal(fastCheck.reason, "too_fast");
  }

  // Expired token check
  const staleTimestamp = Date.now() - 3 * 60 * 60 * 1000;
  // compute valid signature for stale timestamp
  const staleGuard = generateFormGuardToken();
  const staleToken = createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.BOOTSTRAP_ADMIN_1_PASSWORD || "hanu-hungry-form-guard-secret-salt")
    .update(`form_register:${staleTimestamp}`)
    .digest("hex");
  const expiredCheck = verifyFormGuardToken(String(staleTimestamp), staleToken, { minDurationMs: 0, maxDurationMs: 1000 });
  assert.equal(expiredCheck.valid, false);
  if (!expiredCheck.valid) {
    assert.equal(expiredCheck.reason, "expired");
  }
});

