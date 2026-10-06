import { createClient } from "@/lib/supabase/server";

export type BlogPostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
};

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
