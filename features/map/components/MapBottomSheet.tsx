"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import type { CatalogRestaurant } from "@/features/restaurants/catalog";
import { formatCardPrice } from "@/features/restaurants/format";
import {
  getRestaurantCoordinates,
  calculateWalkingDistance,
} from "../constants";

interface MapBottomSheetProps {
  restaurants: CatalogRestaurant[];
  selectedRestaurantId: string | null;
  onSelectRestaurant: (restaurant: CatalogRestaurant) => void;
}

export function MapBottomSheet({
  restaurants,
  selectedRestaurantId,
  onSelectRestaurant,
}: MapBottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  return (
    <>
      {/* ================= DESKTOP FLOATING SIDEBAR (COLLAPSIBLE) ================= */}
      <div className="hidden md:block absolute left-4 top-24 z-10 pointer-events-auto">
        {isDesktopCollapsed ? (
          /* Nút mở danh sách khi đã thu gọn */
          <button
            type="button"
            onClick={() => setIsDesktopCollapsed(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-[#d2bca3] bg-[#fffdf8]/95 backdrop-blur-md shadow-lg text-xs font-black text-[var(--color-ink)] hover:bg-[#f7f2ea] transition cursor-pointer select-none animate-in fade-in zoom-in-95 duration-150"
            title="Mở danh sách quán ăn"
          >
            <span>🍜</span>
            <span>Danh sách quán ({restaurants.length})</span>
            <ChevronDown className="h-4 w-4 text-[var(--color-red)]" />
          </button>
        ) : (
          /* Hộp danh sách mở rộng */
          <div className="flex flex-col h-[calc(100vh-140px)] w-84 rounded-3xl border-2 border-[#d2bca3] bg-[#fffdf8]/98 backdrop-blur-md shadow-xl overflow-hidden animate-in fade-in duration-150">
            {/* Header có nút thu gọn */}
            <div className="p-3 border-b border-[#e5d7d2] bg-[#fbf7f0] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🍜</span>
                <span className="font-heading font-black text-xs text-[var(--color-ink)]">
                  Danh sách quán ({restaurants.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsDesktopCollapsed(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-stone-500 hover:text-[var(--color-ink)] hover:bg-stone-200/60 transition cursor-pointer"
                title="Thu gọn để xem toàn bản đồ"
              >
                <span>Thu gọn</span>
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2 no-scrollbar">
              {restaurants.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-500">
                  Không tìm thấy quán nào theo bộ lọc này.
                </div>
              ) : (
                restaurants.map((restaurant) => {
                  const isSelected = restaurant.id === selectedRestaurantId;
                  const coords = getRestaurantCoordinates(restaurant);
                  const walking = calculateWalkingDistance(coords);
                  const priceText = formatCardPrice(
                    restaurant.min_price_vnd,
                    restaurant.max_price_vnd
                  );

                  return (
                    <div
                      key={restaurant.id}
                      onClick={() => onSelectRestaurant(restaurant)}
                      className={`p-2.5 rounded-2xl border transition cursor-pointer select-none ${
                        isSelected
                          ? "bg-[#fff9f8] border-[var(--color-red)] ring-1 ring-[var(--color-red)]/30 shadow-xs"
                          : "bg-white border-[#ebdcd0] hover:border-[#c4aa95] hover:bg-[#faf6f0]"
                      }`}
                    >
                      <div className="flex gap-2.5">
                        {restaurant.image_url ? (
                          <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-[#d2bca3]">
                            <Image
                              src={restaurant.image_url}
                              alt={restaurant.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-16 shrink-0 rounded-xl bg-[var(--color-pale)] border border-[#d2bca3] flex items-center justify-center text-2xl">
                            🍜
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="rounded-md bg-[#f4ece1] border border-[#e2d4c5] text-[#4a382c] px-1.5 py-0.2 text-[10px] font-bold shrink-0">
                              {restaurant.area || "Gần HANU"}
                            </span>
                            <span className="text-[10px] text-[#78716c] truncate">
                              {walking.formattedText}
                            </span>
                          </div>
                          <h4 className="font-heading font-black text-xs text-[#1c1917] truncate leading-tight">
                            {restaurant.name}
                          </h4>
                          <p className="text-[11px] font-bold text-[#8c4320] mt-0.5">
                            {priceText}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Link
                              href={`/restaurants/${restaurant.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] font-bold text-[var(--color-red)] hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>Xem chi tiết</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= MOBILE BOTTOM SHEET (COLLAPSIBLE) ================= */}
      <div
        className={`md:hidden absolute left-0 right-0 bottom-0 z-10 rounded-t-3xl border-t-2 border-x-2 border-[#d2bca3] bg-[#fffdf8]/98 backdrop-blur-md shadow-2xl transition-all duration-300 pointer-events-auto ${
          isExpanded ? "h-[70vh]" : "h-36"
        }`}
      >
        {/* Drag Handle & Header */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex flex-col items-center pt-2 pb-1.5 px-4 cursor-pointer select-none"
        >
          <div className="w-10 h-1 rounded-full bg-stone-300 mb-1.5" />
          <div className="w-full flex items-center justify-between">
            <span className="font-heading font-black text-xs text-[var(--color-ink)] flex items-center gap-1.5">
              <span>🍜</span> Quán quanh bạn ({restaurants.length})
            </span>
            <button
              type="button"
              className="text-stone-500 p-0.5 flex items-center gap-0.5 text-xs font-bold"
            >
              <span>{isExpanded ? "Thu gọn" : "Xem thêm"}</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Content View: Horizontal scroll when collapsed, Vertical grid when expanded */}
        {isExpanded ? (
          <div className="h-[calc(70vh-48px)] overflow-y-auto p-3 space-y-2 no-scrollbar">
            {restaurants.map((restaurant) => {
              const isSelected = restaurant.id === selectedRestaurantId;
              const coords = getRestaurantCoordinates(restaurant);
              const walking = calculateWalkingDistance(coords);
              const priceText = formatCardPrice(
                restaurant.min_price_vnd,
                restaurant.max_price_vnd
              );

              return (
                <div
                  key={restaurant.id}
                  onClick={() => {
                    onSelectRestaurant(restaurant);
                    setIsExpanded(false);
                  }}
                  className={`p-2.5 rounded-2xl border transition cursor-pointer select-none flex gap-2.5 ${
                    isSelected
                      ? "bg-[#fff9f8] border-[var(--color-red)] ring-1 ring-[var(--color-red)]/30 shadow-xs"
                      : "bg-white border-[#ebdcd0]"
                  }`}
                >
                  {restaurant.image_url ? (
                    <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-[#d2bca3]">
                      <Image
                        src={restaurant.image_url}
                        alt={restaurant.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-16 shrink-0 rounded-xl bg-[var(--color-pale)] border border-[#d2bca3] flex items-center justify-center text-xl">
                      🍜
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="rounded-md bg-[#f4ece1] border border-[#e2d4c5] text-[#4a382c] px-1.5 py-0.2 text-[10px] font-bold">
                        {restaurant.area || "Gần HANU"}
                      </span>
                      <span className="text-[10px] text-[#78716c] truncate">
                        {walking.formattedText}
                      </span>
                    </div>
                    <h4 className="font-heading font-black text-xs text-[#1c1917] truncate">
                      {restaurant.name}
                    </h4>
                    <p className="text-[11px] font-bold text-[#8c4320]">
                      {priceText}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Link
                        href={`/restaurants/${restaurant.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] font-bold text-[var(--color-red)] hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>Chi tiết ↗</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2.5 overflow-x-auto px-3 py-1 no-scrollbar">
            {restaurants.slice(0, 15).map((restaurant) => {
              const isSelected = restaurant.id === selectedRestaurantId;
              const coords = getRestaurantCoordinates(restaurant);
              const walking = calculateWalkingDistance(coords);
              const priceText = formatCardPrice(
                restaurant.min_price_vnd,
                restaurant.max_price_vnd
              );

              return (
                <div
                  key={restaurant.id}
                  onClick={() => onSelectRestaurant(restaurant)}
                  className={`w-56 shrink-0 p-2 rounded-2xl border transition cursor-pointer select-none flex gap-2 ${
                    isSelected
                      ? "bg-[#fff9f8] border-[var(--color-red)] ring-1 ring-[var(--color-red)]/30 shadow-xs"
                      : "bg-white border-[#ebdcd0]"
                  }`}
                >
                  {restaurant.image_url ? (
                    <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-[#d2bca3]">
                      <Image
                        src={restaurant.image_url}
                        alt={restaurant.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-14 w-14 shrink-0 rounded-xl bg-[var(--color-pale)] border border-[#d2bca3] flex items-center justify-center text-lg">
                      🍜
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="rounded bg-[#f4ece1] border border-[#e2d4c5] text-[#4a382c] px-1 py-0.2 text-[9px] font-bold">
                        {restaurant.area || "HANU"}
                      </span>
                      <span className="text-[9px] text-[#78716c] truncate">
                        {walking.formattedText}
                      </span>
                    </div>
                    <h5 className="font-heading font-black text-xs text-[#1c1917] truncate leading-tight">
                      {restaurant.name}
                    </h5>
                    <p className="text-[10px] font-bold text-[#8c4320]">
                      {priceText}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
