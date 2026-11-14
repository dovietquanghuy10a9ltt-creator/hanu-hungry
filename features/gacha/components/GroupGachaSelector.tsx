"use client";

import { useState, useMemo } from "react";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import type { CatalogRestaurant } from "@/features/restaurants/search";

export type GroupLimit = 3 | 5 | 7 | 10;

interface GroupGachaSelectorProps {
  catalog: CatalogRestaurant[];
  selectedRestaurants: CatalogRestaurant[];
  maxLimit: GroupLimit;
  onLimitChange: (limit: GroupLimit) => void;
  onToggleRestaurant: (restaurant: CatalogRestaurant) => void;
  onClearAll: () => void;
  disabled?: boolean;
  isOpen?: boolean;
  onToggleOpen?: (open: boolean) => void;
}

export function GroupGachaSelector({
  catalog,
  selectedRestaurants,
  maxLimit,
  onLimitChange,
  onToggleRestaurant,
  onClearAll,
  disabled = false,
  isOpen: externalIsOpen,
  onToggleOpen,
}: GroupGachaSelectorProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalOpen;
  const setIsOpen = (open: boolean) => {
    setInternalOpen(open);
    onToggleOpen?.(open);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const selectedIds = useMemo(
    () => new Set(selectedRestaurants.map((r) => r.id)),
    [selectedRestaurants]
  );

  const isMaxReached = selectedRestaurants.length >= maxLimit;

  // Filter and sort: strictly fixed alphabetical A-Z order
  const displayRestaurants = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const list = term
      ? catalog.filter(
          (r) =>
            r.name.toLowerCase().includes(term) ||
            (r.area && r.area.toLowerCase().includes(term))
        )
      : catalog;

    return [...list].sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }, [catalog, searchTerm]);

  // Collapsed state: neat, single-row card that leaves full view for ticket and roll button
  if (!isOpen) {
    return (
      <div className="w-full max-w-xl mx-auto">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl border-2 border-[#d2bca3] bg-[#fffdf8] shadow-xs cursor-pointer hover:bg-white active:scale-[0.99] transition select-none"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base sm:text-lg">👥</span>
            <span className="font-heading font-black text-xs sm:text-sm text-[var(--color-ink)] truncate">
              Danh sách quán nhóm
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-black shrink-0 ${
                isMaxReached
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {selectedRestaurants.length}/{maxLimit}
            </span>
          </div>
          <span className="text-xs font-bold text-[var(--color-red)] flex items-center gap-1 shrink-0">
            <span>Chọn / Đổi quán</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </span>
        </button>
      </div>
    );
  }

  // Expanded state: form to configure candidates
  return (
    <div className="w-full max-w-xl mx-auto space-y-3 rounded-3xl border-2 border-[#d2bca3] bg-[#fffdf8] p-3.5 sm:p-5 shadow-sm animate-fadeIn">
      {/* Target limit dropdown & Collapse button */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--color-line)] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--color-ink)]">
            Số lượng:
          </span>
          <select
            value={maxLimit}
            disabled={disabled}
            onChange={(e) => onLimitChange(Number(e.target.value) as GroupLimit)}
            className="rounded-xl border border-[#d2bca3] bg-white px-2.5 py-1 text-xs font-bold text-[var(--color-ink)] focus:outline-hidden focus:border-[var(--color-red)] cursor-pointer"
          >
            <option value={3}>3 quán</option>
            <option value={5}>5 quán</option>
            <option value={7}>7 quán</option>
            <option value={10}>10 quán</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-black ${
              isMaxReached
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {selectedRestaurants.length}/{maxLimit}
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-xs font-bold text-[var(--color-red)] hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <span>Thu gọn</span>
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Collapsible Accordion: Danh sách đã chọn */}
      <div className="rounded-2xl border border-[#d2bca3] bg-white overflow-hidden shadow-2xs">
        <div className="flex items-center justify-between px-3 py-2">
          <button
            type="button"
            onClick={() => setIsAccordionOpen((prev) => !prev)}
            className="flex items-center gap-2 text-xs font-bold text-[var(--color-ink)] cursor-pointer"
          >
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                isMaxReached
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {selectedRestaurants.length}/{maxLimit}
            </span>
            <span className="text-[var(--color-red)] flex items-center gap-1 text-[11px] font-bold">
              {isAccordionOpen ? "Thu gọn danh sách" : "Xem danh sách đã chọn"}
              {isAccordionOpen ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </span>
          </button>
          {selectedRestaurants.length > 0 && !disabled && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs font-bold text-[var(--color-muted)] hover:text-[var(--color-red)] cursor-pointer"
            >
              Xóa hết
            </button>
          )}
        </div>

        {isAccordionOpen && (
          <div className="border-t border-[#f2e7db] p-2.5 bg-[#fffdf8] animate-fadeIn">
            {selectedRestaurants.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-0.5">
                {selectedRestaurants.map((restaurant) => (
                  <span
                    key={restaurant.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-red)] bg-[var(--color-pale)] px-3 py-1 text-xs font-bold text-[var(--color-red)] shadow-2xs"
                  >
                    <span>{restaurant.name}</span>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => onToggleRestaurant(restaurant)}
                        aria-label={`Bỏ chọn ${restaurant.name}`}
                        className="hover:opacity-70 cursor-pointer shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--color-muted)] text-center py-2">
                Chưa có quán nào được tick chọn. Hãy tick bên dưới nhé!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted)] pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="VD: Nem nướng Nha Trang Hồng Nhung..."
          className="w-full rounded-2xl border-2 border-[#d2bca3] bg-white py-2 pl-10 pr-9 text-xs sm:text-sm font-semibold text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-red)] focus:outline-hidden"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            aria-label="Xóa từ khóa tìm kiếm"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-ink)] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Checkbox List */}
      <div className="max-h-64 sm:max-h-72 overflow-y-auto rounded-2xl border-2 border-[#e6d8c8] bg-white divide-y divide-[#f2e7db] overscroll-contain shadow-inner">
        {displayRestaurants.length > 0 ? (
          displayRestaurants.map((restaurant) => {
            const isChecked = selectedIds.has(restaurant.id);
            const isRowDisabled = disabled || (!isChecked && isMaxReached);

            return (
              <label
                key={restaurant.id}
                className={`flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs sm:text-sm transition select-none ${
                  isRowDisabled
                    ? "opacity-35 cursor-not-allowed bg-stone-50"
                    : isChecked
                    ? "bg-[var(--color-pale)] text-[var(--color-red)] font-bold cursor-pointer"
                    : "text-[var(--color-ink)] hover:bg-[#fff9f2] cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isRowDisabled}
                    onChange={() => onToggleRestaurant(restaurant)}
                    className="h-4 w-4 rounded-md border-2 border-[#d2bca3] text-[var(--color-red)] focus:ring-[var(--color-red)] cursor-pointer shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-xs sm:text-sm">
                      {restaurant.name}
                    </p>
                    <p className="text-[11px] text-[var(--color-muted)] truncate">
                      {restaurant.area || restaurant.address_text || "Quanh HANU"}
                      {restaurant.categories && restaurant.categories.length > 0 && (
                        <span> • {restaurant.categories.slice(0, 2).join(", ")}</span>
                      )}
                    </p>
                  </div>
                </div>
              </label>
            );
          })
        ) : (
          <div className="py-6 text-center text-xs text-[var(--color-muted)]">
            Không tìm thấy quán nào khớp với từ khóa &ldquo;{searchTerm}&rdquo;.
          </div>
        )}
      </div>

      {/* Bottom Button to Collapse and Ready to Roll */}
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className={`w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99] ${
          isMaxReached
            ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 shadow-xs"
            : "bg-[var(--color-pale)] text-[var(--color-red)] border-[var(--color-red)]/30 hover:bg-[#faebd7]"
        }`}
      >
        <span>
          {isMaxReached
            ? `✓ Đã chọn đủ ${maxLimit}/${maxLimit} quán — Thu gọn để quay`
            : `Thu gọn (còn thiếu ${maxLimit - selectedRestaurants.length} quán)`}
        </span>
        <ChevronUp className="h-4 w-4" />
      </button>
    </div>
  );
}
