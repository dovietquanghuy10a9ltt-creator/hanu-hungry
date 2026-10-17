"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const GREETINGS = [
  {
    title: "Gửi một nửa rạng ngời của HANU 🌸",
    message:
      "Chúc bạn một ngày 20/10 ngập tràn niềm vui, nụ cười luôn tỏa nắng trên con đường Triều Khúc - Phùng Khoang, bài thi điểm A và luôn tìm được quán ăn ngon làm bừng sáng cả ngày!",
    highlight: "Luôn xinh đẹp, tự tin và rạng rỡ nhé!",
  },
  {
    title: "Chiều chuộng vị giác hôm nay 🧋",
    message:
      "20/10 là ngày đặc biệt của bạn! Đừng ngần ngại tự thưởng cho mình một ly trà sữa full topping và một bữa ăn ấm bụng thật ngon cùng hội bạn thân hay người thương nhé!",
    highlight: "Hôm nay, bạn xứng đáng được yêu chiều nhất!",
  },
  {
    title: "Tín hiệu vũ trụ dành riêng cho bạn ✨",
    message:
      "Vũ trụ Hanu Hungry gửi tới bạn lời chúc ngọt ngào nhất: Chúc bạn ăn ngon không lo béo, học bài không lo deadline dí, và ví tiền luôn rủng rỉnh để khám phá hết mọi ngóc ngách ẩm thực quanh trường!",
    highlight: "Mỗi ngày đến trường là một ngày vui!",
  },
  {
    title: "Bông hoa tươi thắm nhất HANU 💐",
    message:
      "Cảm ơn các bạn nữ HANU vì đã luôn mang đến nguồn năng lượng tươi vui, đáng yêu và ấm áp cho toàn thể khuôn viên trường. Chúc bạn nhận được thật nhiều hoa, quà và những lời yêu thương chân thành!",
    highlight: "Chúc bạn luôn hạnh phúc và yêu đời!",
  },
  {
    title: "Hẹn hò hay tụ tập? Chiều hết! 🥘",
    message:
      "Dù hôm nay là một buổi hẹn lãng mạn bên ly cafe thơm, hay bữa lẩu nướng rôm rả 'quẩy' hết mình cùng hội chị em, Hanu Hungry chúc bạn có một bữa ăn trọn vẹn và thật nhiều kỉ niệm đáng nhớ!",
    highlight: "Ăn ngon quanh Hanu, khỏi lo nghĩ nhiều!",
  },
  {
    title: "Ngọt ngào như chiếc bánh Macaron 🍰",
    message:
      "Chúc bạn ngày 20/10 ngọt ngào hơn cả ly bingsu xoài và ấm áp hơn tô mì cay mùa se lạnh. Hãy luôn mỉm cười và tỏa sáng theo cách riêng của bạn nhé!",
    highlight: "Bạn chính là phiên bản tuyệt vời nhất!",
  },
];

const CONFETTI_COLORS = [
  "#f43f5e", // Rose
  "#ec4899", // Pink
  "#fb7185", // Light rose
  "#f59e0b", // Amber gold
  "#fbbf24", // Yellow
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#8b5cf6", // Purple
  "#f97316", // Orange
  "#ffffff", // White shine
];

const FLOWER_EMOJIS = ["🌸", "🌺", "🌷", "💐", "✨", "🎉", "💖"];

interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  opacity: number;
  decay: number;
  type: "confetti" | "flower";
  flowerChar?: string;
}

