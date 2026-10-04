/** Remote RLS smoke test. Creates one temporary USER and deletes it in finally. */
import { randomBytes, randomInt } from "node:crypto";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  check(process.argv.slice(2).length === 1 && process.argv[2] === "--remote", "Pass --remote to run temporary-user RLS tests.");
  if (existsSync(resolve(".env.local"))) process.loadEnvFile(resolve(".env.local"));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminPassword = process.env.BOOTSTRAP_ADMIN_1_PASSWORD;
  check(url && anonKey && serviceKey && adminPassword, "Runtime Supabase URL, publishable/service keys and admin password are required.");

  const owner = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: adminRows, error: adminRowsError } = await owner.from("profiles")
    .select("student_code,display_name").eq("role", "ADMIN");
  check(!adminRowsError && adminRows?.length === 2
    && adminRows.some((row) => row.student_code === "2404060021" && row.display_name === "linhphamhn342")
    && adminRows.some((row) => row.student_code === "2404060034" && row.display_name === "mtvzzn"),
  "Expected exactly the two configured ADMIN profiles.");
  const admin = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: adminLogin, error: adminLoginError } = await admin.auth.signInWithPassword({
    email: "linhphamhn342@gmail.com", password: adminPassword,
  });
  check(!adminLoginError && adminLogin.user, "Admin login failed; check bootstrap credentials.");
  const { data: adminProfile, error: adminProfileError } = await admin.from("profiles").select("id,role").eq("id", adminLogin.user.id).single();
  check(!adminProfileError && adminProfile?.role === "ADMIN", "Bootstrap admin profile is not ADMIN.");
  console.log("ADMIN session: role verified");

  const { data: restaurant, error: restaurantError } = await admin.from("restaurants").select("id").eq("is_active", true).limit(1).single();
  check(!restaurantError && restaurant, "An active restaurant is needed for RLS tests.");

  const suffix = `${Date.now()}${randomInt(1000, 9999)}`;
  const email = `hanu-rls-qa-${suffix}@example.com`;
  const studentCode = `99${randomInt(0, 100_000_000).toString().padStart(8, "0")}`;
  const password = randomBytes(24).toString("base64url");
  let temporaryUserId: string | null = null;

  try {
    const { data: created, error: createError } = await owner.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { student_code: studentCode, role: "ADMIN" },
    });
    check(!createError && created.user, "Could not create temporary USER for RLS tests.");
    temporaryUserId = created.user.id;
    const user = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error: loginError } = await user.auth.signInWithPassword({ email, password });
    check(!loginError, "Temporary USER login failed.");

    const { data: ownProfile, error: ownError } = await user.from("profiles").select("id,role,student_code,display_name").single();
    check(!ownError && ownProfile?.id === temporaryUserId && ownProfile.role === "USER" && ownProfile.student_code === studentCode && ownProfile.display_name === email.split("@")[0], "Signup profile defaults failed.");
    const { data: otherProfile } = await user.from("profiles").select("id").eq("id", adminLogin.user.id).maybeSingle();
    check(otherProfile === null, "USER can read another profile.");
    const { error: roleError } = await user.from("profiles").update({ role: "ADMIN" }).eq("id", temporaryUserId);
    check(roleError, "USER can update own role.");
    const { error: codeError } = await user.from("profiles").update({ student_code: "9999999999" }).eq("id", temporaryUserId);
    check(codeError, "USER can update own MSSV.");
    const { error: restaurantWriteError } = await user.from("restaurants").insert({ name: "RLS test denied" });
    check(restaurantWriteError, "USER can create a restaurant.");
    const { error: categoryWriteError } = await user.from("categories").insert({ name: "RLS test denied", slug: `rls-denied-${suffix}` });
    check(categoryWriteError, "USER can create a category.");
    const { error: dishWriteError } = await user.from("dishes").insert({ restaurant_id: restaurant.id, name: "RLS test denied" });
    check(dishWriteError, "USER can create a dish.");
    const { error: blogWriteError } = await user.from("blog_posts").insert({ slug: `rls-denied-${suffix}`, title: "Denied", content: "Denied", author_admin_id: temporaryUserId });
    check(blogWriteError, "USER can publish Blog content.");
    const { error: analyticsError } = await user.rpc("admin_analytics");
    check(analyticsError?.code === "42501", "USER can read admin analytics.");
    console.log("USER session: default role, identity protection and admin denial verified");

    const { data: visit, error: visitError } = await user.from("check_ins")
      .insert({ user_id: temporaryUserId, restaurant_id: restaurant.id }).select("id").single();
    check(!visitError && visit, "USER could not create own check-in.");
    const { data: adminViewVisit, error: adminVisitError } = await admin.from("check_ins").select("id").eq("id", visit.id);
    check(!adminVisitError && adminViewVisit?.length === 0, "ADMIN can read another user's check-in.");

    const { data: review, error: reviewError } = await user.from("reviews")
      .insert({ user_id: temporaryUserId, restaurant_id: restaurant.id, rating: 5, comment: "RLS verification only" })
      .select("id").single();
    check(!reviewError && review, "USER could not create own review.");
    const { data: adminEditedReview, error: adminReviewError } = await admin.from("reviews")
      .update({ comment: "Unauthorized admin edit" }).eq("id", review.id).select("id");
    check(!adminReviewError && adminEditedReview?.length === 0, "ADMIN can edit USER review.");
    const { data: adminViewProfile, error: adminReadError } = await admin.from("profiles").select("id").eq("id", temporaryUserId);
    check(!adminReadError && adminViewProfile?.length === 0, "ADMIN can read another user's profile.");
    const { error: adminRoleError } = await admin.from("profiles").update({ role: "ADMIN" }).eq("id", temporaryUserId);
    check(adminRoleError, "ADMIN can change another user's role.");
    const { data: notices, error: noticeError } = await user.from("notifications").select("id").eq("audience", "ALL_USERS");
    check(!noticeError && notices && notices.length >= 3, "USER cannot see global Blog notifications.");
    const { error: markError } = await user.from("notification_reads").upsert({
      notification_id: notices[0].id, user_id: temporaryUserId,
    }, { onConflict: "notification_id,user_id", ignoreDuplicates: true });
    check(!markError, `USER cannot mark own notification as read (${markError?.code ?? "unknown"}).`);
    const { data: adminReadState, error: adminReadStateError } = await admin.from("notification_reads").select("notification_id").eq("user_id", temporaryUserId);
    check(!adminReadStateError && adminReadState?.length === 0, "ADMIN can read another user's notification state.");
    const { data: analytics, error: adminAnalyticsError } = await admin.rpc("admin_analytics");
    check(!adminAnalyticsError && analytics && typeof analytics === "object", "ADMIN analytics unavailable.");
    console.log("Ownership: check-in, review and notification boundaries; ADMIN aggregate access verified");
  } finally {
    if (temporaryUserId) {
      const { error } = await owner.auth.admin.deleteUser(temporaryUserId);
      check(!error, "Temporary USER cleanup failed. Inspect Auth users for hanu-rls-qa account.");
      console.log("Temporary USER removed");
    }
    await admin.auth.signOut();
  }
}

main().catch((error: unknown) => {
  // Keep provider error details and all credentials out of logs.
  console.error(error instanceof Error ? error.message : "Remote RLS verification failed.");
  process.exitCode = 1;
});
