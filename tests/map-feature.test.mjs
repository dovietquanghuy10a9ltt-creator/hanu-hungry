import test from "node:test";
import assert from "node:assert/strict";
import {
  getRestaurantCoordinates,
  calculateWalkingDistance,
  HANU_CENTER_COORDS,
  HANU_MAIN_GATE_COORDS,
  HANU_ALLEY_CENTROIDS,
  POPULAR_ALLEY_FILTERS,
} from "../features/map/constants.ts";

test("M01: getRestaurantCoordinates prioritizes genuine coordinates when present in DB", () => {
  const customRestaurant = {
    id: "rest-1",
    name: "Quán thật",
    area: "Ngõ A4",
    latitude: 20.989912,
    longitude: 105.794123,
  };
  const coords = getRestaurantCoordinates(customRestaurant);
  assert.equal(coords.lat, 20.989912);
  assert.equal(coords.lng, 105.794123);
});

test("M02: getRestaurantCoordinates falls back to alley centroid with micro-offset when DB coordinates are null", () => {
  const alleyRestaurant = {
    id: "rest-a4-uuid",
    name: "Quán Ngõ A4",
    area: "Ngõ A4",
    latitude: null,
    longitude: null,
  };
  const coords = getRestaurantCoordinates(alleyRestaurant);
  const baseA4 = HANU_ALLEY_CENTROIDS["Ngõ A4"];

  assert.ok(Number.isFinite(coords.lat));
  assert.ok(Number.isFinite(coords.lng));
  // Offset should be small (within ~0.0005 degrees / ~50 meters of alley centroid)
  assert.ok(Math.abs(coords.lat - baseA4.lat) < 0.0005);
  assert.ok(Math.abs(coords.lng - baseA4.lng) < 0.0005);
});

test("M03: getRestaurantCoordinates generates distinct coordinates for two different restaurants in the same alley", () => {
  const rest1 = {
    id: "5563cd1a-0659-4514-bfa5-5b917891236c",
    name: "Quán A",
    area: "Ngõ 1",
  };
  const rest2 = {
    id: "47bde236-80ae-4344-bea5-1dc3231a7781",
    name: "Quán B",
    area: "Ngõ 1",
  };
  const coords1 = getRestaurantCoordinates(rest1);
  const coords2 = getRestaurantCoordinates(rest2);

  // Both should be valid numbers
  assert.ok(Number.isFinite(coords1.lat) && Number.isFinite(coords1.lng));
  assert.ok(Number.isFinite(coords2.lat) && Number.isFinite(coords2.lng));
  // Coordinates must not be identical so pins don't stack directly on top of each other
  assert.notEqual(coords1.lat, coords2.lat);
  assert.notEqual(coords1.lng, coords2.lng);
});

test("M04: getRestaurantCoordinates falls back gracefully to campus center for unknown area", () => {
  const unknownRestaurant = {
    id: "rest-unknown",
    name: "Quán bí ẩn",
    area: "Khu vực lạ chưa xác định",
  };
  const coords = getRestaurantCoordinates(unknownRestaurant);
  assert.ok(Math.abs(coords.lat - HANU_CENTER_COORDS.lat) < 0.001);
  assert.ok(Math.abs(coords.lng - HANU_CENTER_COORDS.lng) < 0.001);
});

test("M05: calculateWalkingDistance returns accurate distance and walking time from HANU main gate", () => {
  // A spot ~200m away
  const nearbySpot = {
    lat: HANU_MAIN_GATE_COORDS.lat + 0.0015,
    lng: HANU_MAIN_GATE_COORDS.lng + 0.0015,
  };
  const result = calculateWalkingDistance(nearbySpot, HANU_MAIN_GATE_COORDS);

  assert.ok(result.distanceMeters >= 50);
  assert.ok(result.walkingMinutes >= 1 && result.walkingMinutes <= 15);
  assert.match(result.formattedText, /~\d+(m|km) • \d+ phút đi bộ/);
});

test("M06: POPULAR_ALLEY_FILTERS contains standard HANU alley clusters", () => {
  assert.ok(POPULAR_ALLEY_FILTERS.includes("Tất cả"));
  assert.ok(POPULAR_ALLEY_FILTERS.includes("Ngõ A4"));
  assert.ok(POPULAR_ALLEY_FILTERS.includes("Ngõ 1"));
  assert.ok(POPULAR_ALLEY_FILTERS.includes("Cổng trường"));
});

test("M07: Ngõ A4 restaurants stay strictly between stadium and Đường Lương Thế Vinh", () => {
  const sampleIds = ["a4-1", "a4-2", "a4-3", "5563cd1a-0659-4514-bfa5-5b917891236c"];
  for (const id of sampleIds) {
    const coords = getRestaurantCoordinates({ id, area: "Ngõ A4" });
    assert.ok(coords.lng >= 105.7962 && coords.lng <= 105.7971);
    assert.ok(coords.lat >= 20.9890 && coords.lat <= 20.9902);
  }
});