export function WomensDayGiftModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<BurstParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Pick random initial greeting
    setGreetingIndex(Math.floor(Math.random() * GREETINGS.length));
  }, []);

  function fireBurst(count = 95) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const originX = rect.width / 2;
    const originY = rect.height * 0.45;

    const newParticles: BurstParticle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 16 + 5;
      const isFlower = Math.random() > 0.65;

      newParticles.push({
        x: originX + (Math.random() - 0.5) * 40,
        y: originY + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.4),
        vy: Math.sin(angle) * speed - (Math.random() * 7 + 4), // biased upwards
        size: isFlower ? Math.random() * 8 + 16 : Math.random() * 6 + 6,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        wobble: Math.random() * Math.PI,
        wobbleSpeed: Math.random() * 0.1 + 0.05,
        opacity: 1,
        decay: Math.random() * 0.014 + 0.014,
        type: isFlower ? "flower" : "confetti",
        flowerChar: isFlower
          ? FLOWER_EMOJIS[Math.floor(Math.random() * FLOWER_EMOJIS.length)]
          : undefined,
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];

    if (!animFrameRef.current) {
      runAnimation();
    }
  }

  function runAnimation() {
    const canvas = canvasRef.current;
    if (!canvas) {
      animFrameRef.current = null;
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      animFrameRef.current = null;
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const active: BurstParticle[] = [];
    for (const p of particlesRef.current) {
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.vy += 0.3; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.wobble += p.wobbleSpeed;
      p.opacity -= p.decay;

      if (p.opacity > 0 && p.y < canvas.height + 50) {
        active.push(p);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.opacity);

        if (p.type === "flower" && p.flowerChar) {
          ctx.font = `${p.size}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.flowerChar, 0, 0);
        } else {
          // Confetti rectangle with 3D wobble
          ctx.scale(Math.cos(p.wobble), 1);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 1.6);
        }

        ctx.restore();
      }
    }

    particlesRef.current = active;

    if (active.length > 0) {
      animFrameRef.current = requestAnimationFrame(runAnimation);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function handleOpen() {
    setIsOpen(true);
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      fireBurst(42);
    }, 120);
  }

  function handleNextGreeting() {
    setIsRotating(true);
    fireBurst(20);
    setTimeout(() => {
      setGreetingIndex((prev) => (prev + 1) % GREETINGS.length);
      setIsRotating(false);
    }, 150);
  }

  const currentGreeting = GREETINGS[greetingIndex];

  return (
    <>
      {/* Floating Animated Gift Box Button */}
      <div className="fixed right-3.5 bottom-20 md:bottom-6 z-40">
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Mở hộp quà chúc mừng 20/10"
          className="relative group flex items-center gap-2 rounded-full border-2 border-rose-300 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 px-3.5 py-2 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-rose-400/50 active:scale-95 cursor-pointer"
        >
          {/* Pulsing ring animation */}
          <span
            aria-hidden="true"
            className="absolute -inset-1 rounded-full bg-rose-400 opacity-40 blur-xs animate-ping"
            style={{ animationDuration: "2.5s" }}
          />

          <span aria-hidden="true" className="relative text-xl animate-bounce" style={{ animationDuration: "1.8s" }}>
            🎁
          </span>

          <span className="relative flex flex-col items-start leading-none pr-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-100">
              Quà 20/10
            </span>
            <span className="text-xs font-black text-white flex items-center gap-1">
              Mở quà <span className="text-[10px]">✨</span>
            </span>
          </span>

          <span
            aria-hidden="true"
            className="relative flex h-2 w-2 rounded-full bg-amber-300 animate-pulse"
          />
        </button>
      </div>

      {/* Confetti & Floral Explosion Canvas */}
      {isOpen && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[60] h-full w-full select-none"
        />
      )}

      {/* Greeting Modal Popup */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="womens-day-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-rose-200 bg-[#fffdfa] shadow-2xl transition-all duration-300 transform scale-100">
            {/* Festive Top Ribbon */}
            <div className="relative bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 px-6 py-5 text-center text-white overflow-hidden">
              {/* Decorative sparkles */}
              <span className="absolute left-3 top-2 text-rose-200 text-lg opacity-80 animate-pulse" aria-hidden="true">
                ✨
              </span>
              <span className="absolute right-4 bottom-2 text-rose-200 text-base opacity-80 animate-pulse" aria-hidden="true">
                🌸
              </span>
              <span className="absolute left-8 bottom-1 text-rose-100 text-xs opacity-60" aria-hidden="true">
                💐
              </span>

              <p className="text-[11px] font-extrabold uppercase tracking-widest text-rose-100">
                20 THÁNG 10 · NGÀY PHỤ NỮ VIỆT NAM
              </p>
              <h2 id="womens-day-title" className="text-xl sm:text-2xl font-black mt-1 text-white">
                Chúc Mừng Nàng Thơ HANU 🌸
              </h2>
            </div>

            {/* Body Content */}
            <div className="p-6 text-center space-y-4">
              <div
                className={`transition-opacity duration-200 ${
                  isRotating ? "opacity-0 scale-95" : "opacity-100 scale-100"
                }`}
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 border border-rose-200 text-3xl shadow-xs">
                  💐
                </div>

                <h3 className="mt-3 text-lg font-bold text-rose-900">
                  {currentGreeting.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]">
                  {currentGreeting.message}
                </p>

                <p className="mt-3 inline-block rounded-full bg-rose-50 px-3.5 py-1 text-xs font-bold text-rose-600 border border-rose-200">
                  {currentGreeting.highlight}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2.5">
                {/* Compact 1/6 Button as requested */}
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleNextGreeting}
                    title="Xem lời chúc tiếp theo"
                    aria-label={`Xem lời chúc tiếp theo (${greetingIndex + 1}/${GREETINGS.length})`}
                    className="inline-flex items-center justify-center rounded-full border border-rose-300 bg-rose-50/90 hover:bg-rose-100 hover:border-rose-400 px-4 py-1 text-xs font-black text-rose-700 shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    {greetingIndex + 1}/{GREETINGS.length}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <Link
                    href="/gacha"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-1 rounded-xl bg-rose-600 px-3 py-2.5 font-bold text-white shadow-xs transition hover:bg-rose-700 active:translate-y-0.5"
                  >
                    <span>🎲 Gacha chiều nàng</span>
                  </Link>
                  <Link
                    href="/restaurants?q=cafe"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-1 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2.5 font-bold text-rose-700 transition hover:bg-rose-100 active:translate-y-0.5"
                  >
                    <span>📸 Quán cafe chụp hoa</span>
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="mt-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] py-1 font-semibold transition cursor-pointer"
                >
                  Đóng lại (Cảm ơn Hanu Hungry! 💕)
                </button>
              </div>
            </div>

            {/* Close Button top-right */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng hộp quà"
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
