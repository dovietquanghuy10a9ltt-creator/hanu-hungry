import Link from "next/link";

export function WomensDayBanner({ signedIn = true }: { signedIn?: boolean }) {
  const suggestions = [
    {
      icon: "🧋",
      title: "Trà sữa & Bánh ngọt",
      subtitle: "Chiều lòng nàng với vị ngọt ngào",
      href: signedIn ? "/restaurants?category=do-uong" : "/login",
      badge: "Yêu thích",
    },
    {
      icon: "🥘",
      title: "Lẩu nướng hội chị em",
      subtitle: "Tụ tập rôm rả, quẩy hết mình",
      href: signedIn ? "/restaurants?q=lẩu" : "/login",
      badge: "Đông vui",
    },
    {
      icon: "🎲",
      title: "Gacha chiều nàng ăn gì",
      subtitle: "Để vũ trụ chọn quán bất ngờ",
      href: signedIn ? "/gacha" : "/login",
      badge: "Vui vẻ",
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl border-2 border-rose-200/90 bg-gradient-to-br from-[#fff3f5] via-[#fffdfa] to-[#fff5eb] p-6 sm:p-8 shadow-sm">
      {/* Decorative background glow & floral icons */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full bg-rose-200/40 blur-2xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-6 -bottom-6 h-36 w-36 rounded-full bg-amber-200/30 blur-2xl" aria-hidden="true" />
      <span className="pointer-events-none absolute right-4 top-4 text-2xl sm:text-3xl opacity-70 animate-pulse" aria-hidden="true">
        🌸
      </span>
      <span className="pointer-events-none absolute right-16 bottom-3 text-xl opacity-50" aria-hidden="true">
        ✨
      </span>

      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-rose-700 border border-rose-200 shadow-2xs">
            <span className="animate-spin-slow inline-block" style={{ animationDuration: "8s" }}>🌸</span>
            SỰ KIỆN 20 THÁNG 10 · HANU HUNGRY
          </span>
          <span className="text-xs font-semibold text-rose-600 hidden sm:inline">
            Tôn vinh một nửa dịu dàng của HANU 💕
          </span>
        </div>

        <div className="mt-3.5 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--color-ink)]">
            Hôm nay chiều nàng · Ăn ngon quanh Hanu 💐
          </h2>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-[var(--color-muted)]">
            Gửi ngàn lời chúc ngọt ngào nhất đến các bạn nữ HANU! Hãy tự thưởng cho mình hoặc rủ người thương và hội bạn ghé những điểm hẹn xinh xắn quanh Triều Khúc - Phùng Khoang dưới đây:
          </p>
        </div>

        {/* Suggestion Cards */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {suggestions.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group relative flex flex-col justify-between rounded-2xl border border-rose-200/80 bg-white/90 p-4 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-rose-400 hover:shadow-md active:translate-y-0"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-xl border border-rose-100 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 border border-rose-100">
                    {item.badge}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-bold text-[var(--color-ink)] group-hover:text-rose-700 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-[var(--color-muted)] line-clamp-2">
                  {item.subtitle}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-1 text-xs font-bold text-rose-600 group-hover:translate-x-0.5 transition-transform">
                <span>Khám phá ngay</span>
                <span aria-hidden="true">↗</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

