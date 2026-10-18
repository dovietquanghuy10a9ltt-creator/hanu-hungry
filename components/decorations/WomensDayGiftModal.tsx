"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// Âm lượng nhạc nền rất nhỏ, dịu êm như tiếng đàn du dương trong phòng đọc
const TARGET_VOLUME = 0.08;

const GREETINGS = [
  {
    title: "Gửi một nửa rạng ngời của HANU 🌸",
    lines: [
      "Chúc bạn một ngày 20/10 ngập tràn niềm vui, nụ cười luôn tỏa nắng trên con đường Triều Khúc - Phùng Khoang.",
      "Chúc cho mọi bài thi của bạn đều rực rỡ điểm A và luôn tìm được quán ăn ngon làm bừng sáng cả ngày!",
    ],
    highlight: "Luôn xinh đẹp, tự tin và rạng rỡ nhé!",
  },
  {
    title: "Chiều chuộng vị giác hôm nay 🧋",
    lines: [
      "20/10 là ngày đặc biệt của riêng bạn! Đừng ngần ngại tự thưởng cho mình một ly trà sữa full topping ngọt ngào.",
      "Và một bữa ăn ấm bụng thật ngon cùng hội bạn thân hay người thương nhé!",
    ],
    highlight: "Hôm nay, bạn xứng đáng được yêu chiều nhất!",
  },
  {
    title: "Tín hiệu vũ trụ dành riêng cho bạn ✨",
    lines: [
      "Vũ trụ Hanu Hungry gửi tới bạn lời chúc ngọt ngào nhất: Ăn ngon không lo béo, học bài không lo deadline dí.",
      "Và chiếc ví thì luôn rủng rỉnh để khám phá hết mọi ngóc ngách ẩm thực quanh trường!",
    ],
    highlight: "Mỗi ngày đến trường là một ngày vui!",
  },
  {
    title: "Bông hoa tươi thắm nhất HANU 💐",
    lines: [
      "Cảm ơn các bạn nữ HANU vì đã luôn mang đến nguồn năng lượng tươi vui, đáng yêu và ấm áp cho khuôn viên trường.",
      "Chúc bạn hôm nay nhận được thật nhiều hoa, quà và những lời yêu thương chân thành nhất!",
    ],
    highlight: "Chúc bạn luôn hạnh phúc và yêu đời!",
  },
  {
    title: "Hẹn hò hay tụ tập? Chiều hết! 🥘",
    lines: [
      "Dù hôm nay là một buổi hẹn ngọt ngào bên ly trà ấm, hay bữa lẩu nướng rôm rả 'quẩy' hết mình cùng hội chị em.",
      "Hanu Hungry chúc bạn có một bữa ăn trọn vẹn và thật nhiều kỉ niệm đáng nhớ!",
    ],
    highlight: "Ăn ngon quanh Hanu, khỏi lo nghĩ nhiều!",
  },
  {
    title: "Ngọt ngào như chiếc bánh Macaron 🍰",
    lines: [
      "Chúc bạn ngày 20/10 ngọt ngào hơn cả ly bingsu xoài và ấm áp hơn tô mì cay mùa se lạnh.",
      "Hãy luôn mỉm cười và tỏa sáng rực rỡ theo cách riêng của bạn nhé!",
    ],
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

interface WomensDayGiftModalProps {
  userId?: string;
  userEmail?: string;
  isAdmin?: boolean;
}

export function WomensDayGiftModal({ userId, userEmail, isAdmin }: WomensDayGiftModalProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  // Tạm thời chưa tới 20/10: luôn mở cho mọi tài khoản test thoải mái, không khóa
  const [isClaimed] = useState(false);
  const [step, setStep] = useState<"cat_intro" | "wishes">("cat_intro");
  const [greetingIndex, setGreetingIndex] = useState(0);

  // Progressive sentence opacity fade-in stage: 0 = title, 1 = sentence 1, 2 = sentence 2, 3 = highlight badge
  const [fadeStage, setFadeStage] = useState(0);
  const [isTextFinished, setIsTextFinished] = useState(false);

  const [showBurst, setShowBurst] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<BurstParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Preload all assets in advance so modal never lags
  useEffect(() => {
    if (typeof window !== "undefined") {
      const preloadImg = new window.Image();
      preloadImg.src = "/images/20-10/cat-flower.webp";

      const preloadOverlay = new window.Image();
      preloadOverlay.src = "/images/20-10/modal-bg-overlay.png";

      const preloadAudio = new window.Audio();
      preloadAudio.src = "/audio/womens-day-bgm.mp3";
      preloadAudio.preload = "auto";
    }
  }, []);

  // Sequential opacity reveal for greeting lines: line-by-line smooth fade-in
  useEffect(() => {
    if (!isOpen || step !== "wishes") return;

    setFadeStage(0);
    setIsTextFinished(false);

    // Title appears at 100ms
    const t0 = setTimeout(() => setFadeStage(1), 100);
    // Line 1 appears at 500ms
    const t1 = setTimeout(() => setFadeStage(2), 500);
    // Line 2 appears at 1200ms
    const t2 = setTimeout(() => setFadeStage(3), 1200);
    // Highlight tag appears at 1900ms & completes
    const t3 = setTimeout(() => {
      setFadeStage(4);
      setIsTextFinished(true);
    }, 1900);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen, step, greetingIndex]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) {
        clearInterval(fadeTimerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
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
    setStep("cat_intro");
    setGreetingIndex(0); // Starts at 1/6
    setFadeStage(0);
    setIsTextFinished(false);
    setIsOpen(true);
    setShowBurst(true);

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      fireBurst(28);

      setTimeout(() => {
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
        setShowBurst(false);
      }, 1300);
    }, 100);
  }

  function handleStartWishes() {
    setStep("wishes");
    setGreetingIndex(0); // Starts at 1/6

    const audio = audioRef.current;
    if (audio) {
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);

      audio.currentTime = 0;
      audio.volume = 0; // Starts from 0 volume
      audio
        .play()
        .then(() => {
          // Fade in over 0.5s smoothly to whisper-soft TARGET_VOLUME
          const startTime = Date.now();
          fadeTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed >= 500) {
              audio.volume = TARGET_VOLUME;
              if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
            } else {
              audio.volume = (elapsed / 500) * TARGET_VOLUME;
            }
          }, 25);
        })
        .catch(() => {
          // Graceful handling of mobile autoplay restrictions
        });
    }
  }

  function handleAudioTimeUpdate() {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    // 0.5s cuối: âm lượng tự động nhỏ dần về 0
    const remaining = audio.duration - audio.currentTime;
    if (remaining <= 0.5 && remaining > 0) {
      audio.volume = Math.max(0, (remaining / 0.5) * TARGET_VOLUME);
    }
  }

  function handleNextGreeting() {
    if (greetingIndex < GREETINGS.length - 1) {
      setGreetingIndex((prev) => prev + 1);
    }
  }

  function handleCloseAndClaim() {
    const audio = audioRef.current;
    if (audio) {
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);

      // Fade out over 0.5s smoothly
      const startVol = audio.volume;
      const startTime = Date.now();
      fadeTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= 500) {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 0;
          if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
        } else {
          audio.volume = Math.max(0, startVol * (1 - elapsed / 500));
        }
      }, 25);
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setShowBurst(false);
    setIsOpen(false);
  }

  const currentGreeting = GREETINGS[greetingIndex];
  const isLastGreeting = greetingIndex === GREETINGS.length - 1;
  const canExit = isLastGreeting && isTextFinished;

  return (
    <>
      {/* Hidden Audio Player for 20/10 BGM with Gentle Fade handling */}
      <audio
        ref={audioRef}
        src="/audio/womens-day-bgm.mp3"
        preload="auto"
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={() => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.volume = 0;
          }
        }}
      />

      {/* Floating Gift Box Button - Elevated with z-[60] and bottom-[84px] on mobile to prevent navbar blocking */}
      <div className="fixed right-3 bottom-[84px] md:bottom-6 z-[60] select-none touch-manipulation">
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Mở hộp quà chúc mừng 20/10"
          className="relative group flex items-center gap-2 rounded-full border-2 border-rose-300 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 px-3.5 py-2 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer touch-manipulation"
        >
          <span
            className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-300 text-[9px] text-yellow-900 shadow-xs animate-ping"
            style={{ animationDuration: "3s" }}
            aria-hidden="true"
          >
            ✨
          </span>
          <span
            aria-hidden="true"
            className="relative text-xl animate-bounce"
            style={{ animationDuration: "2s" }}
          >
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

      {/* Confetti & Floral Explosion Canvas */}
      {isOpen && showBurst && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[70] h-full w-full select-none"
        />
      )}

      {/* Gift Modal Popup */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="womens-day-title"
          className="fixed inset-0 z-[75] flex items-center justify-center p-3.5 sm:p-4 bg-black/60 transition-opacity backdrop-blur-2xs"
          onClick={() => {
            if (canExit) {
              handleCloseAndClaim();
            }
          }}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-rose-200 bg-[#fffdfa] shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 50% Opacity Decorative Background Overlay: ONLY active on STEP 2 (wishes 1-6) */}
            {step === "wishes" && (
              <div
                className="pointer-events-none absolute inset-0 z-0 bg-center bg-no-repeat bg-contain opacity-50 transition-opacity duration-700 animate-in fade-in"
                style={{
                  backgroundImage: "url('/images/20-10/modal-bg-overlay.png')",
                  backgroundPosition: "center 62%",
                  backgroundSize: "85% auto",
                }}
                aria-hidden="true"
              />
            )}

            {/* Festive Top Ribbon */}
            <div className="relative z-10 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 px-6 py-4 text-center text-white overflow-hidden shadow-xs">
              <span
                className="absolute left-3 top-2 text-rose-200 text-lg opacity-80"
                aria-hidden="true"
              >
                ✨
              </span>
              <span
                className="absolute right-4 bottom-2 text-rose-200 text-base opacity-80"
                aria-hidden="true"
              >
                🌸
              </span>

              <p className="text-[10px] font-black uppercase tracking-widest text-rose-100">
                20 THÁNG 10 · NGÀY PHỤ NỮ VIỆT NAM
              </p>
              <h2
                id="womens-day-title"
                className="text-lg sm:text-xl font-black mt-0.5 text-white flex items-center justify-center gap-1.5"
              >
                Chúc Mừng Nàng Thơ HANU 🌸
              </h2>
            </div>

            {/* STEP 1: Bé mèo ôm hoa tặng bạn (Nền kem sạch, KHÔNG có ảnh đè mờ 50%) */}
            {step === "cat_intro" && (
              <div className="relative z-10 p-6 text-center space-y-4">
                <div className="relative mx-auto flex justify-center items-center h-48 w-48 sm:h-52 sm:w-52">
                  <div
                    className="absolute inset-0 rounded-full bg-rose-200/30 blur-xl animate-pulse"
                    aria-hidden="true"
                  />
                  <Image
                    src="/images/20-10/cat-flower.webp"
                    alt="Bé mèo cầm hoa tặng bạn nhân ngày 20/10"
                    width={220}
                    height={220}
                    priority
                    unoptimized
                    className="relative z-10 object-contain drop-shadow-md animate-in fade-in zoom-in-95 duration-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="inline-block rounded-full bg-rose-100/90 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200 shadow-2xs">
                    🐾 Bé mèo HANU có một món quà gửi bạn 💐
                  </span>
                  <h3 className="text-lg font-black text-rose-900 pt-1">
                    Gửi tặng bạn một bó hoa tươi thắm nè!
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed max-w-sm mx-auto">
                    Hanu Hungry chúc bạn một ngày 20/10 luôn tràn ngập tiếng cười, xinh đẹp, tự tin và ngập tràn hạnh phúc!
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStartWishes}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 px-5 py-3 font-black text-white shadow-md transition-all hover:brightness-110 active:scale-98 cursor-pointer touch-manipulation"
                  >
                    <span>Nhận hoa & Mở thiệp chúc</span>
                    <span className="text-lg animate-bounce" style={{ animationDuration: "1.5s" }}>
                      💐
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Lời chúc từ 1 đến 6 (Thiết kế dạng Thiệp/Card lật giở xịn xò & Dòng chữ mờ dần hiện ra) */}
            {step === "wishes" && (
              <div className="relative z-10 p-5 sm:p-6 text-center space-y-4">
                {/* Greeting Card with smooth flip/slide transition */}
                <div
                  key={greetingIndex}
                  className="relative rounded-2xl border border-rose-200/90 bg-white/90 backdrop-blur-xs p-5 shadow-sm space-y-3 min-h-[15.5rem] flex flex-col justify-center animate-in fade-in slide-in-from-right-4 zoom-in-98 duration-500"
                >
                  {/* Decorative flower icon */}
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 border border-rose-200 text-2xl shadow-xs transition-transform hover:rotate-12 duration-300">
                    💐
                  </div>

                  {/* Title: Fades in at stage >= 1 */}
                  <h3
                    className={`text-lg font-black text-rose-900 transition-all duration-700 ease-out ${
                      fadeStage >= 1
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2"
                    }`}
                  >
                    {currentGreeting.title}
                  </h3>

                  {/* Sentences: Smooth sequential opacity fade-in */}
                  <div className="space-y-2 text-sm leading-relaxed text-[var(--color-ink)] font-medium text-left sm:text-center min-h-[4.5rem] flex flex-col justify-center">
                    <p
                      className={`transition-all duration-700 ease-out ${
                        fadeStage >= 2
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-2"
                      }`}
                    >
                      {currentGreeting.lines[0]}
                    </p>
                    <p
                      className={`transition-all duration-700 ease-out ${
                        fadeStage >= 3
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-2"
                      }`}
                    >
                      {currentGreeting.lines[1]}
                    </p>
                  </div>

                  {/* Highlight Badge: Fades in at stage >= 4 */}
                  <div className="min-h-[2rem] flex items-center justify-center pt-1">
                    <span
                      className={`rounded-full bg-rose-100/95 px-3.5 py-1 text-xs font-bold text-rose-700 border border-rose-200 shadow-2xs transition-all duration-700 ease-out ${
                        fadeStage >= 4
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-95"
                      }`}
                    >
                      {currentGreeting.highlight}
                    </span>
                  </div>
                </div>

                {/* Progress & Navigation Buttons */}
                <div className="pt-1 flex flex-col gap-2.5">
                  {/* Card Page Indicator */}
                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-flex items-center justify-center rounded-full border border-rose-300 bg-rose-50/90 px-3 py-0.5 text-xs font-black text-rose-700 shadow-2xs">
                      Thiệp chúc {greetingIndex + 1}/{GREETINGS.length} 🌸
                    </span>
                  </div>

                  {/* From 1/6 to 5/6: Next greeting button */}
                  {!isLastGreeting ? (
                    <button
                      type="button"
                      onClick={handleNextGreeting}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-3 font-bold text-white shadow-xs transition hover:from-rose-600 hover:to-pink-700 active:translate-y-0.5 cursor-pointer touch-manipulation"
                    >
                      <span>Giở thiệp tiếp theo ({greetingIndex + 1}/6)</span>
                      <span aria-hidden="true">➔</span>
                    </button>
                  ) : (
                    /* At 6/6: ONLY show close button after lines have faded in */
                    canExit && (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                        <button
                          type="button"
                          onClick={handleCloseAndClaim}
                          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-700 hover:to-pink-700 px-5 py-3 text-sm font-bold text-white shadow-md transition active:scale-98 cursor-pointer touch-manipulation"
                        >
                          <span>Đóng thiệp chúc (Cảm ơn Hanu Hungry! 💕)</span>
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Top-Right Close Button: ONLY visible when canExit is true */}
            {canExit && (
              <button
                type="button"
                onClick={handleCloseAndClaim}
                aria-label="Đóng hộp quà 20/10"
                className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition cursor-pointer animate-in fade-in duration-300 touch-manipulation"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
