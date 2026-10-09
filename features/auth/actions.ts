"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, clearRateLimit } from "@/lib/security/rate-limit";
import {
  isValidEmail,
  isValidStudentCode,
  normalizeEmail,
  safeReturnPath,
  siteUrl,
  validatePassword,
} from "@/lib/auth/validation";

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

function field(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}

function error(message: string): AuthActionState {
  return { status: "error", message };
}

export async function registerAction(
  _state: AuthActionState,
  form: FormData,
): Promise<AuthActionState> {
  const studentCode = field(form, "student_code").trim();
  const email = normalizeEmail(field(form, "email"));
  const password = field(form, "password");
  if (!isValidStudentCode(studentCode)) return error("MSSV phải gồm đúng 10 chữ số.");
  if (!isValidEmail(email)) return error("Email không hợp lệ.");
  const passwordError = validatePassword(password);
  if (passwordError) return error(passwordError);
  if (password !== field(form, "confirm_password")) {
    return error("Hai mật khẩu không khớp.");
  }

  const rateLimit = await checkRateLimit({
    action: "register",
    maxAttempts: 5,
    windowSeconds: 60,
    blockSeconds: 180,
  });
  if (!rateLimit.allowed) {
    return error(rateLimit.message);
  }

  let shouldRedirect = false;

  try {
    const admin = createAdminClient();

    // 1. Kiểm tra trước xem MSSV đã được đăng ký chưa
    const { data: existingStudent, error: checkError } = await admin
      .from("profiles")
      .select("id")
      .eq("student_code", studentCode)
      .maybeSingle();

    if (checkError) {
      console.error("[auth] registerAction check student error:", checkError.message);
      return error("Hệ thống tạm thời bận. Vui lòng thử lại sau ít phút.");
    }

    if (existingStudent) {
      return error("Mã sinh viên (MSSV) này đã được đăng ký tài khoản. Vui lòng đăng nhập hoặc dùng MSSV khác.");
    }

    // 2. Tạo tài khoản người dùng trực tiếp qua admin client với email_confirm: true
    // Giúp sinh viên đăng ký xong dùng được ngay, không phụ thuộc vào dịch vụ gửi mail SMTP
    const { data: createdUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { student_code: studentCode },
    });

    if (createError) {
      console.error("[auth] registerAction createUser error:", createError.message);
      const lower = createError.message.toLowerCase();
      if (lower.includes("already registered") || lower.includes("unique") || lower.includes("exists")) {
        return error("Email này đã được sử dụng để đăng ký. Vui lòng đăng nhập bằng MSSV của bạn.");
      }
      return error("Không thể tạo tài khoản. Vui lòng kiểm tra lại thông tin rồi thử lại.");
    }

    if (!createdUser?.user) {
      return error("Không thể tạo tài khoản lúc này. Vui lòng thử lại sau.");
    }

    // 3. Tự động đăng nhập cho sinh viên sau khi tạo thành công
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!signInError) {
      shouldRedirect = true;
    } else {
      console.warn("[auth] registerAction auto-login skipped:", signInError.message);
      return {
        status: "success",
        message: "Tạo tài khoản thành công! Bạn có thể bấm Đăng nhập bằng MSSV vừa tạo.",
      };
    }
  } catch (err: unknown) {
    console.error("[auth] registerAction unexpected error:", err instanceof Error ? err.message : err);
    return error("Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại sau.");
  }

  if (shouldRedirect) {
    redirect("/");
  }

  return {
    status: "success",
    message: "Đăng ký tài khoản thành công!",
  };
}

