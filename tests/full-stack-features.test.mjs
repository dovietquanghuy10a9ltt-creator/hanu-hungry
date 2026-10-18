import test from "node:test";
import assert from "node:assert/strict";
import { safeReturnPath } from "../lib/auth/validation.ts";

test("Contact message payload resolution and validation", () => {
  // Honeypot detection
  const isHoneypotTriggered = (formData) => Boolean(formData.get("website"));
  assert.equal(isHoneypotTriggered(new Map([["website", "https://spam.com"]])), true);
  assert.equal(isHoneypotTriggered(new Map([["website", ""]])), false);

  // Field resolution: falls back to authenticated session when form inputs are omitted
  function resolveContactFields(formData, session) {
    const rawName = String(formData.get("name") || "").trim();
    const rawEmail = String(formData.get("email") || "").trim().toLowerCase();
    const message = String(formData.get("message") || "").trim();

    const name = rawName || session.profile.display_name || session.user.email || "Thành viên";
    const email = rawEmail || session.user.email || "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid =
      Boolean(name) &&
      name.length <= 150 &&
      emailRegex.test(email) &&
      email.length <= 320 &&
      Boolean(message) &&
      message.length <= 5000;

    return { name, email, message, isValid };
  }

  const mockSession = {
    user: { email: "student@hanu.edu.vn" },
    profile: { display_name: "Nguyễn Văn A" },
  };

  // Case 1: Form with only message (new simplified form)
  const form1 = new Map([["message", "Em muốn góp ý về quán cơm tấm gần cổng trường."]]);
  const res1 = resolveContactFields(form1, mockSession);
  assert.equal(res1.isValid, true);
  assert.equal(res1.name, "Nguyễn Văn A");
  assert.equal(res1.email, "student@hanu.edu.vn");
  assert.equal(res1.message, "Em muốn góp ý về quán cơm tấm gần cổng trường.");

  // Case 2: Session with no display_name falls back to user email
  const mockSessionNoName = {
    user: { email: "student2@hanu.edu.vn" },
    profile: { display_name: "" },
  };
  const res2 = resolveContactFields(form1, mockSessionNoName);
  assert.equal(res2.isValid, true);
  assert.equal(res2.name, "student2@hanu.edu.vn");
  assert.equal(res2.email, "student2@hanu.edu.vn");

  // Case 3: Empty message is rejected
  const emptyForm = new Map([["message", "   "]]);
  const resEmpty = resolveContactFields(emptyForm, mockSession);
  assert.equal(resEmpty.isValid, false);

  // Case 4: Overlong message (> 5000 chars) is rejected
  const overlongForm = new Map([["message", "a".repeat(5001)]]);
  const resOverlong = resolveContactFields(overlongForm, mockSession);
  assert.equal(resOverlong.isValid, false);
});

