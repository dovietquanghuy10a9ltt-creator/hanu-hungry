import assert from "node:assert/strict";
import test from "node:test";
import { formatPrice, formatVnd, mapsUrl, readableText } from "../features/restaurants/format.ts";
import { historyStats } from "../features/history/stats.ts";
import { pickRandom } from "../features/gacha/random.ts";

test("missing restaurant data stays explicit and never becomes a fake zero price", () => {
  assert.equal(readableText(null), "Thông tin đang được cập nhật");
  assert.equal(readableText("None", "Chưa có dữ liệu vị trí"), "Chưa có dữ liệu vị trí");
  assert.equal(formatVnd(null), "Chưa có dữ liệu giá");
  assert.equal(formatPrice(null, null, null), "Chưa có dữ liệu giá");
  assert.equal(formatPrice("None", null, null), "Chưa có dữ liệu giá");
  assert.equal(formatPrice("30,000 - 50,000", 30000, 50000), "30,000 - 50,000");
});

test("Maps uses real coordinates first, or encoded source location text", () => {
  assert.equal(mapsUrl({ latitude: 20.99, longitude: 105.8, address_text: "Other" }), "https://www.google.com/maps/search/?api=1&query=20.99,105.8");
  assert.equal(mapsUrl({ address_text: "XQPW+WH8 Đại Mỗ, Hà Nội" }), `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("XQPW+WH8 Đại Mỗ, Hà Nội")}`);
  assert.equal(mapsUrl({}), null);
});

test("check-in streak and weekly recap use Vietnam calendar days", () => {
  const now = new Date("2026-09-30T12:00:00Z");
  const entries = [
    { restaurant_id: "a", visited_at: "2026-09-29T18:00:00Z" },
    { restaurant_id: "b", visited_at: "2026-09-28T18:00:00Z" },
    { restaurant_id: "a", visited_at: "2026-09-28T20:00:00Z" },
    { restaurant_id: "c", visited_at: "2026-09-12T03:00:00Z" },
    { restaurant_id: "c", visited_at: "2026-09-11T03:00:00Z" },
    { restaurant_id: "c", visited_at: "2026-09-10T03:00:00Z" },
  ];
  assert.deepEqual(historyStats(entries, now), {
    total: 6,
    currentStreak: 2,
    longestStreak: 3,
    weeklyVisits: 3,
    weeklyRestaurants: 2,
  });
});

test("gacha never invents a choice when the database query is empty", () => {
  assert.equal(pickRandom([]), null);
  assert.equal(pickRandom(["a"]), "a");
});
