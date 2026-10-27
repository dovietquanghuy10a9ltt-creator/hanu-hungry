import test from "node:test";
import assert from "node:assert/strict";
import { normalizeVercelReferrers } from "../lib/analytics/vercel.ts";

test("normalizeVercelReferrers handles empty, invalid or null inputs safely", () => {
  assert.deepEqual(normalizeVercelReferrers([], 100), []);
  assert.deepEqual(normalizeVercelReferrers(null, 100), []);
  assert.deepEqual(normalizeVercelReferrers(undefined, 0), []);
});

test("normalizeVercelReferrers parses, sorts and calculates percentages correctly", () => {
  const mockApiData = [
    { key: "google.com", total: 30 },
    { key: "facebook.com", total: 73 },
    { key: "l.threads.com", total: 384 },
    { key: "bing.com", total: 2 },
    { key: "", total: 51 }, // Empty referrer -> Direct
  ];

  const totalVisitors = 540;
  const result = normalizeVercelReferrers(mockApiData, totalVisitors);

  // 1. Should have 5 items
  assert.equal(result.length, 5);

  // 2. Should be sorted descending by visitors
  assert.equal(result[0].referrer, "l.threads.com");
  assert.equal(result[0].visitors, 384);
  assert.equal(result[0].percent, 71); // 384 / 540 = 71.1% -> 71%

  assert.equal(result[1].referrer, "facebook.com");
  assert.equal(result[1].visitors, 73);
  assert.equal(result[1].percent, 14); // 73 / 540 = 13.5% -> 14%

  assert.equal(result[2].referrer, "Direct / Truy cập trực tiếp");
  assert.equal(result[2].visitors, 51);

  assert.equal(result[3].referrer, "google.com");
  assert.equal(result[3].visitors, 30);
  assert.equal(result[3].percent, 6);

  assert.equal(result[4].referrer, "bing.com");
  assert.equal(result[4].visitors, 2);
  assert.equal(result[4].percent, 0); // 2 / 540 = 0.37% -> 0%
});

test("normalizeVercelReferrers calculates percentages based on sum if total is 0", () => {
  const mockRows = [
    { referrer: "threads.net", visitors: 80 },
    { referrer: "tiktok.com", visitors: 20 },
  ];

  const result = normalizeVercelReferrers(mockRows, 0);
  assert.equal(result.length, 2);
  assert.equal(result[0].referrer, "threads.net");
  assert.equal(result[0].percent, 80); // 80 / 100 = 80%
  assert.equal(result[1].referrer, "tiktok.com");
  assert.equal(result[1].percent, 20); // 20 / 100 = 20%
});
