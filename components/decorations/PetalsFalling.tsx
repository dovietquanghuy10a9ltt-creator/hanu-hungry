"use client";

import { useEffect, useState } from "react";

const PETALS = [
  { id: 1, left: "10%", size: "16px", duration: "16s", delay: "0s", char: "🌸" },
  { id: 2, left: "30%", size: "14px", duration: "19s", delay: "4s", char: "🌸" },
  { id: 3, left: "55%", size: "16px", duration: "17s", delay: "2s", char: "🌷" },
  { id: 4, left: "75%", size: "15px", duration: "20s", delay: "7s", char: "🌸" },
  { id: 5, left: "90%", size: "14px", duration: "18s", delay: "5s", char: "🌺" },
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
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setEnabled(!prefersReduced);
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
      <div className="fixed left-3.5 bottom-20 md:bottom-6 z-40">
        <button
          type="button"
          onClick={togglePetals}
          title={enabled ? "Tắt hiệu ứng hoa rơi" : "Bật hiệu ứng hoa rơi 20/10"}
          aria-label={enabled ? "Tắt hiệu ứng hoa rơi" : "Bật hiệu ứng hoa rơi 20/10"}
          className={`group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 shadow-sm border ${
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
          <span className="hidden sm:inline">
            {enabled ? "Hoa rơi: Bật" : "Hoa rơi: Tắt"}
          </span>
        </button>
      </div>
    </>
  );
}
