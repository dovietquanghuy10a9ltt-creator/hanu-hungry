import { createClient } from "@/lib/supabase/server";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  blog_post_id: string | null;
  created_at: string;
};

export async function getUserNotifications(userId: string) {
  const supabase = await createClient();
  const [{ data: notifications, error: listError }, { data: reads, error: readError }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id,type,title,message,link,blog_post_id,created_at")
      .eq("audience", "ALL_USERS")
      .order("created_at", { ascending: false }),
    supabase
      .from("notification_reads")
      .select("notification_id")
      .eq("user_id", userId),
  ]);

  if (listError || readError) {
    console.error("[notifications] Error fetching notifications:", listError || readError);
    throw new Error("Không thể tải thông báo.");
  }

  const items = (notifications ?? []) as NotificationItem[];
  const readIds = new Set((reads ?? []).map((read) => read.notification_id));
  const blogIds = items.map((item) => item.blog_post_id).filter((id): id is string => Boolean(id));

  const { data: blogs } = blogIds.length
    ? await supabase.from("blog_posts").select("id").in("id", blogIds).eq("status", "published")
    : { data: [] as { id: string }[] };

  const availableBlogs = new Set((blogs ?? []).map((blog) => blog.id));
  const unreadCount = items.filter((item) => !readIds.has(item.id)).length;

  return { items, readIds, availableBlogs, unreadCount };
}
