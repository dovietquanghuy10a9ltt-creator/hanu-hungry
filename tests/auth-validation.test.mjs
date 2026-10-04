import test from "node:test";
import assert from "node:assert/strict";
import {
  displayNameFromEmail,
  isValidStudentCode,
  normalizeEmail,
  safeReturnPath,
  siteUrl,
  validatePassword,
} from "../lib/auth/validation.ts";

test("MSSV is exactly ten ASCII digits", () => {
  assert.equal(isValidStudentCode("2404060021"), true);
  for (const invalid of ["240406002", "24040600211", "240406002x", "２４０４０６００２１", " 2404060021 "]) {
    assert.equal(isValidStudentCode(invalid), false);
  }
});

test("display name is the email local part", () => {
  assert.equal(normalizeEmail(" LinhPhamHN342@Gmail.com "), "linhphamhn342@gmail.com");
  assert.equal(displayNameFromEmail(" LinhPhamHN342@Gmail.com "), "linhphamhn342");
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
