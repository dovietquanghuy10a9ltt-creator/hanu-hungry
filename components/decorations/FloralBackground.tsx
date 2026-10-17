"use client";

export function FloralBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Zero GPU blur overhead: clean radial gradient applied via CSS */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 100% 0%, rgba(254, 205, 211, 0.25) 0%, transparent 40%), radial-gradient(circle at 0% 0%, rgba(254, 243, 199, 0.2) 0%, transparent 35%)",
        }}
      />

      {/* Top Right Subtle Corner Flower Accent */}
      <div className="absolute top-2 right-3 sm:top-4 sm:right-6 opacity-35">
        <div className="flex items-center gap-1 text-2xl sm:text-3xl text-rose-300">
          <span>🌸</span>
          <span className="text-base sm:text-xl opacity-60 -ml-1">✨</span>
        </div>
      </div>

      {/* Top Left Subtle Corner Flower Accent */}
      <div className="absolute top-3 left-3 sm:top-5 sm:left-6 opacity-30">
        <div className="flex items-center gap-1 text-xl sm:text-2xl text-rose-300">
          <span>🌺</span>
        </div>
      </div>
    </div>
  );
}
