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
  "#f43f5e",
  "#ec4899",
  "#fb7185",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#8b5cf6",
];

const FLOWER_EMOJIS = ["🌸", "🌺", "🌷", "💐", "✨"];

interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  decay: number;
  type: "confetti" | "flower";
  flowerChar?: string;
}

export function WomensDayGiftModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [showBurst, setShowBurst] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<BurstParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setGreetingIndex(Math.floor(Math.random() * GREETINGS.length));
  }, []);

  function fireBurst(count = 28) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const originX = rect.width / 2;
    const originY = rect.height * 0.42;

    const newParticles: BurstParticle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 10 + 4;
      const isFlower = i % 3 === 0;

      newParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: isFlower ? 16 : 7,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
        opacity: 1,
        decay: 0.024,
        type: isFlower ? "flower" : "confetti",
        flowerChar: isFlower
          ? FLOWER_EMOJIS[i % FLOWER_EMOJIS.length]
          : undefined,
      });
    }

    particlesRef.current = newParticles;
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
      p.vy += 0.32; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.opacity -= p.decay;

      if (p.opacity > 0 && p.y < canvas.height + 30) {
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
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
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
      setShowBurst(false);
    }
  }

  function handleOpen() {
    setIsOpen(true);
    setShowBurst(true);
    // Fire burst ONLY once when opening the gift
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      fireBurst(28);

      // Auto-cleanup burst after 1.3 seconds
      setTimeout(() => {
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
        setShowBurst(false);
      }, 1300);
    }, 100);
  }

  function handleClose() {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setShowBurst(false);
    setIsOpen(false);
  }

  // Instant switch on click - NO burst, NO lag, instant update!
  function handleNextGreeting() {
    setGreetingIndex((prev) => (prev + 1) % GREETINGS.length);
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
          className="relative group flex items-center gap-2 rounded-full border-2 border-rose-300 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 px-3.5 py-2 text-white shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-300 text-[9px] text-yellow-900 shadow-xs animate-ping" style={{ animationDuration: "3s" }} aria-hidden="true">
            ✨
          </span>
          <span aria-hidden="true" className="relative text-xl animate-bounce" style={{ animationDuration: "2s" }}>
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
        </button>
      </div>

      {/* Confetti & Floral Explosion Canvas (Only rendered during opening burst, unmounted after) */}
      {isOpen && showBurst && (
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 transition-opacity"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-rose-200 bg-[#fffdfa] shadow-xl">
            {/* Festive Top Ribbon */}
            <div className="relative bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 px-6 py-5 text-center text-white overflow-hidden">
              <span className="absolute left-3 top-2 text-rose-200 text-lg opacity-80" aria-hidden="true">
                ✨
              </span>
              <span className="absolute right-4 bottom-2 text-rose-200 text-base opacity-80" aria-hidden="true">
                🌸
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
              <div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 border border-rose-200 text-3xl shadow-xs">
                  💐
                </div>

                <h3 className="mt-3 text-lg font-bold text-rose-900">
                  {currentGreeting.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)] min-h-[4rem] flex items-center justify-center">
                  {currentGreeting.message}
                </p>

                <p className="mt-3 inline-block rounded-full bg-rose-50 px-3.5 py-1 text-xs font-bold text-rose-600 border border-rose-200">
                  {currentGreeting.highlight}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2.5">
                {/* Compact 1/6 Button: instant click, zero burst, zero lag */}
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleNextGreeting}
                    title="Xem lời chúc tiếp theo"
                    aria-label={`Xem lời chúc tiếp theo (${greetingIndex + 1}/${GREETINGS.length})`}
                    className="inline-flex items-center justify-center rounded-full border border-rose-300 bg-rose-50 hover:bg-rose-100 hover:border-rose-400 px-4 py-1 text-xs font-black text-rose-700 shadow-2xs transition-transform active:scale-95 cursor-pointer"
                  >
                    {greetingIndex + 1}/{GREETINGS.length}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <Link
                    href="/gacha"
                    onClick={handleClose}
                    className="flex items-center justify-center gap-1 rounded-xl bg-rose-600 px-3 py-2.5 font-bold text-white shadow-xs transition hover:bg-rose-700 active:translate-y-0.5"
                  >
                    <span>🎲 Gacha chiều nàng</span>
                  </Link>
                  <Link
                    href="/restaurants?q=cafe"
                    onClick={handleClose}
                    className="flex items-center justify-center gap-1 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2.5 font-bold text-rose-700 transition hover:bg-rose-100 active:translate-y-0.5"
                  >
                    <span>📸 Quán cafe chụp hoa</span>
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] py-1 font-semibold transition cursor-pointer"
                >
                  Đóng lại (Cảm ơn Hanu Hungry! 💕)
                </button>
              </div>
            </div>

            {/* Close Button top-right */}
            <button
              type="button"
              onClick={handleClose}
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
