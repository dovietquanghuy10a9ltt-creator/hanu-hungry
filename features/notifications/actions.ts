"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function markNotificationRead(formData: FormData) {
  const notificationId = String(formData.get("notificationId") || "");
  if (!uuid.test(notificationId)) throw new Error("Thông báo không hợp lệ.");
  const { user } = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("notification_reads").upsert({
    notification_id: notificationId,
    user_id: user.id,
    read_at: new Date().toISOString(),
  }, { onConflict: "notification_id,user_id", ignoreDuplicates: true });
  if (error) throw new Error("Không thể đánh dấu đã đọc.");
  revalidatePath("/notifications");
}

export async function markAllNotificationsRead() {
  const { user } = await requireUser();
  const supabase = await createClient();
  const { data: notifications, error: listError } = await supabase.from("notifications").select("id").eq("audience", "ALL_USERS");
  if (listError) throw new Error("Không thể tải thông báo.");
  if (!notifications?.length) return;
  const readAt = new Date().toISOString();
  const { error } = await supabase.from("notification_reads").upsert(
    notifications.map((notification) => ({ notification_id: notification.id, user_id: user.id, read_at: readAt })),
    { onConflict: "notification_id,user_id", ignoreDuplicates: true },
  );
  if (error) throw new Error("Không thể đánh dấu tất cả đã đọc.");
  revalidatePath("/notifications");
}