export async function loginAction(
  _state: AuthActionState,
  form: FormData,
): Promise<AuthActionState> {
  const studentCode = field(form, "student_code").trim();
  const password = field(form, "password");
  if (!isValidStudentCode(studentCode) || !password || password.length > 72) return error("Vui lòng nhập MSSV 10 chữ số và mật khẩu hợp lệ.");

  const rateLimit = await checkRateLimit({
    action: "login",
    maxAttempts: 5,
    windowSeconds: 60,
    blockSeconds: 120,
  });
  if (!rateLimit.allowed) {
    return error(rateLimit.message);
  }

  let email: string | undefined;
  try {
    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin.from("profiles").select("id").eq("student_code", studentCode).maybeSingle();
    if (profileError) throw profileError;
    if (profile) {
      const { data, error: userError } = await admin.auth.admin.getUserById(profile.id);
      if (userError) throw userError;
      email = data.user.email;
    }
  } catch (err) {
    console.error("[auth] loginAction error:", err instanceof Error ? err.message : "Unknown error");
    return error("Hiện chưa thể đăng nhập. Vui lòng thử lại sau.");
  }
  // Email stays on the server. Unknown student codes and wrong passwords share one response.
  if (!email) return error("MSSV hoặc mật khẩu không đúng.");
  const remember = form.get("remember") === "on";
  const supabase = await createClient({ rememberSession: remember });
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) return error("MSSV hoặc mật khẩu không đúng.");
  await clearRateLimit("login");
  (await cookies()).set("hanu_remember", remember ? "1" : "0", {
    secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/",
    ...(remember ? { maxAge: 60 * 60 * 24 * 365 } : {}),
  });
  redirect(safeReturnPath(field(form, "next")));
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  (await cookies()).delete("hanu_remember");
  redirect("/login");
}

export async function forgotPasswordAction(
  _state: AuthActionState,
  form: FormData,
): Promise<AuthActionState> {
  const email = normalizeEmail(field(form, "email"));
  const studentCode = field(form, "student_code").trim();
  if (!isValidEmail(email)) return error("Email không hợp lệ.");
  if (!isValidStudentCode(studentCode)) return error("MSSV phải gồm đúng 10 chữ số.");

  const rateLimit = await checkRateLimit({
    action: "forgot-password",
    identifier: `${email}:${studentCode}`,
    maxAttempts: 3,
    windowSeconds: 300,
    blockSeconds: 300,
  });
  if (!rateLimit.allowed) {
    return error(rateLimit.message);
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error("[auth] forgotPasswordAction error:", err instanceof Error ? err.message : "Unknown error");
    return error("Hiện chưa thể xử lý yêu cầu. Vui lòng thử lại sau.");
  }
  try {
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id")
      .eq("student_code", studentCode)
      .maybeSingle();
    if (profileError) throw profileError;
    if (profile) {
      const { data, error: userError } = await admin.auth.admin.getUserById(profile.id);
      if (userError) throw userError;
      if (normalizeEmail(data.user.email ?? "") === email) {
        const supabase = await createClient();
        const callback = new URL("/auth/callback?next=%2Freset-password", siteUrl());
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: callback.toString(),
        });
        if (resetError) throw resetError;
      }
    }
  } catch {
    // A provider rate limit can occur only for a matching account. Keep the same
    // response for matches, mismatches and provider errors to prevent enumeration.
  }
  return {
    status: "success",
    message: "Nếu email và MSSV khớp, liên kết đặt lại mật khẩu sẽ được gửi đến email đó.",
  };
}

export async function resetPasswordAction(
  _state: AuthActionState,
  form: FormData,
): Promise<AuthActionState> {
  const password = field(form, "password");
  const passwordError = validatePassword(password);
  if (passwordError) return error(passwordError);
  if (password !== field(form, "confirm_password")) {
    return error("Hai mật khẩu không khớp.");
  }
  const cookieStore = await cookies();
  if (cookieStore.get("hanu_recovery")?.value !== "1") {
    return error("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return error("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) return error("Không thể đổi mật khẩu. Vui lòng yêu cầu liên kết mới.");
  cookieStore.delete("hanu_recovery");
  await supabase.auth.signOut();
  redirect("/login?reset=done");
}

export async function changePasswordAction(
  _state: AuthActionState,
  form: FormData,
): Promise<AuthActionState> {
  const currentPassword = field(form, "current_password");
  const newPassword = field(form, "password");
  if (!currentPassword) return error("Vui lòng nhập mật khẩu hiện tại.");
  if (currentPassword === newPassword) return error("Mật khẩu mới cần khác mật khẩu hiện tại.");
  const passwordError = validatePassword(newPassword);
  if (passwordError) return error(passwordError);
  if (newPassword !== field(form, "confirm_password")) {
    return error("Hai mật khẩu mới không khớp.");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) return error("Mật khẩu hiện tại không đúng.");
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) return error("Không thể đổi mật khẩu. Vui lòng thử lại.");
  return { status: "success", message: "Đã đổi mật khẩu thành công." };
}
