import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { markAllNotificationsRead, markNotificationRead } from "@/features/notifications/actions";
import { getUserNotifications } from "@/features/notifications/data";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Thông báo" };

export default async function NotificationsPage() {
  const { user } = await requireUser();
  const { items, readIds, availableBlogs, unreadCount } = await getUserNotifications(user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Cập nhật từ Hanu Hungry</p>
          <div className="flex items-center gap-2.5 mt-2">
            <Image
              src="/icons/shared/bell.png"
              alt=""
              width={32}
              height={32}
              unoptimized
              className="h-8 w-8 object-contain shrink-0"
            />
            <h1 className="section-title">Thông báo</h1>
          </div>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{unreadCount} thông báo chưa đọc</p>
        </div>
        {unreadCount > 0 && (
          <form action={markAllNotificationsRead}>
            <button type="submit" className="button button-secondary text-sm">
              Đánh dấu tất cả đã đọc
            </button>
          </form>
        )}
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => {
            const available =
              item.type === "BLOG_PUBLISHED"
                ? Boolean(item.blog_post_id && availableBlogs.has(item.blog_post_id))
                : Boolean(item.link);
            const unread = !readIds.has(item.id);

            return (
              <article
                key={item.id}
                className={`card p-5 ${unread ? "border-[var(--color-coral)]" : ""}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="break-words font-extrabold">{item.title}</h2>
                  {unread && (
                    <span className="rounded-full bg-[var(--color-pale)] px-2.5 py-1 text-xs font-bold text-[var(--color-red)]">
                      Mới
                    </span>
                  )}
                </div>

                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--color-muted)]">
                  {item.message}
                </p>

                <time
                  className="mt-2 flex items-center gap-1.5 text-xs text-[var(--color-muted)]"
                  dateTime={item.created_at}
                >
                  <Image
                    src="/icons/shared/clock.png"
                    alt=""
                    width={14}
                    height={14}
                    unoptimized
                    className="h-3.5 w-3.5 object-contain inline shrink-0"
                  />
                  <span>
                    {new Intl.DateTimeFormat("vi-VN", {
                      dateStyle: "medium",
                      timeZone: "Asia/Ho_Chi_Minh",
                    }).format(new Date(item.created_at))}
                  </span>
                </time>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {available && item.link ? (
                    <Link href={item.link} className="button button-secondary text-sm">
                      Đọc bài viết
                    </Link>
                  ) : item.type === "BLOG_PUBLISHED" ? (
                    <span className="text-xs text-[var(--color-muted)]">
                      Bài viết hiện không khả dụng.
                    </span>
                  ) : null}

                  {unread && (
                    <form action={markNotificationRead}>
                      <input type="hidden" name="notificationId" value={item.id} />
                      <button
                        type="submit"
                        className="min-h-11 text-sm font-bold text-[var(--color-red)]"
                      >
                        Đánh dấu đã đọc
                      </button>
                    </form>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="card p-10 text-center text-sm text-[var(--color-muted)] flex flex-col items-center justify-center space-y-3">
          <Image
            src="/icons/shared/bell.png"
            alt=""
            width={48}
            height={48}
            unoptimized
            className="h-12 w-12 object-contain opacity-50 grayscale"
          />
          <p>Chưa có thông báo mới. Hãy quay lại sau nhé.</p>
        </div>
      )}
    </div>
  );
}

