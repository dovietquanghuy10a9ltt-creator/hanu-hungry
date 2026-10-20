import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://hanuhungry.id.vn";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/restaurants`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gacha`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return staticRoutes;
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const [restaurantsRes, blogsRes] = await Promise.all([
      supabase
        .from("restaurants")
        .select("id, updated_at")
        .eq("is_active", true),
      supabase
        .from("blog_posts")
        .select("slug, updated_at")
        .eq("status", "published"),
    ]);

    const restaurantRoutes: MetadataRoute.Sitemap = (restaurantsRes.data ?? []).map((restaurant) => ({
      url: `${baseUrl}/restaurants/${restaurant.id}`,
      lastModified: restaurant.updated_at ? new Date(restaurant.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const blogRoutes: MetadataRoute.Sitemap = (blogsRes.data ?? []).map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...restaurantRoutes, ...blogRoutes];
  } catch (error) {
    console.error("[sitemap] Failed to generate dynamic sitemap entries:", error);
    return staticRoutes;
  }
}
