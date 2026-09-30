export type CheckInForStats = { restaurant_id: string; visited_at: string };

const timezone = "Asia/Ho_Chi_Minh";
const dayMs = 86400000;

export function localDayOrdinal(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const get = (name: string) => Number(parts.find((part) => part.type === name)?.value);
  return Math.floor(Date.UTC(get("year"), get("month") - 1, get("day")) / dayMs);
}

export function historyStats(checkIns: readonly CheckInForStats[], now = new Date()) {
  const dayOrdinals = [...new Set(checkIns.map((item) => localDayOrdinal(new Date(item.visited_at))))].sort((a, b) => a - b);
  const daySet = new Set(dayOrdinals);
  const today = localDayOrdinal(now);
  let cursor = daySet.has(today) ? today : today - 1;
  let currentStreak = 0;
  while (daySet.has(cursor)) { currentStreak++; cursor--; }
  let longestStreak = 0;
  let run = 0;
  for (let i = 0; i < dayOrdinals.length; i++) {
    run = i > 0 && dayOrdinals[i] === dayOrdinals[i - 1] + 1 ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
  }
  const mondayOffset = (new Date(today * dayMs).getUTCDay() + 6) % 7;
  const weekStart = today - mondayOffset;
  const thisWeek = checkIns.filter((item) => localDayOrdinal(new Date(item.visited_at)) >= weekStart);
  return {
    total: checkIns.length,
    currentStreak,
    longestStreak,
    weeklyVisits: thisWeek.length,
    weeklyRestaurants: new Set(thisWeek.map((item) => item.restaurant_id)).size,
  };
}
