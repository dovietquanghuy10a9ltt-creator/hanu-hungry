import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { sanitizeBlogHtml } from "@/features/blog/sanitize";

type Props = { params: Promise<{ slug: string }> };
type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

const getPost = cache(async function getPost(slug: string): Promise<BlogPost | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("blog_posts").select("id,slug,title,excerpt,content,cover_image_url,published_at,seo_title,seo_description")
    .eq("slug", slug).eq("status", "published").maybeSingle();
  if (error) throw new Error("Không thể tải bài viết.");
  return data as BlogPost | null;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  const title = post?.seo_title ? { absolute: post.seo_title } : post?.title || "Bài viết";
  const description = post?.seo_description || post?.excerpt || undefined;
  return {
    title,
    description,
    alternates: post ? { canonical: `https://hanuhungry.id.vn/blog/${post.slug}` } : undefined,
    openGraph: post
      ? {
          title: post.seo_title || post.title,
          description: description,
          url: `https://hanuhungry.id.vn/blog/${post.slug}`,
          images: post.cover_image_url ? [{ url: post.cover_image_url, alt: post.title }] : undefined,
        }
      : undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const paragraphs = post.content.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/blog" className="text-sm font-bold text-[var(--color-red)] hover:underline">
          ← Tất cả bài viết
        </Link>
      </div>
      <header>
        <p className="eyebrow">Blog Hanu Hungry</p>
        <h1 className="mt-2 break-words text-3xl font-black leading-tight sm:text-5xl">
          {post.title}
        </h1>
        {post.published_at && (
          <time className="mt-4 block text-sm text-[var(--color-muted)]" dateTime={post.published_at}>
            {new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(post.published_at))}
          </time>
        )}
        {post.excerpt && <p className="mt-4 text-lg leading-7 text-[var(--color-muted)]">{post.excerpt}</p>}
      </header>
      {post.cover_image_url && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem]">
          <Image src={post.cover_image_url} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" unoptimized />
        </div>
      )}
      <div className="card space-y-5 p-5 text-base leading-8 sm:p-8">
        {paragraphs.map((paragraph, index) =>
          paragraph.startsWith("## ") ? (
            <h2 key={index} className="pt-3 text-xl font-extrabold leading-snug text-[#bd2030]">
              {paragraph.slice(3)}
            </h2>
          ) : (
            <div
              key={index}
              className="whitespace-pre-wrap break-words leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(paragraph) }}
            />
          )
        )}
      </div>
    </article>
  );
}