test("M08: Ngõ 1 restaurants stay on the north HANU side of Nguyễn Trãi", () => {
  const sampleIds = ["n1-1", "n1-2", "n1-3"];
  for (const id of sampleIds) {
    const coords = getRestaurantCoordinates({ id, area: "Ngõ 1" });
    assert.ok(coords.lat >= 20.9873);
  }
});

test("M09: Ngõ A8 restaurants stay within HANU boundary", () => {
  const sampleIds = ["a8-1", "a8-2", "a8-3"];
  for (const id of sampleIds) {
    const coords = getRestaurantCoordinates({ id, area: "Ngõ A8" });
    assert.ok(coords.lat <= 20.9914);
  }
});

import { decodePlusCode, extractPlusCode } from "../features/map/plus-code.ts";
import { getRealRestaurantCoordinates, spreadOverlappingCoordinates } from "../features/map/constants.ts";

test("M10: decodePlusCode decodes a full Open Location Code to the cell centre", () => {
  // Ô 8FVC9G8F+6X bắt đầu tại (47.3655, 8.524875), kích thước 0.000125°
  const area = decodePlusCode("8FVC9G8F+6X", HANU_CENTER_COORDS);
  assert.ok(area);
  assert.ok(Math.abs(area.lat - 47.3655625) < 1e-9);
  assert.ok(Math.abs(area.lng - 8.5249375) < 1e-9);
});

test("M11: decodePlusCode recovers short codes from the nearest reference point", () => {
  const short = decodePlusCode("9G8F+6X", { lat: 47.4, lng: 8.6 });
  const full = decodePlusCode("8FVC9G8F+6X", HANU_CENTER_COORDS);
  assert.deepEqual(short, full);

  // Mã rút gọn quanh HANU phải rơi trong bán kính ~500m quanh trường
  const gate = decodePlusCode("XQQW+6F", HANU_CENTER_COORDS);
  assert.ok(gate);
  assert.ok(Math.abs(gate.lat - HANU_CENTER_COORDS.lat) < 0.005);
  assert.ok(Math.abs(gate.lng - HANU_CENTER_COORDS.lng) < 0.005);
});

test("M12: extractPlusCode finds the code inside an address and rejects invalid input", () => {
  assert.equal(extractPlusCode("XQQW+6F Đại Mỗ, Hà Nội"), "XQQW+6F");
  assert.equal(extractPlusCode("XQQW+VFR Dai Mo, Ha Noi"), "XQQW+VFR");
  assert.equal(extractPlusCode("Số 9 Nguyễn Trãi"), null);
  assert.equal(extractPlusCode(null), null);
  assert.equal(decodePlusCode("NOT+CODE", HANU_CENTER_COORDS), null);
});

test("M13: restaurants with a Plus Code are pinned where Google Maps opens them, not on alley estimates", () => {
  const restaurant = { id: "r-plus", area: "Ngõ A5", plus_code: "XQQW+VFR", address_text: "XQQW+VFR Dai Mo, Ha Noi" };
  const expected = decodePlusCode("XQQW+VFR", HANU_CENTER_COORDS);
  assert.deepEqual(getRestaurantCoordinates(restaurant), { lat: expected.lat, lng: expected.lng });

  // Plus Code chỉ nằm trong địa chỉ vẫn được dùng
  const fromAddress = getRealRestaurantCoordinates({ address_text: "XQQW+VFR Dai Mo, Ha Noi" });
  assert.deepEqual(fromAddress, { lat: expected.lat, lng: expected.lng });

  // Toạ độ DB vẫn được ưu tiên hơn Plus Code
  const withLatLng = getRestaurantCoordinates({ ...restaurant, latitude: 20.99, longitude: 105.79 });
  assert.deepEqual(withLatLng, { lat: 20.99, lng: 105.79 });

  assert.equal(getRealRestaurantCoordinates({ area: "Ngõ A5" }), null);
});

test("M14: spreadOverlappingCoordinates separates pins sharing a location and keeps unique pins", () => {
  const shared = { lat: 20.9880625, lng: 105.7961875 };
  const unique = { lat: 20.9897, lng: 105.7961 };
  const result = spreadOverlappingCoordinates([
    { id: "a", coords: shared },
    { id: "b", coords: shared },
    { id: "c", coords: unique },
  ]);
  assert.deepEqual(result.get("c"), unique);
  const a = result.get("a");
  const b = result.get("b");
  assert.notDeepEqual(a, b);
  for (const p of [a, b]) {
    const meters = calculateWalkingDistance(p, shared).distanceMeters;
    assert.ok(meters <= 30, `pin moved too far: ${meters}m`);
  }
});
