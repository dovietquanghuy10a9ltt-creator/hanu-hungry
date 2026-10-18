"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function sendContactMessage(formData: FormData) {
  if (String(formData.get("website") || "")) return;
  const { user, profile } = await requireUser();

  const rawName = String(formData.get("name") || "").trim();
  const rawEmail = String(formData.get("email") || "").trim().toLowerCase();
  const message = String(formData.get("message") || "").trim();

  const name = rawName || profile.display_name || user.email || "Thành viên";
  const email = rawEmail || user.email || "";

  if (!name || name.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320 || !message || message.length > 5000) {
    throw new Error("Vui lòng kiểm tra tên, email và nội dung liên hệ.");
  }

  // Giới hạn tối đa 3 lượt gửi mỗi ngày (1 ngày = 86400 giây)
  // Không hiển thị lỗi hay giới hạn với người dùng (nếu vượt quá sẽ âm thầm bỏ qua và vẫn báo gửi thành công)
  const rateLimit = await checkRateLimit({
    action: "contact",
    identifier: user.id,
    maxAttempts: 3,
    windowSeconds: 86400,
    blockSeconds: 86400,
  });

  if (!rateLimit.allowed) {
    console.warn(`[contact] User ${user.id} exceeded daily limit (3 submissions/day). Silently dropping submission.`);
    redirect("/contact?sent=1");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({ user_id: user.id, name, email, message });
  if (error) {
    console.error("[contact] Error inserting into contact_messages:", error.message);
    throw new Error("Không thể gửi liên hệ. Vui lòng thử lại.");
  }

  redirect("/contact?sent=1");
}
