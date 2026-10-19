"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Âm lượng nhạc nền êm dịu, rõ ràng vừa vặn cho không khí lễ hội 20/10 (~35%)
const TARGET_VOLUME = 0.35;

const GREETINGS = [
  {
    icon: "🌸",
    tag: "Nàng Thơ HANU",
    title: "Gửi một nửa rạng ngời của HANU 🌸",
    lines: [
      "Chúc bạn luôn ngập tràn niềm vui, nụ cười rạng rỡ tỏa nắng trên con đường Triều Khúc - Phùng Khoang.",
      "Chúc cho mọi bài thi của bạn đều rực rỡ điểm A và luôn tìm được những quán ăn ngon làm bừng sáng cả ngày!",
    ],
    highlight: "Luôn xinh đẹp, tự tin và rạng rỡ nhé!",
  },
  {
    icon: "🧋",
    tag: "Trà Sữa & Món Ngon",
    title: "Chiều chuộng vị giác hôm nay 🧋",
    lines: [
      "Hôm nay là ngày đặc biệt của riêng bạn! Đừng ngần ngại tự thưởng cho mình một ly trà sữa full topping ngọt ngào.",
      "Và một bữa ăn ấm bụng thật ngon cùng hội bạn thân hay người thương nhé!",
    ],
    highlight: "Hôm nay, bạn xứng đáng được yêu chiều nhất!",
  },
  {
    icon: "✨",
    tag: "Tín Hiệu Vũ Trụ",
    title: "Tín hiệu vũ trụ dành riêng cho bạn ✨",
    lines: [
      "Vũ trụ Hanu Hungry gửi tới bạn lời chúc ngọt ngào nhất: Ăn ngon không lo béo, học bài không lo deadline dí.",
      "Và chiếc ví thì luôn rủng rỉnh để khám phá hết mọi ngóc ngách ẩm thực quanh trường!",
    ],
    highlight: "Mỗi ngày đến trường là một ngày vui!",
  },
  {
    icon: "💐",
    tag: "Bông Hoa Tươi Thắm",
    title: "Bông hoa tươi thắm nhất HANU 💐",
    lines: [
      "Cảm ơn các bạn nữ HANU vì đã luôn mang đến nguồn năng lượng tươi vui, đáng yêu và ấm áp cho khuôn viên trường.",
      "Chúc bạn hôm nay nhận được thật nhiều hoa, quà và những lời yêu thương chân thành nhất!",
    ],
    highlight: "Chúc bạn luôn hạnh phúc và yêu đời!",
  },
  {
    icon: "🥘",
    tag: "Tụ Tập & Hẹn Hò",
    title: "Hẹn hò hay tụ tập? Chiều hết! 🥘",
    lines: [
      "Dù hôm nay là một buổi hẹn ngọt ngào bên ly trà ấm, hay bữa lẩu nướng rôm rả 'quẩy' hết mình cùng hội chị em.",
      "Hanu Hungry chúc bạn có một bữa ăn trọn vẹn và thật nhiều kỉ niệm đáng nhớ!",
    ],
    highlight: "Ăn ngon quanh Hanu, khỏi lo nghĩ nhiều!",
  },
  {
    icon: "🍰",
    tag: "Ngọt Ngào Mỗi Ngày",
    title: "Ngọt ngào như chiếc bánh Macaron 🍰",
    lines: [
      "Chúc bạn luôn ngọt ngào hơn cả ly bingsu xoài và ấm áp hơn tô mì cay mùa se lạnh.",
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

function createParticles(count: number, originX: number, originY: number): BurstParticle[] {
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
  return newParticles;
}

export function WomensDayGiftModal({ userId, userEmail, isAdmin }: WomensDayGiftModalProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  // Tạm thời chưa tới 20/10: luôn mở cho mọi tài khoản test thoải mái, không khóa
  const [isClaimed] = useState(false);
  const [step, setStep] = useState<"cat_intro" | "wishes">("cat_intro");
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

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

    particlesRef.current = createParticles(count, originX, originY);
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
      audio.muted = false;
      // Start with a gentle audible level (0.05) so mobile WebKit/Android doesn't zero-clamp
      audio.volume = 0.05;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            // Smoothly ramp volume up to TARGET_VOLUME over 0.5s (500ms)
            const startTime = Date.now();
            fadeTimerRef.current = setInterval(() => {
              const elapsed = Date.now() - startTime;
              if (elapsed >= 500) {
                audio.volume = TARGET_VOLUME;
                if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
              } else {
                const ratio = elapsed / 500;
                audio.volume = 0.05 + ratio * (TARGET_VOLUME - 0.05);
              }
            }, 30);
          })
          .catch((err) => {
            console.warn("Autoplay was prevented by browser policy:", err);
            setIsPlaying(false);
          });
      }
    }
  }

  function toggleAudio() {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.muted = false;
      audio.volume = TARGET_VOLUME;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn("Failed to play audio:", err));
    }
  }

  function handleAudioTimeUpdate() {
    const audio = audioRef.current;
    if (!audio || !audio.duration || Number.isNaN(audio.duration)) return;

    // Only apply fade-out at the very end if currentTime has played past 3 seconds
    if (audio.currentTime > 3) {
      const remaining = audio.duration - audio.currentTime;
      if (remaining <= 0.5 && remaining >= 0) {
        audio.volume = Math.max(0, (remaining / 0.5) * TARGET_VOLUME);
      }
    }
  }

  function handleNextGreeting() {
    if (greetingIndex < GREETINGS.length - 1) {
      setGreetingIndex((prev) => prev + 1);
    }
  }

  function handlePrevGreeting() {
    if (greetingIndex > 0) {
      setGreetingIndex((prev) => prev - 1);
    }
  }

  function handleJumpGreeting(index: number) {
    if (index >= 0 && index < GREETINGS.length) {
      setGreetingIndex(index);
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
          setIsPlaying(false);
          if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
        } else {
          audio.volume = Math.max(0, startVol * (1 - elapsed / 500));
        }
      }, 30);
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
        playsInline
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
          }
        }}
      />

      {/* Floating Gift Box Button - Elevated with z-[60] and safe bottom margin above mobile navbar */}
      <div className="fixed right-3 bottom-[calc(78px+env(safe-area-inset-bottom,0px))] md:bottom-6 z-[60]">
        <button
          type="button"
          onClick={() => handleOpen()}
          aria-label="Mở hộp quà tặng"
          className="relative group flex items-center gap-2 rounded-full border-2 border-rose-300/90 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 px-3.5 py-2 text-white shadow-xl shadow-rose-500/25 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-rose-500/40"
        >
          <span
            className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-300 text-[10px] text-amber-950 shadow-sm animate-ping"
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
              Hộp quà
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

      {/* Gift Modal Popup with Framer Motion Spring Transition */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="womens-day-title"
            className="fixed inset-0 z-[75] flex items-center justify-center p-3.5 sm:p-4 bg-black/60 backdrop-blur-2xs"
            onClick={() => {
              if (canExit) {
                handleCloseAndClaim();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.88, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-rose-200 bg-[#fffdfa] shadow-2xl"
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
                {/* Sound Toggle Button (Visible on Step 2) */}
                {step === "wishes" && (
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    type="button"
                    onClick={toggleAudio}
                    title={isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền"}
                    aria-label={isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền"}
                    className="absolute left-3 top-3.5 z-20 flex items-center gap-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold text-white cursor-pointer touch-manipulation shadow-xs hover:scale-105"
                  >
                    <span className={isPlaying ? "animate-pulse" : ""}>
                      {isPlaying ? "🔊" : "🔇"}
                    </span>
                    <span className="text-[10px] hidden sm:inline font-semibold">
                      {isPlaying ? "Nhạc nền" : "Bật nhạc"}
                    </span>
                  </motion.button>
                )}

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

              {/* STEP 1: Bé mèo ôm hoa tặng bạn */}
              {step === "cat_intro" && (
                <div className="relative z-10 p-5 sm:p-6 text-center space-y-4">
                  <div className="relative mx-auto flex justify-center items-center h-48 w-48 sm:h-52 sm:w-52">
                    {/* Glowing Aura Rings */}
                    <div
                      className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-300/40 via-pink-200/30 to-amber-200/40 blur-2xl animate-pulse"
                      aria-hidden="true"
                    />
                    <div
                      className="absolute inset-4 rounded-full border-2 border-rose-200/60 border-dashed animate-spin-slow pointer-events-none"
                      style={{ animationDuration: "24s" }}
                      aria-hidden="true"
                    />
                    <Image
                      src="/images/20-10/cat-flower.webp"
                      alt="Bé mèo ôm hoa tặng bạn"
                      width={220}
                      height={220}
                      priority
                      unoptimized
                      className="relative z-10 object-contain drop-shadow-lg transition-transform duration-500 hover:scale-105 animate-in fade-in zoom-in-95 duration-500"
                    />
                  </div>

                  {/* Card Content Banner */}
                  <div className="relative rounded-2xl border border-rose-200/80 bg-white/80 backdrop-blur-xs p-4 shadow-sm space-y-2">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200/80 shadow-2xs">
                        <span>🐾</span>
                        <span>Món quà ngọt ngào từ HANU</span>
                        <span>💐</span>
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-rose-950 pt-0.5">
                      Gửi tặng bạn một bó hoa tươi thắm nè!
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto font-medium">
                      Hanu Hungry chúc bạn luôn tràn ngập tiếng cười, xinh đẹp, tự tin và ngập tràn hạnh phúc mỗi ngày!
                    </p>
                  </div>

                  <div className="pt-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      type="button"
                      onClick={handleStartWishes}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 px-5 py-3.5 font-black text-white shadow-lg shadow-rose-500/30 cursor-pointer touch-manipulation hover:brightness-105 transition-all"
                    >
                      <span className="text-base">Nhận hoa & Mở thiệp chúc</span>
                      <span className="text-xl animate-bounce" style={{ animationDuration: "1.5s" }}>
                        💐
                      </span>
                    </motion.button>
                  </div>
                </div>
              )}

              {/* STEP 2: Lời chúc từ 1 đến 6 (Thiết kế Card sang trọng, bắt mắt & mượt mà) */}
              {step === "wishes" && (
                <div className="relative z-10 p-4 sm:p-6 text-center space-y-3.5">
                  {/* Greeting Card with smooth Framer Motion spring transition */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={greetingIndex}
                      initial={{ opacity: 0, x: 28, scale: 0.96 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -28, scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 340, damping: 26 }}
                      className="relative rounded-3xl border-2 border-rose-200/90 bg-gradient-to-b from-white/95 via-rose-50/40 to-pink-50/60 backdrop-blur-md p-5 sm:p-6 shadow-[0_12px_32px_rgba(244,63,94,0.14)] min-h-[17.5rem] flex flex-col justify-between overflow-hidden"
                    >
                      {/* Watermark Quote & Corner Decorative accents */}
                      <span
                        className="pointer-events-none absolute -top-4 left-3 text-7xl font-serif text-rose-300/25 select-none leading-none"
                        aria-hidden="true"
                      >
                        “
                      </span>
                      <span
                        className="pointer-events-none absolute -bottom-3 -right-2 text-5xl opacity-15 select-none"
                        aria-hidden="true"
                      >
                        🌸
                      </span>
                      <span
                        className="pointer-events-none absolute top-3.5 right-4 text-xs text-amber-400 animate-pulse select-none"
                        aria-hidden="true"
                      >
                        ✨
                      </span>

                      {/* Card Header: Category Tag & Step indicator */}
                      <div className="relative z-10 flex items-center justify-between pb-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300/70 bg-white/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-rose-700 shadow-2xs">
                          <span>{currentGreeting.icon}</span>
                          <span>{currentGreeting.tag}</span>
                        </span>
                        <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-black text-rose-700">
                          {greetingIndex + 1}/{GREETINGS.length}
                        </span>
                      </div>

                      {/* Thematic Animated Icon Badge */}
                      <div className="relative z-10 my-1">
                        <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 via-pink-100 to-amber-50 border-2 border-white text-3xl shadow-md transition-transform duration-300 hover:scale-110">
                          <span className="drop-shadow-xs">{currentGreeting.icon}</span>
                        </div>
                      </div>

                      {/* Card Title */}
                      <h3
                        className={`relative z-10 text-base sm:text-lg font-black tracking-tight text-rose-950 transition-all duration-700 ease-out ${
                          fadeStage >= 1
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-2"
                        }`}
                      >
                        {currentGreeting.title}
                      </h3>

                      {/* Card Letter Content */}
                      <div className="relative z-10 my-2 rounded-2xl bg-white/80 border border-rose-200/60 p-3 sm:p-3.5 shadow-2xs text-left sm:text-center space-y-2">
                        <p
                          className={`text-xs sm:text-sm leading-relaxed text-slate-700 font-medium transition-all duration-700 ease-out ${
                            fadeStage >= 2
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 translate-y-2"
                          }`}
                        >
                          {currentGreeting.lines[0]}
                        </p>
                        <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
                        <p
                          className={`text-xs sm:text-sm leading-relaxed text-slate-700 font-medium transition-all duration-700 ease-out ${
                            fadeStage >= 3
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 translate-y-2"
                          }`}
                        >
                          {currentGreeting.lines[1]}
                        </p>
                      </div>

                      {/* Highlight Badge */}
                      <div className="relative z-10 min-h-[2.2rem] flex items-center justify-center pt-0.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-rose-300/50 transition-all duration-700 ease-out ${
                            fadeStage >= 4
                              ? "opacity-100 scale-100"
                              : "opacity-0 scale-95"
                          }`}
                        >
                          <span>✨</span>
                          <span>{currentGreeting.highlight}</span>
                          <span>✨</span>
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Progress Dots Indicator & Interactive Navigation */}
                  <div className="pt-1 space-y-3">
                    {/* Modern 6-Step Pill Dots */}
                    <div className="flex items-center justify-center gap-1.5" aria-label="Danh sách thiệp chúc">
                      {GREETINGS.map((g, idx) => {
                        const isActive = idx === greetingIndex;
                        const isVisited = idx < greetingIndex;
                        return (
                          <button
                            key={g.tag}
                            type="button"
                            onClick={() => handleJumpGreeting(idx)}
                            aria-label={`Xem thiệp ${idx + 1}`}
                            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                              isActive
                                ? "w-7 bg-gradient-to-r from-rose-500 to-pink-500 shadow-xs"
                                : isVisited
                                ? "w-2.5 bg-rose-300/90 hover:bg-rose-400"
                                : "w-2 bg-rose-200/70 hover:bg-rose-300"
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Navigation Buttons: Previous / Next / Finish */}
                    <div className="flex items-center gap-2">
                      {greetingIndex > 0 && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={handlePrevGreeting}
                          className="flex items-center justify-center gap-1 rounded-xl border border-rose-200 bg-white/90 px-3.5 py-2.5 text-xs font-bold text-rose-700 shadow-2xs hover:bg-rose-50 cursor-pointer touch-manipulation transition-colors"
                        >
                          <span aria-hidden="true">←</span>
                          <span>Trước</span>
                        </motion.button>
                      )}

                      {!isLastGreeting ? (
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.96 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          type="button"
                          onClick={handleNextGreeting}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 px-4 py-3 font-bold text-white shadow-sm shadow-rose-400/30 cursor-pointer touch-manipulation hover:brightness-105 transition-all text-sm"
                        >
                          <span>Giở thiệp tiếp theo ({greetingIndex + 1}/6)</span>
                          <span aria-hidden="true">➔</span>
                        </motion.button>
                      ) : (
                        /* At 6/6: ONLY show close button after lines have faded in */
                        canExit && (
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            type="button"
                            onClick={handleCloseAndClaim}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 px-4 py-3 text-sm font-black text-white shadow-md shadow-rose-500/30 cursor-pointer touch-manipulation hover:brightness-105 transition-all"
                          >
                            <span>Đóng thiệp chúc (Cảm ơn Hanu Hungry! 💕)</span>
                          </motion.button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Top-Right Close Button: ONLY visible when canExit is true */}
              {canExit && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  type="button"
                  onClick={handleCloseAndClaim}
                  aria-label="Đóng hộp quà"
                  className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 cursor-pointer touch-manipulation hover:scale-105"
                >
                  ✕
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
