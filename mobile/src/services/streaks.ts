/**
 * Thuật toán tính toán chuỗi ngày Check-in theo múi giờ Việt Nam (+07:00).
 * Tái sử dụng chính xác logic từ features/history/stats.ts của hệ thống Web.
 */

export function localDayOrdinal(d: Date): number {
  const vnOffsetMs = 7 * 60 * 60 * 1000;
  const vnDate = new Date(d.getTime() + vnOffsetMs);
  const year = vnDate.getUTCFullYear();
  const month = vnDate.getUTCMonth();
  const day = vnDate.getUTCDate();
  return Math.floor(Date.UTC(year, month, day) / 86400000);
}

export interface HistoryRecord {
  visited_at: string;
}

export function historyStats(records: HistoryRecord[]): {
  currentStreak: number;
  longestStreak: number;
  isTodayCheckedIn: boolean;
} {
  if (!records || records.length === 0) {
    return { currentStreak: 0, longestStreak: 0, isTodayCheckedIn: false };
  }

  const todayOrd = localDayOrdinal(new Date());

  // Tập hợp các ngày (ordinal) duy nhất đã check-in
  const daySet = new Set(
    records.map((r) => localDayOrdinal(new Date(r.visited_at)))
  );
  const isTodayCheckedIn = daySet.has(todayOrd);

  const sortedDays = Array.from(daySet).sort((a, b) => b - a);

  // 1. Tính chuỗi hiện tại (current streak)
  let currentStreak = 0;
  // Điều kiện duy trì: Check-in hôm nay (todayOrd) HOẶC hôm qua (todayOrd - 1)
  if (sortedDays[0] === todayOrd || sortedDays[0] === todayOrd - 1) {
    let expected = sortedDays[0];
    for (const d of sortedDays) {
      if (d === expected) {
        currentStreak += 1;
        expected -= 1;
      } else {
        break;
      }
    }
  }

  // 2. Tính chuỗi kỷ lục (longest streak)
  let longestStreak = 0;
  let running = 0;
  let prev: number | null = null;
  const ascDays = [...sortedDays].reverse();
  for (const d of ascDays) {
    if (prev === null || d === prev + 1) {
      running += 1;
    } else {
      running = 1;
    }
    prev = d;
    if (running > longestStreak) {
      longestStreak = running;
    }
  }

  return {
    currentStreak,
    longestStreak,
    isTodayCheckedIn,
  };
}
