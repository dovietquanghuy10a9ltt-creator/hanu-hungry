import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  buildCatalog,
  generateSeedSql,
  makeSourceKey,
  parseCsv,
  parsePrice,
  slugify,
  stableUuid,
} from "./import-food-data.ts";

test("CSV parser handles quoted comma, quote and newline", () => {
  assert.deepEqual(parseCsv('a,b\r\n"x,y","quoted ""word""\nnext line"\r\n'), [
    ["a", "b"],
    ["x,y", 'quoted "word"\nnext line'],
  ]);
  assert.throws(() => parseCsv('a,"unfinished'), /quoted field/);
});

test("price parser keeps source text and parses only clear bounds", () => {
  assert.deepEqual(parsePrice("35,000"), { priceText: "35,000", minVnd: 35000, maxVnd: 35000 });
  assert.deepEqual(parsePrice("25,000 - 30,000"), { priceText: "25,000 - 30,000", minVnd: 25000, maxVnd: 30000 });
  assert.deepEqual(parsePrice("S:20,000 - M:25,000 - L:30,000"), { priceText: "S:20,000 - M:25,000 - L:30,000", minVnd: 20000, maxVnd: 30000 });
  assert.deepEqual(parsePrice("10,000/cái"), { priceText: "10,000/cái", minVnd: 10000, maxVnd: 10000 });
  assert.deepEqual(parsePrice("Miễn phí"), { priceText: "Miễn phí", minVnd: null, maxVnd: null });
  assert.deepEqual(parsePrice("+5,000"), { priceText: "+5,000", minVnd: null, maxVnd: null });
  assert.deepEqual(parsePrice("?K - 40,000"), { priceText: "?K - 40,000", minVnd: null, maxVnd: null });
  assert.deepEqual(parsePrice("None"), { priceText: "None", minVnd: null, maxVnd: null });
});

test("category and dish identities are stable", () => {
  assert.equal(slugify("Đồ Hàn"), "do-han");
  assert.equal(makeSourceKey(12, "  Cơm   gà  "), makeSourceKey(12, "cơm gà"));
  assert.equal(stableUuid("same"), stableUuid("same"));
  assert.notEqual(stableUuid("same"), stableUuid("other"));
});

test("source data can be imported without losing restaurant/dish grain", { skip: !existsSync(join(homedir(), "Downloads", "HANU_Hungry_FoodData.xlsx - Data quan an.csv")) }, () => {
  const data = readFileSync(join(homedir(), "Downloads", "HANU_Hungry_FoodData.xlsx - Data quan an.csv"), "utf8");
  const notes = readFileSync(join(homedir(), "Downloads", "HANU_Hungry_FoodData.xlsx - Ghi chú.csv"), "utf8");
  const catalog = buildCatalog(data, notes);
  const dishes = catalog.restaurants.flatMap((shop) => shop.dishes);
  assert.equal(catalog.sourceRows, 1003);
  assert.equal(catalog.restaurants.length, 59);
  assert.equal(dishes.length, 950);
  assert.equal(catalog.restaurants.filter((shop) => !shop.addressText).length, 9);
  assert.equal(catalog.restaurants.filter((shop) => !shop.categories.length).length, 29);
  assert.equal(catalog.suggestedCategories.length, 13);
  assert.equal(catalog.restaurants[0].sourceStt, 1);
  assert.equal(catalog.restaurants.at(-1).sourceStt, 59);
  assert.equal(catalog.restaurants.find((shop) => shop.sourceStt === 19).notes, "Chưa xác định vị trí/địa chỉ cụ thể");
  assert.equal(new Set(dishes.map((dish) => dish.sourceKey)).size, dishes.length);
  assert.equal(new Set(dishes.map((dish) => dish.sourceRow)).size, dishes.length);
  assert.ok(catalog.restaurants.every((shop) => shop.name.length <= 180));
  assert.ok(dishes.every((dish) => dish.name.length <= 200));
  assert.ok(dishes.every((dish) => dish.price.maxVnd === null ||
    (dish.price.minVnd !== null && dish.price.maxVnd >= dish.price.minVnd)));
  const sql = generateSeedSql(catalog);
  assert.ok(sql.startsWith("-- Generated from HANU Hungry CSV exports"));
  assert.match(sql, /ON CONFLICT \(source_stt\) DO UPDATE/);
  assert.match(sql, /ON CONFLICT \(source_key\) DO UPDATE/);
  assert.match(sql, /ON CONFLICT \(restaurant_id, category_id\) DO NOTHING/);
  assert.match(sql, /I''m Quyền/);
  assert.ok(sql.endsWith("COMMIT;\n"));
});