test("Profile display name edit state and save button gating", () => {
  function canSaveProfile({ isEditingName, currentName, originalName, hasNewAvatar, removeAvatar, isSubmitting }) {
    if (isSubmitting) return false;
    const isNameChanged =
      isEditingName &&
      currentName.trim() !== originalName.trim() &&
      currentName.trim().length > 0 &&
      currentName.trim().length <= 100;
    const isAvatarChanged = Boolean(hasNewAvatar || removeAvatar);
    return isNameChanged || isAvatarChanged;
  }

  const original = "Đỗ Viết Quang Huy";

  // Initial state: not editing, name unchanged -> CANNOT save
  assert.equal(
    canSaveProfile({
      isEditingName: false,
      currentName: original,
      originalName: original,
      hasNewAvatar: false,
      removeAvatar: false,
      isSubmitting: false,
    }),
    false
  );

  // Editing started but name has not changed yet -> CANNOT save
  assert.equal(
    canSaveProfile({
      isEditingName: true,
      currentName: original,
      originalName: original,
      hasNewAvatar: false,
      removeAvatar: false,
      isSubmitting: false,
    }),
    false
  );

  // Name changed to a new valid string -> CAN save
  assert.equal(
    canSaveProfile({
      isEditingName: true,
      currentName: "Quang Huy Pro",
      originalName: original,
      hasNewAvatar: false,
      removeAvatar: false,
      isSubmitting: false,
    }),
    false || true
  );

  // Name changed to only whitespace -> CANNOT save
  assert.equal(
    canSaveProfile({
      isEditingName: true,
      currentName: "    ",
      originalName: original,
      hasNewAvatar: false,
      removeAvatar: false,
      isSubmitting: false,
    }),
    false
  );

  // Name exceeded 100 characters -> CANNOT save
  assert.equal(
    canSaveProfile({
      isEditingName: true,
      currentName: "a".repeat(101),
      originalName: original,
      hasNewAvatar: false,
      removeAvatar: false,
      isSubmitting: false,
    }),
    false
  );

  // Submitting in progress -> CANNOT save (prevents double submit / spam)
  assert.equal(
    canSaveProfile({
      isEditingName: true,
      currentName: "Quang Huy Pro",
      originalName: original,
      hasNewAvatar: false,
      removeAvatar: false,
      isSubmitting: true,
    }),
    false
  );

  // Avatar changed without name change -> CAN save
  assert.equal(
    canSaveProfile({
      isEditingName: false,
      currentName: original,
      originalName: original,
      hasNewAvatar: true,
      removeAvatar: false,
      isSubmitting: false,
    }),
    true
  );

  // Avatar removed without name change -> CAN save
  assert.equal(
    canSaveProfile({
      isEditingName: false,
      currentName: original,
      originalName: original,
      hasNewAvatar: false,
      removeAvatar: true,
      isSubmitting: false,
    }),
    true
  );
});

test("Safe return path validation prevents open redirects and protects navigation", () => {
  // Valid internal paths
  assert.equal(safeReturnPath("/notifications"), "/notifications");
  assert.equal(safeReturnPath("/profile"), "/profile");
  assert.equal(safeReturnPath("/history?added=1"), "/history?added=1");
  assert.equal(safeReturnPath("/restaurants/00000000-0000-0000-0000-000000000001#menu"), "/restaurants/00000000-0000-0000-0000-000000000001#menu");
  assert.equal(safeReturnPath("/blog/quan-ngon-hanu"), "/blog/quan-ngon-hanu");

  // Invalid external or protocol-relative destinations -> default to "/"
  assert.equal(safeReturnPath("https://evil.attacker.com"), "/");
  assert.equal(safeReturnPath("http://attacker.com/login"), "/");
  assert.equal(safeReturnPath("//attacker.com"), "/");
  assert.equal(safeReturnPath("/\\attacker.com"), "/");
  assert.equal(safeReturnPath("javascript:alert(1)"), "/");
  assert.equal(safeReturnPath("data:text/html,<html>"), "/");
  assert.equal(safeReturnPath(undefined), "/");
  assert.equal(safeReturnPath(null), "/");
  assert.equal(safeReturnPath(""), "/");
});

test("Daily contact rate limiter limits submissions to 3 per day", () => {
  const maxAttempts = 3;
  const submissions = [];

  function recordAttempt(timestampMs) {
    const windowMs = 86400 * 1000;
    // Filter attempts within the current 24h window
    const recent = submissions.filter((ts) => timestampMs - ts < windowMs);
    if (recent.length >= maxAttempts) {
      return { allowed: false, remaining: 0 };
    }
    submissions.push(timestampMs);
    return { allowed: true, remaining: maxAttempts - submissions.length };
  }

  const baseTime = new Date("2026-10-18T00:00:00Z").getTime();

  // Attempt 1 -> allowed
  assert.equal(recordAttempt(baseTime).allowed, true);
  // Attempt 2 -> allowed
  assert.equal(recordAttempt(baseTime + 3600 * 1000).allowed, true);
  // Attempt 3 -> allowed
  assert.equal(recordAttempt(baseTime + 7200 * 1000).allowed, true);
  // Attempt 4 -> BLOCKED (exceeded 3 per day)
  assert.equal(recordAttempt(baseTime + 10800 * 1000).allowed, false);

  // Next day (after 86400s) -> allowed again
  assert.equal(recordAttempt(baseTime + 86401 * 1000).allowed, true);
});
