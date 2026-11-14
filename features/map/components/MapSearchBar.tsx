"use client";

import { Search, X, Compass } from "lucide-react";
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
          className="flex items-center gap-1 shrink-0 px-2.5 py-2 rounded-xl bg-[var(--color-pale)] border border-[#d2bca3] text-[var(--color-ink)] hover:bg-stone-100 text-xs font-bold transition cursor-pointer select-none"
        >
          <Compass className="h-4 w-4 text-[var(--color-red)]" />
          <span className="hidden sm:inline">Về HANU</span>
        </button>

        {/* Count Badge */}
        <div className="shrink-0 px-2.5 py-1.5 rounded-xl bg-[var(--color-red)] text-white text-xs font-black select-none">
          {totalFiltered} quán
        </div>
      </div>

      {/* Alley Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-0.5">
        {POPULAR_ALLEY_FILTERS.map((alley) => {
          const isActive = activeAlley === alley;
          return (
            <button
              key={alley}
              type="button"
              onClick={() => onAlleyChange(alley)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer select-none border ${
                isActive
                  ? "bg-[var(--color-red)] text-white border-[var(--color-red)] shadow-xs"
                  : "bg-white/95 text-stone-700 border-[#d2bca3] hover:bg-stone-50"
              }`}
            >
              {alley}
            </button>
          );
        })}
      </div>
    </div>
  );
}
