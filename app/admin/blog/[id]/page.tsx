import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/features/admin/validation";
import { BlogForm, BlogStatusForm, DeleteBlogForm } from "@/features/admin/components/AdminForms";
import { AdminCard, AdminHeader } from "@/features/admin/components/AdminPrimitives";

export default async function EditBlogPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  if (!isUuid(id)) notFound();
  const supabase = await createClient();
  const { data: post } = await supabase.from("blog_posts")
    .select("id,slug,title,excerpt,content,cover_image_url,status,seo_title,seo_description")
    .eq("id", id).maybeSingle();
  if (!post) notFound();
  return <>
    <AdminHeader title={`Sửa Blog: ${post.title}`}>
      <Link href="/admin/blog" className="inline-flex min-h-11 items-center text-sm font-semibold text-[#a91d2c]">← Danh sách Blog</Link>
    </AdminHeader>
    {query.created === "1" && <p role="status" className="mb-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">Đã tạo bài Blog.</p>}
    <AdminCard><BlogForm post={post} /></AdminCard>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <AdminCard>
        <h2 className="mb-3 text-lg font-bold">Xuất bản</h2>
        <BlogStatusForm id={post.id} status={post.status} />
      </AdminCard>
      <AdminCard>
        <h2 className="mb-3 text-lg font-bold">Xóa bài</h2>
        <p className="mb-4 text-sm text-[#76645d]">Thao tác này không thể hoàn tác. Thông báo cũ sẽ được xử lý an toàn khi không còn bài liên kết.</p>
        <DeleteBlogForm id={post.id} />
      </AdminCard>
    </div>
  </>;
}
