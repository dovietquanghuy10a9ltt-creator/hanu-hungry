"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  Utensils,
  Coffee,
  PartyPopper,
  MapPin,
  Flame,
  CheckCircle2,
  ChevronDown,
  Check,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { rollGacha, type GachaResult } from "@/features/gacha/actions";
import { formatCardPrice, formatPrice, mapsUrl } from "@/features/restaurants/format";
import { isDrinkDish, pickRandom } from "@/features/gacha/random";
import { quickCheckIn } from "@/features/history/actions";
import type { CatalogDish, CatalogRestaurant } from "@/features/restaurants/search";
import type { RestaurantSummary } from "@/features/restaurants/types";

export type GachaMode = "restaurant" | "food" | "drink";

export function GachaExperience({
  restaurantNames,
  foodNames,
  drinkNames,
  initialMode = "restaurant",
  catalog,
}: {
  restaurantNames: string[];
  foodNames: string[];
  drinkNames: string[];
  initialMode?: GachaMode;
  catalog?: CatalogRestaurant[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<GachaMode>(initialMode);
  const [phase, setPhase] = useState<"idle" | "rolling" | "result">("idle");
  const [result, setResult] = useState<GachaResult | null>(null);
  const [error, setError] = useState("");
  const [reelName, setReelName] = useState("Một bất ngờ đang chờ");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [checkedInMap, setCheckedInMap] = useState<Record<string, boolean>>({});
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInToast, setCheckInToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mounted.current = true;
    console.log("[GachaExperience] Mounted successfully with mode:", initialMode);
    return () => {
      mounted.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [initialMode]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isDropdownOpen]);

  function pickClientResult(targetMode: GachaMode): GachaResult | null {
    if (!catalog || catalog.length === 0) return null;

    if (targetMode === "restaurant") {
      const selected = pickRandom(catalog);
      if (!selected) return null;
      const restaurant: RestaurantSummary = {
        id: selected.id,
        name: selected.name,
        area: selected.area,
        address_text: selected.address_text,
        image_url: selected.image_url,
        min_price_vnd: selected.min_price_vnd,
        max_price_vnd: selected.max_price_vnd,
        categories: selected.categories,
      };
      return { restaurant, dish: null };
    }

    if (targetMode === "food") {
      const candidates: { restaurant: CatalogRestaurant; dish: CatalogDish }[] = catalog.flatMap((restaurant) =>
        restaurant.dishes
          .filter((dish) => !isDrinkDish(dish.name, restaurant.category_slugs))
          .map((dish) => ({ restaurant, dish }))
      );
      const selected = pickRandom(candidates);
      if (!selected) return null;
      const restaurant: RestaurantSummary = {
        id: selected.restaurant.id,
        name: selected.restaurant.name,
        area: selected.restaurant.area,
        address_text: selected.restaurant.address_text,
        image_url: selected.restaurant.image_url,
        min_price_vnd: selected.restaurant.min_price_vnd,
        max_price_vnd: selected.restaurant.max_price_vnd,
        categories: selected.restaurant.categories,
      };
      return { restaurant, dish: selected.dish };
    }

    if (targetMode === "drink") {
      const candidates: { restaurant: CatalogRestaurant; dish: CatalogDish }[] = catalog.flatMap((restaurant) =>
        restaurant.dishes
          .filter((dish) => isDrinkDish(dish.name, restaurant.category_slugs))
          .map((dish) => ({ restaurant, dish }))
      );
      const selected = pickRandom(candidates);
      if (!selected) return null;
      const restaurant: RestaurantSummary = {
        id: selected.restaurant.id,
        name: selected.restaurant.name,
        area: selected.restaurant.area,
        address_text: selected.restaurant.address_text,
        image_url: selected.restaurant.image_url,
        min_price_vnd: selected.restaurant.min_price_vnd,
        max_price_vnd: selected.restaurant.max_price_vnd,
        categories: selected.restaurant.categories,
      };
      return { restaurant, dish: selected.dish };
    }

    return null;
  }

  async function roll() {
    if (phase === "rolling") return;
    console.log("[GachaExperience] Roll initiated for mode:", mode);
    setPhase("rolling");
    setResult(null);
    setError("");

    const names = mode === "drink" ? drinkNames : mode === "food" ? foodNames : restaurantNames;
    const started = Date.now();
    let index = 0;

    const tick = () => {
      if (!mounted.current) return;
      setReelName(names[index++ % Math.max(names.length, 1)] || "Đang tìm lựa chọn…");
      const elapsed = Date.now() - started;
      timer.current = setTimeout(tick, elapsed > 1200 ? 180 : 65);
    };
    tick();

    try {
      let chosenResult: GachaResult | null = null;
      let chosenError: string | null = null;

      // Prioritize client in-memory pick for instant reliability and 0 network failures
      if (catalog && catalog.length > 0) {
        chosenResult = pickClientResult(mode);
        if (!chosenResult) chosenError = "Chưa có lựa chọn phù hợp. Thử chế độ khác nhé.";
        // Let the spinning animation run for 1.8 seconds for anticipation
        await new Promise((resolve) => setTimeout(resolve, 1800));
      } else {
        // Fallback to server action
        const [response] = await Promise.all([
          rollGacha(mode),
          new Promise((resolve) => setTimeout(resolve, 2000)),
        ]);
        chosenResult = response.result;
        chosenError = response.error;
      }

      if (!mounted.current) return;
      if (timer.current) clearTimeout(timer.current);

      if (chosenResult) {
        setResult(chosenResult);
        setError("");
        setPhase("result");
      } else {
        setError(chosenError || "Chưa nhận được tín hiệu. Bạn thử quay lại nhé.");
        setPhase("idle");
      }
    } catch (err) {
      console.error("[GachaExperience] Roll error:", err);
      if (!mounted.current) return;
      if (timer.current) clearTimeout(timer.current);
      setError("Chưa nhận được tín hiệu từ vũ trụ. Bạn thử quay lại nhé.");
      setPhase("idle");
    }
  }

  async function handleCheckIn(restaurantId: string) {
    if (isCheckingIn || checkedInMap[restaurantId]) return;
    setIsCheckingIn(true);
    try {
      const res = await quickCheckIn(restaurantId);
      if (res.success) {
        setCheckedInMap((prev) => ({ ...prev, [restaurantId]: true }));
        setCheckInToast(res.message);
        setTimeout(() => setCheckInToast(null), 4000);
      } else {
        alert(res.message);
      }
    } catch {
      router.push(`/login?next=${encodeURIComponent("/gacha")}`);
    } finally {
      setIsCheckingIn(false);
    }
  }

  function renderModeIcon(m: GachaMode, className = "h-5 w-5 shrink-0") {
    if (m === "restaurant") return <Store className={className} />;
    if (m === "drink") return <Coffee className={className} />;
    return <Utensils className={className} />;
  }

  function changeMode(next: GachaMode) {
    if (phase === "rolling") return;
    setMode(next);
    setPhase("idle");
    setResult(null);
    setError("");
  }

  return (
    <div className="gacha-experience">
      <div className="flex justify-center mt-6 mb-3 relative" ref={dropdownRef}>
        <div className="relative inline-block text-left w-64 max-w-full">
          <button
            type="button"
            id="gacha-mode-button"
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            disabled={phase === "rolling"}
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="w-full flex items-center justify-between gap-3 rounded-full border-2 border-[#d2bca3] bg-[#fffdf8] px-4 py-2.5 font-bold text-sm sm:text-base text-[var(--color-ink)] shadow-xs hover:border-[var(--color-red)] focus:border-[var(--color-red)] focus:outline-hidden cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2.5 min-w-0 text-[var(--color-red)]">
              {renderModeIcon(mode)}
              <span className="truncate text-[var(--color-ink)]">
                {mode === "restaurant"
                  ? "Gacha theo quán"
                  : mode === "drink"
                  ? "Gacha theo đồ uống"
                  : "Gacha theo đồ ăn"}
              </span>
            </span>
            <ChevronDown
              className={`h-4 w-4 text-[var(--color-red)] transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          {isDropdownOpen && (
            <div
              role="listbox"
              aria-labelledby="gacha-mode-button"
              className="absolute left-0 right-0 top-full mt-2 z-30 rounded-2xl border-2 border-[#d2bca3] bg-[#fffdf8] p-1.5 shadow-xl animate-fadeIn"
            >
              {(
                [
                  { id: "restaurant", label: "Gacha theo quán" },
                  { id: "food", label: "Gacha theo đồ ăn" },
                  { id: "drink", label: "Gacha theo đồ uống" },
                ] as const
              ).map((m) => {
                const isSelected = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      changeMode(m.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-bold transition cursor-pointer ${
                      isSelected
                        ? "bg-[var(--color-pale)] text-[var(--color-red)]"
                        : "text-[var(--color-ink)] hover:bg-[#f5ece1]"
                    }`}
                  >
                    <span className={isSelected ? "text-[var(--color-red)]" : "text-[var(--color-muted)]"}>
                      {renderModeIcon(m.id)}
                    </span>
                    <span className="flex-1">{m.label}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-[var(--color-red)]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className={`cosmic-stage ${phase}`} aria-busy={phase === "rolling"}>
        <span className="cosmic-star star-one" aria-hidden="true">✦</span>
        <span className="cosmic-star star-two" aria-hidden="true">✧</span>
        <span className="cosmic-star star-three" aria-hidden="true">✳</span>
        <div className="orbit orbit-one" aria-hidden="true" />
        <div className="orbit orbit-two" aria-hidden="true" />

        <div className="gacha-ticket">
          <div className="ticket-top">
            <span>Hanu Hungry</span>
            <span>LUCKY PICK / {mode === "restaurant" ? "QUÁN" : mode === "drink" ? "ĐỒ UỐNG" : "ĐỒ ĂN"}</span>
          </div>

          {phase === "result" && result ? (
            <div className="gacha-reveal">
              {result.restaurant.image_url && (
                <div className="relative mb-5 aspect-[16/8] overflow-hidden rounded-lg">
                  <Image
                    src={result.restaurant.image_url}
                    alt={`Không gian ${result.restaurant.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 90vw, 460px"
                    unoptimized
                  />
                </div>
              )}
              <div className="flex items-center justify-center gap-2">
                <PartyPopper className="h-7 w-7 text-[var(--color-red)] animate-bounce" />
                <p className="eyebrow">Vũ trụ chọn cho bạn</p>
              </div>
              <h2 className="mt-3 break-words text-3xl leading-tight sm:text-4xl">
                {result.dish?.name || result.restaurant.name}
              </h2>
              {result.dish && <p className="mt-3 text-[var(--color-muted)]">Tại {result.restaurant.name}</p>}
              <p className="mt-3 text-sm text-[var(--color-muted)]">
                {result.restaurant.area || result.restaurant.address_text || "Quanh Đại học Hà Nội"}
              </p>
              <p className="mt-5 text-lg text-[var(--color-red)] font-black">
                {result.dish
                  ? formatPrice(result.dish.price_text, result.dish.price_min_vnd, result.dish.price_max_vnd)
                  : formatCardPrice(result.restaurant.min_price_vnd, result.restaurant.max_price_vnd)}
              </p>

              {/* Direct Buttons: Maps, Direct Streak Check-in, View Details */}
              {(() => {
                const mapLink = mapsUrl(result.restaurant);
                return (
                  <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-center">
                    {mapLink && (
                      <a
                        href={mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button button-secondary inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold"
                      >
                        <MapPin className="h-4 w-4 shrink-0 text-[var(--color-red)]" />
                        <span>Chỉ đường Maps ↗</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCheckIn(result.restaurant.id)}
                      disabled={isCheckingIn || checkedInMap[result.restaurant.id]}
                      className={`button inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
                        checkedInMap[result.restaurant.id]
                          ? "bg-emerald-600 text-white hover:bg-emerald-700 cursor-default"
                          : "button-primary"
                      }`}
                    >
                      {isCheckingIn ? (
                        <>
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                          <span>Đang lưu...</span>
                        </>
                      ) : checkedInMap[result.restaurant.id] ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span>Đã chọn hôm nay ✓</span>
                        </>
                      ) : (
                        <>
                          <Flame className="h-4 w-4 shrink-0 fill-amber-300 text-amber-300 animate-pulse" />
                          <span>Chọn quán này</span>
                        </>
                      )}
                    </button>
                    <Link
                      className="button button-outline inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold"
                      href={`/restaurants/${result.restaurant.id}`}
                    >
                      <span>Chi tiết</span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                    </Link>
                  </div>
                );
              })()}

              {checkInToast && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-xs font-bold text-emerald-800 animate-fadeIn">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{checkInToast}</span>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`reel-window ${phase === "idle" ? "cursor-pointer select-none" : ""}`}
              onClick={phase === "idle" ? roll : undefined}
              role={phase === "idle" ? "button" : undefined}
              tabIndex={phase === "idle" ? 0 : undefined}
              onKeyDown={(e) => {
                if (phase === "idle" && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  roll();
                }
              }}
              title={phase === "idle" ? "Bấm vào thẻ để quay" : undefined}
            >
              <div className={`reel-symbol ${phase === "rolling" ? "is-spinning" : ""}`} aria-hidden="true">
                ✦
              </div>
              <p className={`reel-name ${phase === "rolling" ? "is-rolling" : ""}`} aria-hidden={phase === "rolling"}>
                {phase === "rolling" ? reelName : "Hôm nay, để vũ trụ chọn."}
              </p>
              <p className="mt-3 text-sm text-[var(--color-muted)]">
                {phase === "rolling"
                  ? "Một chút hồi hộp trước khi gặp món hợp duyên…"
                  : "Bấm quay. Đón một chiếc hẹn ăn uống bất ngờ."}
              </p>
            </div>
          )}

          <div className="ticket-bottom" aria-hidden="true">
            <span>FROM Hanu, WITH APPETITE</span>
            <span>✦ ✦ ✦</span>
          </div>
        </div>
      </div>

      <div className="gacha-controls">
        <button
          type="button"
          className="button button-primary gacha-roll cursor-pointer shadow-md active:translate-y-0.5 select-none"
          onClick={roll}
          disabled={phase === "rolling"}
        >
          <span aria-hidden="true" className={phase === "rolling" ? "spin-small inline-block" : "inline-block"}>
            ✳
          </span>
          {phase === "rolling" ? "Đang bắt tín hiệu…" : phase === "result" ? "Quay thêm một lần" : "Quay một vòng"}
          <span aria-hidden="true">↗</span>
        </button>
        <p className="mt-3 text-xs text-[var(--color-muted)]">
          {phase === "result"
            ? "Hợp duyên thì ghé. Chưa hợp thì quay tiếp."
            : "Quán thật, món thật. Còn lựa chọn là một bất ngờ."}
        </p>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {phase === "rolling"
          ? "Đang quay Gacha. Vui lòng đợi."
          : result
          ? `Đã chọn ${result.dish?.name || result.restaurant.name}`
          : "Sẵn sàng quay Gacha"}
      </p>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-semibold text-[var(--color-red)] shadow-xs"
        >
          {error}
        </div>
      )}
    </div>
  );
}
