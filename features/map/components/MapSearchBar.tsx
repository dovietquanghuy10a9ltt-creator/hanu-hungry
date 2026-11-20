"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Compass, MapPin, ChevronDown, Check } from "lucide-react";
import { POPULAR_ALLEY_FILTERS } from "../constants";

interface MapSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeAlley: string;
  onAlleyChange: (alley: string) => void;
  totalFiltered: number;
  onResetCenter: () => void;
}

export function MapSearchBar({
  searchQuery,
  onSearchChange,
  activeAlley,
  onAlleyChange,
  totalFiltered,
  onResetCenter,
}: MapSearchBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi bấm ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 pointer-events-auto">
      {/* Search Input Bar */}
      <div className="flex items-center gap-2 rounded-2xl border-2 border-[#d2bca3] bg-[#fffdf8]/95 backdrop-blur-md p-2 sm:p-2.5 shadow-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm quán, bún bò, cơm sườn, trà sữa..."
            className="w-full rounded-xl bg-white border border-[#e5d7d2] pl-9 pr-8 py-2 text-xs sm:text-sm text-[var(--color-ink)] placeholder:text-stone-400 focus:outline-none focus:border-[var(--color-red)] focus:ring-1 focus:ring-[var(--color-red)]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer p-0.5"
              aria-label="Xóa tìm kiếm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Nút về Cổng trường HANU */}
        <button
          type="button"
          onClick={onResetCenter}
          title="Về cổng trường HANU"
          className="flex items-center gap-1.5 shrink-0 px-3 py-2 rounded-xl bg-[var(--color-pale)] border border-[#d2bca3] text-[var(--color-ink)] hover:bg-[#eae1d5] active:scale-95 text-xs font-bold transition cursor-pointer select-none shadow-xs"
        >
          <Compass className="h-4 w-4 text-[var(--color-red)]" />
          <span className="hidden sm:inline">Về HANU</span>
        </button>

        {/* Count Badge */}
        <div className="shrink-0 px-2.5 py-1.5 rounded-xl bg-[var(--color-red)] text-white text-xs font-black select-none">
          {totalFiltered} quán
        </div>
      </div>

      {/* Alley Filter Dropdown (Thanh đổ xuống chọn ngõ, mặc định là Tất cả) */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-[#fffdf8]/95 backdrop-blur-md border border-[#d2bca3] shadow-xs text-xs font-bold text-[var(--color-ink)] hover:bg-[#faf6f0] transition cursor-pointer select-none"
        >
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 text-[var(--color-red)] shrink-0" />
            <span className="text-stone-500 font-medium">Khu vực:</span>
            <span className="text-[var(--color-red)] font-black">{activeAlley}</span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-stone-500 transition-transform duration-200 shrink-0 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 py-1.5 rounded-2xl bg-[#fffdf8] border-2 border-[#d2bca3] shadow-xl z-50 max-h-64 overflow-y-auto no-scrollbar">
            {POPULAR_ALLEY_FILTERS.map((alley) => {
              const isSelected = activeAlley === alley;
              return (
                <button
                  key={alley}
                  type="button"
                  onClick={() => {
                    onAlleyChange(alley);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition text-left cursor-pointer ${
                    isSelected
                      ? "bg-red-50 text-[var(--color-red)]"
                      : "text-stone-700 hover:bg-[#f7f2ea] hover:text-[var(--color-ink)]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{alley === "Tất cả" ? "🏠" : "📍"}</span>
                    <span>{alley}</span>
                    {alley === "Tất cả" && (
                      <span className="text-[10px] font-medium text-stone-400">
                        (Mặc định)
                      </span>
                    )}
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[var(--color-red)]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
