"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function updateDisplayName(formData: FormData) {
  const displayName = String(formData.get("displayName") || "").trim();
  if (!displayName || displayName.length > 100) throw new Error("Tên hiển thị cần từ 1 đến 100 ký tự.");
  const { user } = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id);
  if (error) throw new Error("Không thể lưu tên hiển thị. Vui lòng thử lại.");
  revalidatePath("/profile");
  redirect("/profile?updated=1");
}
