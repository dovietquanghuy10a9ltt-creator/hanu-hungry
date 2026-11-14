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

  return (
    <>
      {/* ================= DESKTOP FLOATING SIDEBAR ================= */}
      <div className="hidden md:flex flex-col absolute left-4 top-24 bottom-6 w-84 z-10 rounded-3xl border-2 border-[#d2bca3] bg-[#fffdf8]/95 backdrop-blur-md shadow-xl overflow-hidden pointer-events-auto">
        <div className="p-3.5 border-b border-[#e5d7d2] bg-white/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🍜</span>
            <span className="font-heading font-black text-sm text-[var(--color-ink)]">
              Danh sách quán ăn ({restaurants.length})
            </span>
          </div>
          <span className="text-xs text-[var(--color-muted)] font-medium">
            Bấm để định vị
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 space-y-2 no-scrollbar">
          {restaurants.length === 0 ? (
            <div className="p-6 text-center text-xs text-stone-500">
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
                      ? "bg-red-50/90 border-[var(--color-red)] shadow-sm scale-[1.01]"
                      : "bg-white border-[#e5d7d2] hover:border-[#c4aa95] hover:bg-stone-50"
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
                        <span className="rounded-md bg-amber-100 text-amber-900 px-1.5 py-0.2 text-[10px] font-black shrink-0">
                          {restaurant.area || "Gần HANU"}
                        </span>
                        <span className="text-[10px] text-stone-500 truncate">
                          {walking.formattedText}
                        </span>
                      </div>
                      <h4 className="font-heading font-black text-xs text-[var(--color-ink)] truncate leading-tight">
                        {restaurant.name}
                      </h4>
                      <p className="text-[11px] font-bold text-emerald-700 mt-0.5">
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

      {/* ================= MOBILE BOTTOM SHEET ================= */}
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
                      ? "bg-red-50/90 border-[var(--color-red)] shadow-sm"
                      : "bg-white border-[#e5d7d2]"
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
                      <span className="rounded-md bg-amber-100 text-amber-900 px-1.5 py-0.2 text-[10px] font-black">
                        {restaurant.area || "Gần HANU"}
                      </span>
                      <span className="text-[10px] text-stone-500 truncate">
                        {walking.formattedText}
                      </span>
                    </div>
                    <h4 className="font-heading font-black text-xs text-[var(--color-ink)] truncate">
                      {restaurant.name}
                    </h4>
                    <p className="text-[11px] font-bold text-emerald-700">
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
                      ? "bg-red-50/90 border-[var(--color-red)] shadow-xs"
                      : "bg-white border-[#e5d7d2]"
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
                      <span className="rounded bg-amber-100 text-amber-900 px-1 py-0.2 text-[9px] font-bold">
                        {restaurant.area || "HANU"}
                      </span>
                      <span className="text-[9px] text-stone-500 truncate">
                        {walking.formattedText}
                      </span>
                    </div>
                    <h5 className="font-heading font-black text-xs text-[var(--color-ink)] truncate leading-tight">
                      {restaurant.name}
                    </h5>
                    <p className="text-[10px] font-bold text-emerald-700">
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
