import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminCard, AdminError, AdminHeader, AdminPager } from "@/features/admin/components/AdminPrimitives";

const PAGE_SIZE = 24;

export default async function AdminBlogPage({ searchParams }: {
  searchParams: Promise<{ page?: string; deleted?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Math.min(1000, Number.parseInt(params.page ?? "1", 10) || 1));
  const supabase = await createClient();
  const { data, count, error } = await supabase.from("blog_posts")
    .select("id,slug,title,excerpt,status,published_at,updated_at", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  return <>
    <AdminHeader title="Quản lý Blog" description="Chỉ ADMIN có thể tạo và đăng Blog. Đăng một bài mới sẽ tạo thông báo trong ứng dụng.">
      <Link href="/admin/blog/new" className="inline-flex min-h-11 items-center rounded-xl bg-[#bd2030] px-4 text-sm font-bold text-white">+ Viết bài</Link>
    </AdminHeader>
    {params.deleted === "1" && <p role="status" className="mb-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">Đã xóa bài Blog.</p>}
    {error && <AdminError>Chưa tải được Blog. Kiểm tra kết nối database.</AdminError>}
    {!error && (!data || data.length === 0) && <AdminCard><p className="text-sm text-[#76645d]">Chưa có bài Blog.</p></AdminCard>}
    <div className="space-y-3">
      {(data ?? []).map((post) => <Link key={post.id} href={`/admin/blog/${post.id}`} className="block rounded-2xl border border-[#eddfd8] bg-white p-5 transition hover:border-[#bd2030] hover:shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="text-lg font-bold">{post.title}</h2>
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${post.status === "published" ? "bg-green-50 text-green-800" : "bg-stone-100 text-stone-600"}`}>
            {post.status === "published" ? "Đã đăng" : "Bản nháp"}
          </span>
        </div>
        <p className="mt-1 break-all font-mono text-xs text-[#9a8a83]">/{post.slug}</p>
        {post.excerpt && <p className="mt-3 line-clamp-2 text-sm text-[#76645d]">{post.excerpt}</p>}
      </Link>)}
    </div>
    {!error && <AdminPager base="/admin/blog" page={page} hasNext={(count ?? 0) > page * PAGE_SIZE} />}
  </>;
}
