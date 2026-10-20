"use client";

import { useState } from "react";

export function DonutChart({
  items,
  total,
  title,
}: {
  items: Array<{ name: string; count: number; percent: number; color: string }>;
  total: number;
  title: string;
}) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const segments = items.map((item, index) => {
    const offsetPercent = items.slice(0, index).reduce((sum, prev) => sum + prev.percent, 0);
    return {
      ...item,
      strokeDasharray: `${(item.percent / 100) * circumference} ${circumference}`,
      strokeDashoffset: -((offsetPercent / 100) * circumference),
    };
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-around p-2">
      <div className="relative flex shrink-0 items-center justify-center">
        <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="transparent"
            stroke="#f2ebe2"
            strokeWidth="24"
          />
          {segments.map((segment, idx) => (
            <circle
              key={idx}
              cx="90"
              cy="90"
              r={radius}
              fill="transparent"
              stroke={segment.color}
              strokeWidth="24"
              strokeDasharray={segment.strokeDasharray}
              strokeDashoffset={segment.strokeDashoffset}
              className="transition-all duration-500 hover:opacity-80"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-2xl font-black text-[var(--color-ink)]">{total}</span>
          <span className="text-xs text-[var(--color-muted)] font-medium">lượt</span>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-2.5">
        <h4 className="text-sm font-bold text-[var(--color-muted)] uppercase tracking-wider">{title}</h4>
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate font-medium text-[var(--color-ink)]">{item.name}</span>
              </div>
              <div className="shrink-0 font-bold text-[var(--color-ink)]">
                <span>{item.count}</span>
                <span className="ml-1 text-xs text-[var(--color-muted)] font-normal">({item.percent}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AreaChart({
  data,
}: {
  data: Array<{ label: string; count: number }>;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) return null;

  const max = Math.max(1, ...data.map((d) => d.count));
  const width = 640;
  const height = 200;
  const paddingX = 40;
  const paddingY = 25;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * chartW;
    const y = height - paddingY - (d.count / max) * chartH;
    return { x, y, ...d };
  });

  const linePath = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="w-full">
      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-56 overflow-visible"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b52a34" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#b52a34" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#e6dcd1"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#f0e9df"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Area Fill */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Stroke Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#b52a34"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Point Dots */}
          {points.map((p, idx) => (
            <g key={idx} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === idx ? 6 : 4}
                fill={hoveredIdx === idx ? "#84202a" : "#fff"}
                stroke="#b52a34"
                strokeWidth={hoveredIdx === idx ? 3 : 2}
                className="cursor-pointer transition-all"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Hover Info & X-axis labels */}
      <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-muted)]">
        <span>{data[0]?.label}</span>
        {hoveredIdx !== null && (
          <span className="font-bold text-[var(--color-red)] bg-[var(--color-pale)] px-2.5 py-0.5 rounded-full">
            {data[hoveredIdx].label}: {data[hoveredIdx].count} lượt check-in
          </span>
        )}
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

export function Leaderboard({
  title,
  icon,
  emptyText,
  items,
}: {
  title: string;
  icon: string;
  emptyText: string;
  items: Array<{ id: string; name: string; count: number; sub?: string }>;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-3">
        <h3 className="flex items-center gap-2 text-base font-extrabold text-[var(--color-ink)]">
          <span>{icon}</span> {title}
        </h3>
        <span className="rounded-full bg-[var(--color-pale)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-red)]">
          {items.length} mục
        </span>
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-muted)]">{emptyText}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {/* Podium for Top 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pb-2">
            {items.slice(0, 3).map((item, index) => (
              <div
                key={item.id}
                className={`relative rounded-xl border p-3 flex flex-col justify-between ${
                  index === 0
                    ? "border-amber-300 bg-amber-50/60 shadow-xs"
                    : index === 1
                    ? "border-slate-300 bg-slate-50/60"
                    : "border-orange-200 bg-orange-50/40"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-xl" title={`Hạng ${index + 1}`}>
                    {medals[index]}
                  </span>
                  <span className="font-extrabold text-[var(--color-red)] text-base">
                    {item.count} <span className="text-xs font-medium text-[var(--color-muted)]">lượt</span>
                  </span>
                </div>
                <div className="mt-2 min-w-0">
                  <h4 className="truncate font-bold text-sm text-[var(--color-ink)]" title={item.name}>
                    {item.name}
                  </h4>
                  {item.sub && (
                    <p className="truncate text-xs text-[var(--color-muted)] font-mono">{item.sub}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Remaining items as ranked list */}
          {items.length > 3 && (
            <div className="divide-y divide-[var(--color-line)] border-t border-[var(--color-line)] pt-1 max-h-72 overflow-y-auto">
              {items.slice(3).map((item, index) => {
                const rank = index + 4;
                const percentage = Math.round((item.count / max) * 100);
                return (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="w-6 text-center text-xs font-bold text-[var(--color-muted)]">
                        #{rank}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-[var(--color-ink)]">{item.name}</p>
                        {item.sub && <p className="text-xs text-[var(--color-muted)] font-mono">{item.sub}</p>}
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#f4ebe1]">
                          <div
                            className="h-full rounded-full bg-[var(--color-coral)]"
                            style={{ width: `${Math.max(4, percentage)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 font-bold text-[var(--color-red)] text-right">
                      {item.count} <span className="text-xs font-normal text-[var(--color-muted)]">lượt</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
