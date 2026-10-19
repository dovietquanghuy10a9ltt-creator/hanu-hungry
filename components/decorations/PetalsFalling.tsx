"use client";

// Tạm thời comment lại hiệu ứng hoa rơi theo yêu cầu của user
export function PetalsFalling() {
  return null;
}

/*
// CODE DỰ PHÒNG KHI CẦN MỞ LẠI HIỆU ỨNG HOA RƠI:
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PETALS = [
  { id: 1, left: "8%", size: "16px", duration: "16s", delay: "0s", char: "🌸" },
  { id: 2, left: "28%", size: "14px", duration: "19s", delay: "4s", char: "🌸" },
  { id: 3, left: "45%", size: "15px", duration: "22s", delay: "9s", char: "✨" },
  { id: 4, left: "62%", size: "16px", duration: "17s", delay: "2s", char: "🌷" },
  { id: 5, left: "78%", size: "15px", duration: "20s", delay: "7s", char: "🌸" },
  { id: 6, left: "92%", size: "14px", duration: "18s", delay: "5s", char: "🌺" },
];

export function PetalsFallingActive() {
  const [enabled, setEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = sessionStorage.getItem("hanu_petals_enabled");
      if (saved !== null) {
        setEnabled(saved === "true");
      } else {
        setEnabled(true);
      }
    } catch {
      setEnabled(true);
    }
  }, []);

  function togglePetals() {
    setEnabled((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem("hanu_petals_enabled", String(next));
      } catch {
        // Safe fallback
      }
      return next;
    });
  }

  if (!mounted) return null;

  return (
    <>
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
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
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed left-3 bottom-[calc(78px+env(safe-area-inset-bottom,0px))] md:bottom-6 z-[60] select-none touch-manipulation">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          type="button"
          onClick={togglePetals}
          title={enabled ? "Tắt hiệu ứng hoa rơi" : "Bật hiệu ứng hoa rơi 20/10"}
          aria-label={enabled ? "Tắt hiệu ứng hoa rơi" : "Bật hiệu ứng hoa rơi 20/10"}
          className={`group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors duration-200 shadow-md border touch-manipulation cursor-pointer select-none ${
            enabled
              ? "bg-[#fff0f3] text-[#b52a34] border-[#fbcfe8] hover:bg-[#ffe4e9]"
              : "bg-[#fffdf8] text-[var(--color-muted)] border-[var(--color-line)] hover:text-[var(--color-ink)]"
          }`}
        >
          <span aria-hidden="true" className="text-sm select-none">
            🌸
          </span>
          <span className="text-[11px] sm:text-xs font-semibold">
            {enabled ? "Tắt hoa" : "Bật hoa"}
          </span>
        </motion.button>
      </div>
    </>
  );
}
*/
