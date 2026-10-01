import test from "node:test";
import assert from "node:assert/strict";
import { filterCatalog, dishSuggestions, normalizeSearch, parseMaxPrice } from "../features/restaurants/search.ts";
const catalog = [
  { id: "a", name: "Quán nhà", category_slugs: ["bun"], categories: ["Bún"], dishes: [{ id: "d1", name: "Bún bò", price_min_vnd: 70000 }, { id: "d2", name: "Bánh mì", price_min_vnd: 25000 }] },
  { id: "b", name: "Cà phê", category_slugs: ["cafe"], categories: ["Đồ uống"], dishes: [{ id: "d3", name: "Trà đào", price_min_vnd: null }] },
];
test("price accepts 70000 exactly, grouped digits and integer dong", () => {
  assert.equal(parseMaxPrice("70000"), 70000);
  assert.equal(parseMaxPrice("70.000"), 70000);
  assert.equal(parseMaxPrice("70001"), 70001);
  for (const invalid of ["", "0", "-1", "abc", "10000001", "Infinity"]) assert.equal(parseMaxPrice(invalid), undefined);
});
test("one-character and accent-free queries find actual matching dishes", () => {
  assert.equal(normalizeSearch("BÚN đậu"), "bun dau");
  assert.equal(dishSuggestions(catalog, "b").length, 2);
  assert.equal(dishSuggestions(catalog, "bun")[0].name, "Bún bò");
  assert.equal(dishSuggestions(catalog, "%").length, 0);
});
test("category, price and dish query must match together; unknown prices are excluded", () => {
  assert.equal(filterCatalog(catalog, "bun bo", "", 70000).length, 1);
  assert.equal(filterCatalog(catalog, "bun bo", "", 69999).length, 0);
  assert.equal(filterCatalog(catalog, "b", "cafe").length, 0);
  assert.equal(filterCatalog(catalog, "tra", "", 70000).length, 0);
  assert.equal(filterCatalog(catalog, "", "", undefined).length, 2);
});
