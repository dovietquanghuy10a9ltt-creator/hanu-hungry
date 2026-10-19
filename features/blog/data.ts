import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type BlogPostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
};

export type BlogPostDetail = {
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

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function listRecentBlogPosts(limit = 5): Promise<BlogPostSummary[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id,slug,title,excerpt,cover_image_url,published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data ?? []) as BlogPostSummary[];
  } catch {
    return [];
  }
}

export async function listPublishedBlogPosts(): Promise<BlogPostSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,slug,title,excerpt,cover_image_url,published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[blog] listPublishedBlogPosts error:", error.message);
    throw new Error("Không thể tải bài viết.");
  }
  return (data ?? []) as BlogPostSummary[];
}

export const getBlogPostBySlug = cache(async function getBlogPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  if (!SLUG_PATTERN.test(slug)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,slug,title,excerpt,content,cover_image_url,published_at,seo_title,seo_description")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("[blog] getBlogPostBySlug error:", error.message);
    throw new Error("Không thể tải bài viết.");
  }
  return data as BlogPostDetail | null;
});
