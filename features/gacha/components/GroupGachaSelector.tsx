"use client";

import { useState, useMemo } from "react";
import { Search, X, Plus, Sparkles, Check } from "lucide-react";
import type { CatalogRestaurant } from "@/features/restaurants/search";

interface GroupGachaSelectorProps {
  catalog: CatalogRestaurant[];
  selectedRestaurants: CatalogRestaurant[];
  onToggleRestaurant: (restaurant: CatalogRestaurant) => void;
  onClearAll: () => void;
  disabled?: boolean;
}

const POPULAR_RESTAURANT_NAMES = [
  "Hanu Chicken",
  "Bún bò Huế 18",
  "Cơm gà Tố Uyên",
  "Bánh mì anh Tuấn",
  "Sinh viên quán",
  "Malatang",
  "Linh Kute",
  "The Faen",
  "Bún cá Hoàn Tà Lồ",
];

export function GroupGachaSelector({
  catalog,
  selectedRestaurants,
  onToggleRestaurant,
  onClearAll,
  disabled = false,
}: GroupGachaSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const selectedIds = useMemo(
    () => new Set(selectedRestaurants.map((r) => r.id)),
    [selectedRestaurants]
  );

  // Search filtered list
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const lower = searchTerm.toLowerCase().trim();
    return catalog
      .filter((r) => r.name.toLowerCase().includes(lower))
      .slice(0, 6);
  }, [catalog, searchTerm]);

  // Suggested popular restaurants
  const popularRestaurants = useMemo(() => {
    return catalog.filter((r) =>
      POPULAR_RESTAURANT_NAMES.some((name) =>
        r.name.toLowerCase().includes(name.toLowerCase())
      )
    );
  }, [catalog]);

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 rounded-3xl border-2 border-[#d2bca3] bg-[#fffdf8] p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--color-line)] pb-3">
        <div>
          <h3 className="font-heading text-base sm:text-lg font-black text-[var(--color-ink)] flex items-center gap-2">
            <span>👥</span> Chọn quán cả nhóm đang phân vân
          </h3>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">
            Chọn từ 2 đến 8 quán để vũ trụ chốt 1 quán công bằng cho cả bàn!
          </p>
        </div>
        {selectedRestaurants.length > 0 && !disabled && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-bold text-[var(--color-red)] hover:underline cursor-pointer shrink-0"
          >
            Xóa hết
          </button>
        )}
      </div>

      {/* Selected chips bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[var(--color-ink)]">
          <span>Quán trong danh sách quay:</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
              selectedRestaurants.length >= 2
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {selectedRestaurants.length}/8 quán {selectedRestaurants.length < 2 && "(cần thêm)"}
          </span>
        </div>

        {selectedRestaurants.length > 0 ? (
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
            {selectedRestaurants.map((restaurant) => (
              <span
                key={restaurant.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-red)] bg-[var(--color-pale)] px-3 py-1 text-xs font-bold text-[var(--color-red)] animate-fadeIn shadow-xs"
              >
                <span>📍 {restaurant.name}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => onToggleRestaurant(restaurant)}
                    aria-label={`Xóa ${restaurant.name}`}
                    className="hover:opacity-70 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </span>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-[#e6d8c8] py-4 text-center text-xs text-[var(--color-muted)]">
            Chưa có quán nào. Hãy gõ tên quán bên dưới hoặc bấm các quán gợi ý nhanh!
          </div>
        )}
      </div>

      {/* Search Input */}
      {!disabled && selectedRestaurants.length < 8 && (
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-[var(--color-muted)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Gõ tên quán quanh HANU để thêm vào..."
              className="w-full rounded-2xl border-2 border-[#d2bca3] bg-white py-2.5 pl-10 pr-9 text-xs sm:text-sm font-semibold text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-red)] focus:outline-hidden"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Results */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-20 rounded-2xl border-2 border-[#d2bca3] bg-white p-1.5 shadow-lg">
              {searchResults.map((restaurant) => {
                const isSelected = selectedIds.has(restaurant.id);
                return (
                  <button
                    key={restaurant.id}
                    type="button"
                    onClick={() => {
                      onToggleRestaurant(restaurant);
                      setSearchTerm("");
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs sm:text-sm font-bold hover:bg-[#faf7ef] transition cursor-pointer"
                  >
                    <span className="truncate">{restaurant.name}</span>
                    {isSelected ? (
                      <span className="text-xs text-emerald-600 flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Đã chọn
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--color-red)] flex items-center gap-1">
                        <Plus className="h-3.5 w-3.5" /> Thêm
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Quick Suggestion Chips */}
      {!disabled && selectedRestaurants.length < 8 && (
        <div className="space-y-1.5 pt-1">
          <p className="text-[11px] font-bold text-[var(--color-muted)] flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> Quán hot quanh trường (bấm để thêm nhanh):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {popularRestaurants.map((restaurant) => {
              const isSelected = selectedIds.has(restaurant.id);
              return (
                <button
                  key={restaurant.id}
                  type="button"
                  onClick={() => onToggleRestaurant(restaurant)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : "border-[#d8c8b4] bg-[#faf7ef] text-[var(--color-ink)] hover:border-[var(--color-red)]"
                  }`}
                >
                  {isSelected ? <Check className="h-3 w-3 text-emerald-600" /> : <Plus className="h-3 w-3 text-[var(--color-muted)]" />}
                  <span>{restaurant.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
