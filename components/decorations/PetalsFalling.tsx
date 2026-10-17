"use client";

import { useEffect, useRef, useState } from "react";

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  angle: number;
  angularSpeed: number;
  flipAngle: number;
  flipSpeed: number;
  opacity: number;
  color: string;
  type: "petal" | "blossom";
}

const PETAL_COLORS = [
  "rgba(255, 183, 197, 0.85)", // Sakura pink
  "rgba(255, 154, 179, 0.8)",  // Rose pink
  "rgba(244, 114, 182, 0.75)", // Deep blossom
  "rgba(251, 207, 232, 0.9)",  // Light pastel pink
  "rgba(254, 205, 211, 0.85)", // Warm petal
];

export function PetalsFalling() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);
  const animationFrameId = useRef<number | null>(null);
  const petalsRef = useRef<Petal[]>([]);

  // Check saved preference on mount
  useEffect(() => {
    setMounted(true);
    const saved = sessionStorage.getItem("hanu_petals_enabled");
    if (saved !== null) {
      setEnabled(saved === "true");
    } else {
      // Respect prefers-reduced-motion
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

  useEffect(() => {
    if (!mounted || !enabled) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    // Initialize petals (around 24 petals for smooth, non-intrusive effect)
    const petalCount = window.innerWidth < 640 ? 16 : 26;
    const petals: Petal[] = [];
    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 8 + 10,
        speedY: Math.random() * 1.2 + 0.8,
        speedX: Math.random() * 0.8 - 0.4,
        angle: Math.random() * 360,
        angularSpeed: (Math.random() - 0.5) * 0.03,
        flipAngle: Math.random() * Math.PI,
        flipSpeed: Math.random() * 0.03 + 0.015,
        opacity: Math.random() * 0.35 + 0.55,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        type: Math.random() > 0.85 ? "blossom" : "petal",
      });
    }
    petalsRef.current = petals;

    let time = 0;

    function drawPetal(ctx: CanvasRenderingContext2D, p: Petal) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      // Simulate 3D tumbling by scaling Y with cosine
      ctx.scale(1, Math.cos(p.flipAngle));
      ctx.globalAlpha = p.opacity;

      if (p.type === "blossom") {
        // Draw miniature cherry blossom flower (5 petals)
        ctx.fillStyle = p.color;
        const r = p.size * 0.45;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.ellipse(0, -r, r * 0.5, r, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.rotate((Math.PI * 2) / 5);
        }
        // Center pistil
        ctx.fillStyle = "#fff7ed";
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Draw individual curved petal
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(p.size * 0.5, -p.size * 0.5, p.size, -p.size * 0.3, p.size, 0);
        ctx.bezierCurveTo(p.size, p.size * 0.3, p.size * 0.5, p.size * 0.5, 0, 0);
        ctx.fill();
      }

      ctx.restore();
    }

    function loop() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.02;

      for (const p of petalsRef.current) {
        // Sway horizontally using sine wave
        p.x += p.speedX + Math.sin(time + p.size) * 0.7;
        p.y += p.speedY;
        p.angle += p.angularSpeed;
        p.flipAngle += p.flipSpeed;

        // Wrap around when falling off bottom
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        // Wrap horizontally
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;

        drawPetal(ctx, p);
      }

      animationFrameId.current = requestAnimationFrame(loop);
    }

    animationFrameId.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [mounted, enabled]);

  if (!mounted) return null;

  return (
    <>
      {enabled && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-30 h-full w-full select-none"
        />
      )}

      {/* Floating control button to toggle falling petals */}
      <div className="fixed left-3.5 bottom-20 md:bottom-6 z-40">
        <button
          type="button"
          onClick={togglePetals}
          title={enabled ? "Tắt hiệu ứng cánh hoa rơi" : "Bật hiệu ứng cánh hoa rơi 20/10"}
          aria-label={enabled ? "Tắt hiệu ứng cánh hoa rơi" : "Bật hiệu ứng cánh hoa rơi 20/10"}
          className={`group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-300 shadow-md backdrop-blur border ${
            enabled
              ? "bg-[#fff0f3]/90 text-[#b52a34] border-[#fbcfe8] hover:bg-[#ffe4e9]"
              : "bg-[#fffdf8]/90 text-[var(--color-muted)] border-[var(--color-line)] hover:text-[var(--color-ink)]"
          }`}
        >
          <span
            aria-hidden="true"
            className={`text-sm transition-transform duration-300 ${
              enabled ? "animate-spin-slow inline-block" : "opacity-60"
            }`}
            style={{ animationDuration: "6s" }}
          >
            🌸
          </span>
          <span className="hidden sm:inline">
            {enabled ? "Hoa rơi 20/10: Bật" : "Hoa rơi: Tắt"}
          </span>
        </button>
      </div>
    </>
  );
}

