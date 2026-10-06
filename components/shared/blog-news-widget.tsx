import Image from "next/image";
import Link from "next/link";
import type { BlogPostSummary } from "@/features/blog/data";

const defaultCovers = [
  "/blog/food-guide.svg",
  "/blog/menu-price.svg",
  "/blog/gacha-food.svg",
];

export function BlogNewsWidget({
  posts,
  title = "TIN TỨC",
  showHeaderLink = true,
  className = "",
}: {
  posts: BlogPostSummary[];
  title?: string;
  showHeaderLink?: boolean;
  className?: string;
}) {
  if (!posts.length) return null;

  return (
    <aside className={`rounded-2xl border border-[var(--color-line)] bg-[#fffdf8] p-5 sm:p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-3.5">
        <h2 className="text-xl font-black uppercase tracking-tight text-[var(--color-ink)] sm:text-2xl">
          {title}
        </h2>
        {showHeaderLink && (
          <Link href="/blog" className="text-xs font-bold text-[var(--color-red)] hover:underline sm:text-sm">
            Tất cả bài viết →
          </Link>
        )}
      </div>

      <div className="divide-y divide-[var(--color-line)]/70">
        {posts.map((post, idx) => {
          const coverUrl = post.cover_image_url || defaultCovers[idx % defaultCovers.length];
          return (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex items-center gap-3.5 py-3.5 transition-colors sm:gap-4 sm:py-4"
            >
              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-pale)] sm:h-18 sm:w-24">
                <Image
                  src={coverUrl}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="96px"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-red)] sm:text-[15px]">
                  {post.title}
                </h3>
                {post.published_at && (
                  <time className="mt-1 block text-xs text-[var(--color-muted)]" dateTime={post.published_at}>
                    {new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(
                      new Date(post.published_at)
                    )}
                  </time>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
