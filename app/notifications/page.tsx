import Link from "next/link";
import type { Metadata } from "next";
import { markAllNotificationsRead, markNotificationRead } from "@/features/notifications/actions";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Thông báo" };

export default async function NotificationsPage() {
  const { user } = await requireUser();
  const supabase = await createClient();
  const [{ data: notifications, error: listError }, { data: reads, error: readError }] = await Promise.all([
    supabase.from("notifications").select("id,type,title,message,link,blog_post_id,created_at").eq("audience", "ALL_USERS").order("created_at", { ascending: false }),
    supabase.from("notification_reads").select("notification_id").eq("user_id", user.id),
  ]);
  if (listError || readError) throw new Error("Không thể tải thông báo.");
  const items = notifications ?? [];
  const readIds = new Set((reads ?? []).map((read) => read.notification_id));
  const blogIds = items.map((item) => item.blog_post_id).filter((id): id is string => Boolean(id));
  const { data: blogs } = blogIds.length
    ? await supabase.from("blog_posts").select("id").in("id", blogIds).eq("status", "published")
    : { data: [] as { id: string }[] };
  const availableBlogs = new Set((blogs ?? []).map((blog) => blog.id));
  const unreadCount = items.filter((item) => !readIds.has(item.id)).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Cập nhật từ HANU Hungry</p><h1 className="section-title mt-2">Thông báo</h1><p className="mt-2 text-sm text-[var(--color-muted)]">{unreadCount} thông báo chưa đọc</p></div>{unreadCount > 0 && <form action={markAllNotificationsRead}><button type="submit" className="button button-secondary text-sm">Đánh dấu tất cả đã đọc</button></form>}</div>
      {items.length ? <div className="space-y-3">{items.map((item) => {
        const available = item.type === "BLOG_PUBLISHED"
          ? Boolean(item.blog_post_id && availableBlogs.has(item.blog_post_id))
          : Boolean(item.link);
        const unread = !readIds.has(item.id);
        return <article key={item.id} className={`card p-5 ${unread ? "border-[var(--color-coral)]" : ""}`}><div className="flex flex-wrap items-start justify-between gap-2"><h2 className="break-words font-extrabold">{item.title}</h2>{unread && <span className="rounded-full bg-[var(--color-pale)] px-2.5 py-1 text-xs font-bold text-[var(--color-red)]">Mới</span>}</div><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--color-muted)]">{item.message}</p><time className="mt-2 block text-xs text-[var(--color-muted)]" dateTime={item.created_at}>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(item.created_at))}</time><div className="mt-3 flex flex-wrap items-center gap-3">{available && item.link ? <Link href={item.link} className="button button-secondary text-sm">Đọc bài viết</Link> : item.type === "BLOG_PUBLISHED" ? <span className="text-xs text-[var(--color-muted)]">Bài viết hiện không khả dụng.</span> : null}{unread && <form action={markNotificationRead}><input type="hidden" name="notificationId" value={item.id} /><button type="submit" className="min-h-11 text-sm font-bold text-[var(--color-red)]">Đánh dấu đã đọc</button></form>}</div></article>;
      })}</div> : <div className="card p-10 text-center text-sm text-[var(--color-muted)]">Chưa có thông báo mới. Hãy quay lại sau nhé.</div>}
    </div>
  );
}
