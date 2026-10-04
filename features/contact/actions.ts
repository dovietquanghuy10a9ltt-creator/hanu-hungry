"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function sendContactMessage(formData: FormData) {
  if (String(formData.get("website") || "")) return;
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const message = String(formData.get("message") || "").trim();
  if (!name || name.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320 || !message || message.length > 5000) {
    throw new Error("Vui lòng kiểm tra tên, email và nội dung liên hệ.");
  }
  const { user } = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({ user_id: user.id, name, email, message });
  if (error) throw new Error("Không thể gửi liên hệ. Vui lòng thử lại.");
  redirect("/contact?sent=1");
}
