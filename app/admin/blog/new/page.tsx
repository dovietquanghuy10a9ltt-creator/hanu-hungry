import Link from "next/link";
import { BlogForm } from "@/features/admin/components/AdminForms";
import { AdminCard, AdminHeader } from "@/features/admin/components/AdminPrimitives";

export default function NewBlogPage() {
  return <>
    <AdminHeader title="Viết bài Blog" description="Nội dung được lưu vào database; người dùng chỉ đọc bài đã đăng.">
      <Link href="/admin/blog" className="inline-flex min-h-11 items-center text-sm font-semibold text-[#a91d2c]">← Danh sách Blog</Link>
    </AdminHeader>
    <AdminCard><BlogForm /></AdminCard>
  </>;
}
