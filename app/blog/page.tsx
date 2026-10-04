import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { readableText } from "@/features/restaurants/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("blog_posts").select("id,slug,title,excerpt,cover_image_url,published_at")
    .eq("status", "published").order("published_at", { ascending: false });
  if (error) throw new Error("Không thể tải bài viết.");
  const posts = data ?? [];
  return (
    <div className="space-y-7"><div><p className="eyebrow">Góc ăn uống</p><h1 className="section-title mt-2">Blog HANU Hungry</h1><p className="mt-2 text-sm text-[var(--color-muted)]">Câu chuyện, gợi ý và cập nhật từ nhóm HANU Hungry.</p></div>
      {posts.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <Link key={post.id} href={`/blog/${post.slug}`} className="card group block overflow-hidden"><div className="relative flex aspect-[16/10] items-center justify-center bg-[var(--color-pale)]">{post.cover_image_url ? <Image src={post.cover_image_url} alt="" fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" unoptimized /> : <span className="text-6xl opacity-60" aria-hidden="true">✎</span>}</div><div className="space-y-2 p-5"><h2 className="break-words text-lg font-extrabold group-hover:text-[var(--color-red)]">{post.title}</h2><p className="line-clamp-3 text-sm leading-6 text-[var(--color-muted)]">{readableText(post.excerpt)}</p><span className="text-sm font-bold text-[var(--color-red)]">Đọc tiếp →</span></div></Link>)}</div> : <div className="card p-10 text-center text-sm text-[var(--color-muted)]">Bài viết đang được chuẩn bị. Hãy quay lại sau nhé.</div>}
    </div>
  );
}
