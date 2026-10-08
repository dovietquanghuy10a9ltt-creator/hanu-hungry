import test from "node:test";
import assert from "node:assert/strict";
import {
  ALLOWED_MIME_TYPES,
  MAX_AVATAR_SIZE_BYTES,
  detectImageFormat,
} from "../features/profile/validation.ts";

test("detectImageFormat correctly identifies genuine JPEG files", () => {
  const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  const result = detectImageFormat(jpegHeader);
  assert.deepEqual(result, { mime: "image/jpeg", ext: "jpg" });
});

test("detectImageFormat correctly identifies genuine PNG files", () => {
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  const result = detectImageFormat(pngHeader);
  assert.deepEqual(result, { mime: "image/png", ext: "png" });
});

test("detectImageFormat correctly identifies genuine GIF files", () => {
  const gif87a = Buffer.from("GIF87a\x01\x00\x01\x00\x80\x00", "binary");
  const gif89a = Buffer.from("GIF89a\x01\x00\x01\x00\x80\x00", "binary");
  assert.deepEqual(detectImageFormat(gif87a), { mime: "image/gif", ext: "gif" });
  assert.deepEqual(detectImageFormat(gif89a), { mime: "image/gif", ext: "gif" });
});

test("detectImageFormat correctly identifies genuine WebP files", () => {
  const webpHeader = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x24, 0x00, 0x00, 0x00, // length
    0x57, 0x45, 0x42, 0x50, // WEBP
  ]);
  const result = detectImageFormat(webpHeader);
  assert.deepEqual(result, { mime: "image/webp", ext: "webp" });
});

test("detectImageFormat rejects spoofed and executable text/script files", () => {
  const phpScript = Buffer.from("<?php echo 'malicious'; ?>");
  const htmlScript = Buffer.from("<html><script>alert(1)</script></html>");
  const randomText = Buffer.from("Just a regular text file pretending to be jpg");

  assert.equal(detectImageFormat(phpScript), null);
  assert.equal(detectImageFormat(htmlScript), null);
  assert.equal(detectImageFormat(randomText), null);
});

test("detectImageFormat rejects truncated buffers under 12 bytes", () => {
  assert.equal(detectImageFormat(Buffer.from([0xff, 0xd8, 0xff])), null);
  assert.equal(detectImageFormat(Buffer.from([])), null);
});

test("avatar constants enforce 5MB limit and allowed image MIME types", () => {
  assert.equal(MAX_AVATAR_SIZE_BYTES, 5 * 1024 * 1024);
  assert.ok(ALLOWED_MIME_TYPES.has("image/jpeg"));
  assert.ok(ALLOWED_MIME_TYPES.has("image/png"));
  assert.ok(ALLOWED_MIME_TYPES.has("image/webp"));
  assert.ok(ALLOWED_MIME_TYPES.has("image/gif"));
  assert.equal(ALLOWED_MIME_TYPES.has("image/svg+xml"), false);
});
