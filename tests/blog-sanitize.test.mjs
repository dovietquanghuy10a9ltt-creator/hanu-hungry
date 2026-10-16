import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeBlogHtml } from "../features/blog/sanitize.ts";

test("sanitizeBlogHtml allows basic Word formatting: bold, italic, underline, headings", () => {
  const input = "<strong>In đậm</strong> và <em>in nghiêng</em> và <u>gạch chân</u>";
  const output = sanitizeBlogHtml(input);
  assert.equal(output, "<strong>In đậm</strong> và <em>in nghiêng</em> và <u>gạch chân</u>");
});

test("sanitizeBlogHtml allows text color and background color style", () => {
  const input = '<span style="color: #bd2030; background-color: #fef08a">Chữ đỏ nền vàng</span>';
  const output = sanitizeBlogHtml(input);
  assert.match(output, /color:\s*#bd2030/);
  assert.match(output, /background-color:\s*#fef08a/);
});

test("sanitizeBlogHtml strips dangerous script tags and event handlers", () => {
  const input = '<script>alert(1)</script><p onclick="alert(2)">Hello</p><img src="x" onerror="alert(3)">';
  const output = sanitizeBlogHtml(input);
  assert.equal(output.includes("<script"), false);
  assert.equal(output.includes("alert(1)"), false);
  assert.equal(output.includes("onclick"), false);
  assert.equal(output.includes("onerror"), false);
});

