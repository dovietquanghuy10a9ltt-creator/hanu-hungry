"use client";

import { useEffect, useState } from "react";

const PETALS = [
  { id: 1, left: "8%", size: "16px", duration: "16s", delay: "0s", char: "🌸" },
  { id: 2, left: "28%", size: "14px", duration: "19s", delay: "4s", char: "🌸" },
  { id: 3, left: "45%", size: "15px", duration: "22s", delay: "9s", char: "✨" },
  { id: 4, left: "62%", size: "16px", duration: "17s", delay: "2s", char: "🌷" },
  { id: 5, left: "78%", size: "15px", duration: "20s", delay: "7s", char: "🌸" },
  { id: 6, left: "92%", size: "14px", duration: "18s", delay: "5s", char: "🌺" },
];

export function PetalsFalling() {
  const [enabled, setEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = sessionStorage.getItem("hanu_petals_enabled");
    if (saved !== null) {
      setEnabled(saved === "true");
    } else {
      setEnabled(true);
    }
  }, []);

  function togglePetals() {
    setEnabled((prev) => {
      const next = !prev;
      sessionStorage.setItem("hanu_petals_enabled", String(next));
      return next;
    });
  }

  if (!mounted) return null;

  return (
    <>
      {enabled && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-20 overflow-hidden select-none"
        >
          {PETALS.map((p) => (
            <span
              key={p.id}
              className="falling-petal"
              style={{
                left: p.left,
                fontSize: p.size,
                animationDuration: p.duration,
                animationDelay: p.delay,
              }}
            >
              {p.char}
            </span>
          ))}
        </div>
      )}

      {/* Floating control button to toggle falling petals */}
      <div className="fixed left-3 bottom-[84px] md:bottom-6 z-50">
        <button
          type="button"
          onClick={togglePetals}
          title={enabled ? "Tắt hiệu ứng hoa rơi" : "Bật hiệu ứng hoa rơi 20/10"}
          aria-label={enabled ? "Tắt hiệu ứng hoa rơi" : "Bật hiệu ứng hoa rơi 20/10"}
          className={`group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 shadow-md border touch-manipulation cursor-pointer select-none ${
            enabled
              ? "bg-[#fff0f3] text-[#b52a34] border-[#fbcfe8] hover:bg-[#ffe4e9]"
              : "bg-[#fffdf8] text-[var(--color-muted)] border-[var(--color-line)] hover:text-[var(--color-ink)]"
          }`}
        >
          <span
            aria-hidden="true"
            className="text-sm select-none"
          >
            🌸
          </span>
          <span className="text-[11px] sm:text-xs">
            {enabled ? "Tắt hoa" : "Bật hoa"}
          </span>
        </button>
      </div>
    </>
  );
}
