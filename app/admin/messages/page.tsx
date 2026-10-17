import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Quản lý Lời nhắn góp ý · Admin",
};

export default async function AdminMessagesPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: messages, error } = await admin
    .from("contact_messages")
    .select("id, user_id, name, email, message, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin-messages] Error fetching messages:", error.message);
  }

  const items = messages || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="eyebrow">Hộp thư góp ý</p>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] mt-1">
            Lời nhắn trực tuyến ({items.length})
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Danh sách tất cả tin nhắn và đóng góp do người dùng gửi qua biểu mẫu liên hệ.
          </p>
        </div>
      </div>

      {/* Helpful tip for Gmail forwarding */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5 text-sm text-amber-900 space-y-1.5 shadow-2xs">
        <p className="font-bold flex items-center gap-1.5 text-base">
          <span>💡</span> Đồng bộ email về hòm thư hanuhungry.mcr@gmail.com
        </p>
        <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
          Mỗi khi người dùng gửi form, tin nhắn sẽ luôn được lưu trữ an toàn tại trang này. Để đồng thời nhận email thông báo trực tiếp về <strong>hanuhungry.mcr@gmail.com</strong>, bạn chỉ cần cấu hình biến môi trường <code>GMAIL_USER</code> và <code>GMAIL_APP_PASSWORD</code> (Mật khẩu ứng dụng Gmail) trong file <code>.env.local</code>.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="card p-12 text-center space-y-3">
          <span className="text-4xl select-none" aria-hidden="true">📭</span>
          <h2 className="text-lg font-bold text-[var(--color-ink)]">Chưa có lời nhắn nào</h2>
          <p className="text-sm text-[var(--color-muted)] max-w-md mx-auto">
            Khi sinh viên hoặc người dùng gửi góp ý qua trang Liên hệ, toàn bộ nội dung sẽ xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((msg) => {
            const dateStr = new Date(msg.created_at).toLocaleString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
              dateStyle: "full",
              timeStyle: "short",
            });
            return (
              <article
                key={msg.id}
                className="card p-5 sm:p-6 space-y-3 transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[var(--color-line)] pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-base text-[var(--color-ink)]">{msg.name}</span>
                    <span className="text-xs text-[var(--color-muted)]">·</span>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-xs sm:text-sm font-semibold text-[var(--color-red)] hover:underline"
                    >
                      ✉️ {msg.email}
                    </a>
                  </div>
                  <time className="text-xs text-[var(--color-muted)] font-medium shrink-0">
                    {dateStr}
                  </time>
                </div>

                <div className="text-sm sm:text-base text-[var(--color-ink)] leading-relaxed whitespace-pre-wrap pt-1 bg-[#fffdf8] p-3 rounded-xl border border-[var(--color-line)]/50">
                  {msg.message}
                </div>

                <div className="flex items-center justify-between pt-1 text-xs text-[var(--color-muted)]">
                  <span>User ID: <code className="font-mono text-[11px] bg-[var(--color-pale)] px-1.5 py-0.5 rounded">{msg.user_id}</code></span>
                  <a
                    href={`mailto:${msg.email}?subject=Phản hồi từ Hanu Hungry&body=Chào ${encodeURIComponent(msg.name)},%0D%0A%0D%0ACảm ơn bạn đã gửi lời nhắn tới nhóm Macaron:`}
                    className="button button-secondary text-xs px-3 py-1.5 min-h-0 font-bold"
                  >
                    Trả lời email ↗
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
