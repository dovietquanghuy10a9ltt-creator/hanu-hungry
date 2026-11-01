import test from "node:test";
import assert from "node:assert/strict";
import {
  displayNameFromEmail,
  isValidStudentCode,
  isValidHanuStudentCode,
  isDisposableOrSpamEmail,
  isValidEmail,
  normalizeEmail,
  safeReturnPath,
  siteUrl,
  validatePassword,
} from "../lib/auth/validation.ts";

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

  // Legitimate student emails
  assert.equal(isDisposableOrSpamEmail("2401050341@hanu.edu.vn"), false);
  assert.equal(isValidEmail("2401050341@hanu.edu.vn"), true);
  assert.equal(isDisposableOrSpamEmail("huyennhung1213@gmail.com"), false);
  assert.equal(isValidEmail("huyennhung1213@gmail.com"), true);
});

