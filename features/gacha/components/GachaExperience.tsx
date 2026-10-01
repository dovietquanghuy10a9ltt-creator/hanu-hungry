"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { rollGacha, type GachaResult } from "@/features/gacha/actions";
import { formatPrice, formatVnd } from "@/features/restaurants/format";

export function GachaExperience({ restaurantNames, dishNames, initialMode }: { restaurantNames: string[]; dishNames: string[]; initialMode: "restaurant" | "dish" }) {
  const [mode, setMode] = useState(initialMode);
  const [phase, setPhase] = useState<"idle" | "rolling" | "result">("idle");
  const [result, setResult] = useState<GachaResult | null>(null);
  const [error, setError] = useState("");
  const [reelName, setReelName] = useState("Một bất ngờ đang chờ");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; if (timer.current) clearTimeout(timer.current); }; }, []);

  async function roll() {
    if (phase === "rolling") return;
    setPhase("rolling"); setResult(null); setError("");
    const names = mode === "dish" ? dishNames : restaurantNames;
    const started = Date.now();
    let index = 0;
    const tick = () => {
      if (!mounted.current) return;
      setReelName(names[index++ % Math.max(names.length, 1)] || "Đang tìm lựa chọn…");
      const elapsed = Date.now() - started;
      timer.current = setTimeout(tick, elapsed > 1500 ? 220 : 75);
    };
    tick();
    try {
      const [response] = await Promise.all([rollGacha(mode), new Promise((resolve) => setTimeout(resolve, 2600))]);
      if (!mounted.current) return;
      if (timer.current) clearTimeout(timer.current);
      setResult(response.result); setError(response.error || ""); setPhase(response.result ? "result" : "idle");
    } catch {
      if (!mounted.current) return;
      if (timer.current) clearTimeout(timer.current);
      setError("Chưa nhận được tín hiệu. Bạn thử quay lại nhé."); setPhase("idle");
    }
  }
  function changeMode(next: "restaurant" | "dish") { setMode(next); setPhase("idle"); setResult(null); setError(""); }
  return <div className="gacha-experience">
    <div className="gacha-mode" aria-label="Chế độ Gacha"><button type="button" aria-pressed={mode === "restaurant"} disabled={phase === "rolling"} className={mode === "restaurant" ? "is-active" : ""} onClick={() => changeMode("restaurant")}>Chọn quán</button><button type="button" aria-pressed={mode === "dish"} disabled={phase === "rolling"} className={mode === "dish" ? "is-active" : ""} onClick={() => changeMode("dish")}>Chọn món</button></div>
    <div className={`cosmic-stage ${phase}`} aria-busy={phase === "rolling"}>
      <span className="cosmic-star star-one" aria-hidden="true">✦</span><span className="cosmic-star star-two" aria-hidden="true">✧</span><span className="cosmic-star star-three" aria-hidden="true">✳</span>
      <div className="orbit orbit-one" aria-hidden="true" /><div className="orbit orbit-two" aria-hidden="true" />
      <div className="gacha-ticket">
        <div className="ticket-top"><span>HANU HUNGRY</span><span>LUCKY PICK / {mode === "dish" ? "MÓN" : "QUÁN"}</span></div>
        {phase === "result" && result ? <div className="gacha-reveal">
          {result.restaurant.image_url && <div className="relative mb-5 aspect-[16/8] overflow-hidden rounded-lg"><Image src={result.restaurant.image_url} alt={`Không gian ${result.restaurant.name}`} fill className="object-cover" sizes="(max-width: 640px) 90vw, 460px" unoptimized /></div>}
          <p className="eyebrow">Vũ trụ chọn cho bạn</p><h2 className="mt-3 break-words text-3xl leading-tight sm:text-4xl">{result.dish?.name || result.restaurant.name}</h2>
          {result.dish && <p className="mt-3 text-[var(--color-muted)]">Tại {result.restaurant.name}</p>}
          <p className="mt-3 text-sm text-[var(--color-muted)]">{result.restaurant.area || result.restaurant.address_text || "Quanh Đại học Hà Nội"}</p>
          <p className="mt-5 text-lg text-[var(--color-red)]">{result.dish ? formatPrice(result.dish.price_text, result.dish.price_min_vnd, result.dish.price_max_vnd) : result.restaurant.min_price_vnd === null ? "Giá đang cập nhật" : `Từ ${formatVnd(result.restaurant.min_price_vnd)}`}</p>
          <Link className="button button-outline mt-5" href={`/restaurants/${result.restaurant.id}`}>Ghé xem quán <span aria-hidden="true">↗</span></Link>
        </div> : <div className="reel-window"><div className={`reel-symbol ${phase === "rolling" ? "is-spinning" : ""}`} aria-hidden="true">✦</div><p className={`reel-name ${phase === "rolling" ? "is-rolling" : ""}`} aria-hidden={phase === "rolling"}>{phase === "rolling" ? reelName : "Hôm nay, để vũ trụ chọn."}</p><p className="mt-3 text-sm text-[var(--color-muted)]">{phase === "rolling" ? "Một chút hồi hộp trước khi gặp món hợp duyên…" : "Bấm quay. Đón một chiếc hẹn ăn uống bất ngờ."}</p></div>}
        <div className="ticket-bottom" aria-hidden="true"><span>FROM HANU, WITH APPETITE</span><span>✦ ✦ ✦</span></div>
      </div>
    </div>
    <div className="gacha-controls"><button className="button button-primary gacha-roll" onClick={roll} disabled={phase === "rolling"}><span aria-hidden="true" className={phase === "rolling" ? "spin-small" : ""}>✳</span>{phase === "rolling" ? "Đang bắt tín hiệu…" : phase === "result" ? "Quay thêm một lần" : "Quay một vòng"}<span aria-hidden="true">↗</span></button><p className="mt-3 text-xs text-[var(--color-muted)]">{phase === "result" ? "Hợp duyên thì ghé. Chưa hợp thì quay tiếp." : "Quán thật, món thật. Còn lựa chọn là một bất ngờ."}</p></div>
    <p className="sr-only" role="status" aria-live="polite">{phase === "rolling" ? "Đang quay Gacha. Vui lòng đợi." : result ? `Đã chọn ${result.dish?.name || result.restaurant.name}` : "Sẵn sàng quay Gacha"}</p>
    {error && <p role="alert" className="text-center text-sm text-[var(--color-red)]">{error}</p>}
  </div>;
}
