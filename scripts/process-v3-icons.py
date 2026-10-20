import os
from collections import deque
from PIL import Image

SRC_DIR = r"C:\Users\Quang Huy\Downloads\iconv3"

MAPPING = {
    "Gemini_Generated_Image_1lo8po1lo8po1lo8.png": "public/icons/streak/flame-active.png",
    "Gemini_Generated_Image_9votyd9votyd9vot.png": "public/icons/streak/flame-inactive.png",
    "Gemini_Generated_Image_sjg1cgsjg1cgsjg1.png": "public/icons/streak/calendar.png",
    "Gemini_Generated_Image_s85ci8s85ci8s85c.png": "public/icons/shared/bell.png",
    "Gemini_Generated_Image_r8agtbr8agtbr8ag.png": "public/icons/shared/mail.png",
    "Gemini_Generated_Image_9w4t009w4t009w4t.png": "public/icons/shared/clock.png",
    "Gemini_Generated_Image_f1l9tpf1l9tpf1l9.png": "public/icons/shared/star.png",
    "Gemini_Generated_Image_b5hjg2b5hjg2b5hj.png": "public/icons/gacha/celebration.png",
}

def remove_white_bg(img, tolerance=22):
    w, h = img.size
    pixels = img.load()
    visited = bytearray(w * h)
    queue = deque()

    def is_white(r, g, b):
        return r >= (255 - tolerance) and g >= (255 - tolerance) and b >= (255 - tolerance)

    for x in range(w):
        queue.append((x, 0))
        queue.append((x, h - 1))
    for y in range(h):
        queue.append((0, y))
        queue.append((w - 1, y))

    while queue:
        x, y = queue.popleft()
        idx = y * w + x
        if visited[idx]:
            continue
        visited[idx] = 1
        r, g, b, a = pixels[x, y]
        if is_white(r, g, b):
            pixels[x, y] = (r, g, b, 0)
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < w and 0 <= ny < h:
                    nidx = ny * w + nx
                    if not visited[nidx]:
                        nr, ng, nb, _ = pixels[nx, ny]
                        if is_white(nr, ng, nb):
                            queue.append((nx, ny))

def save_square_png(img, out_path, target_size=256):
    bbox = img.getbbox()
    if not bbox:
        return
    pad = 12
    w, h = img.size
    crop_box = (
        max(0, bbox[0] - pad),
        max(0, bbox[1] - pad),
        min(w, bbox[2] + pad),
        min(h, bbox[3] + pad),
    )
    cropped = img.crop(crop_box)
    cw, ch = cropped.size
    size = max(cw, ch)
    square = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    square.paste(cropped, ((size - cw) // 2, (size - ch) // 2))
    resized = square.resize((target_size, target_size), Image.Resampling.LANCZOS)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    resized.save(out_path, "PNG")
    print(f"-> Generated {out_path} ({target_size}x{target_size})")

def main():
    for src_name, out_path in MAPPING.items():
        src_file = os.path.join(SRC_DIR, src_name)
        if not os.path.exists(src_file):
            print("Missing:", src_file)
            continue
        print(f"Processing {src_name} -> {out_path}...")
        img = Image.open(src_file).convert("RGBA")
        remove_white_bg(img, tolerance=22)
        save_square_png(img, out_path)
    print("Done processing all v3 icons!")

if __name__ == "__main__":
    main()
