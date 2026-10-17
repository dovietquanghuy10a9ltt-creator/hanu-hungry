"use client";

export function FloralBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Top Right Floral Ornament & Ambient Rose Glow */}
      <div className="absolute -top-16 -right-16 h-80 w-80 rounded-full bg-gradient-to-br from-rose-200/35 via-pink-100/20 to-transparent blur-3xl" />
      <div className="absolute top-2 right-3 sm:top-4 sm:right-6 opacity-35 sm:opacity-50 transition-opacity">
        <div className="animate-petal-float flex items-center gap-1 text-2xl sm:text-4xl text-rose-300">
          <span>🌸</span>
          <span className="text-lg sm:text-2xl opacity-70 -ml-2 -mt-2">✨</span>
          <span className="text-xl sm:text-3xl opacity-60 -ml-1">🌷</span>
        </div>
      </div>

      {/* Top Left Ambient Warm Peach-Rose Glow */}
      <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-gradient-to-tr from-amber-200/25 via-rose-100/20 to-transparent blur-3xl" />
      <div className="absolute top-3 left-3 sm:top-5 sm:left-6 opacity-30 sm:opacity-45">
        <div
          className="animate-petal-float flex items-center gap-1 text-xl sm:text-3xl text-rose-300"
          style={{ animationDelay: "1.5s" }}
        >
          <span>🌺</span>
          <span className="text-sm sm:text-xl opacity-60 -ml-1">✨</span>
        </div>
      </div>

      {/* Bottom Subtle Corner Blooms (above bottom nav) */}
      <div className="absolute bottom-24 right-4 sm:bottom-12 sm:right-10 opacity-25 sm:opacity-35">
        <div
          className="animate-petal-float text-xl sm:text-2xl"
          style={{ animationDelay: "2.2s" }}
        >
          🌸
        </div>
      </div>
      <div className="absolute bottom-28 left-4 sm:bottom-14 sm:left-10 opacity-20 sm:opacity-30">
        <div
          className="animate-petal-float text-lg sm:text-xl"
          style={{ animationDelay: "0.8s" }}
        >
          💐
        </div>
      </div>
    </div>
  );
}
