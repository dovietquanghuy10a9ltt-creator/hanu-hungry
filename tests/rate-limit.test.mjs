import test from "node:test";
import assert from "node:assert/strict";

test("Rate limiter window calculation logic", () => {
  const now = new Date("2026-10-10T00:00:00Z");
  const firstAttempt = new Date("2026-10-10T00:00:30Z");
  const windowSeconds = 60;

  const windowMs = windowSeconds * 1000;
  const isExpired = now.getTime() - firstAttempt.getTime() > windowMs;
  assert.equal(isExpired, false);

  const later = new Date("2026-10-10T00:01:05Z");
  const isExpiredLater = later.getTime() - firstAttempt.getTime() > windowMs;
  assert.equal(isExpiredLater, false); // 35 seconds elapsed

  const muchLater = new Date("2026-10-10T00:01:35Z");
  const isExpiredMuchLater = muchLater.getTime() - firstAttempt.getTime() > windowMs;
  assert.equal(isExpiredMuchLater, true); // 65 seconds elapsed
});

test("Rate limiter cooldown remaining seconds computation", () => {
  const now = new Date("2026-10-10T00:00:00Z");
  const blockedUntil = new Date("2026-10-10T00:01:30Z");

  const diffMs = blockedUntil.getTime() - now.getTime();
  const remainingSeconds = Math.max(1, Math.ceil(diffMs / 1000));
  assert.equal(remainingSeconds, 90);
});

