import os
from collections import deque
from PIL import Image

NAV_ICONS_DIR = "public/icons/nav"
SOURCE_DIR = "D:/Program/icon"

ICON_MAPPING = {
    "Gemini_Generated_Image_.png": "home.png",
    "Gemini_Generated_Image_ (1).png": "explore.png",
    "Gemini_Generated_Image_ (2).png": "gacha.png",
    "Gemini_Generated_Image_ (3).png": "blog.png",
    "Gemini_Generated_Image_ (4).png": "profile.png",
    "Gemini_Generated_Image_ (5).png": "admin.png",
    "Gemini_Generated_Image_ (6).png": "support.png",
}

def remove_white_bg(img, tolerance=18):
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

def process_home_icon(src_path, out_path):
    img = Image.open(src_path).convert("RGBA")
    w, h = img.size
    pixels = img.load()

    cx, cy = 688, 383
    for y in range(h):
        for x in range(w):
            dx = x - cx
            dy = y - cy
            dist = (dx * dx + dy * dy) ** 0.5
            if dist >= 280:
                pixels[x, y] = (0, 0, 0, 0)

    def is_bg(r, g, b):
        if r > 235 and g > 235 and b > 235:
            return True
        if b > r + 10 and b > g + 10 and r < 120 and g < 120 and b < 185:
            return True
        return False

    queue = deque()
    visited = bytearray(w * h)

    for y in range(h):
        for x in range(w):
            if pixels[x, y][3] == 0:
                queue.append((x, y))

    while queue:
        x, y = queue.popleft()
        idx = y * w + x
        if visited[idx]:
            continue
        visited[idx] = 1
        pixels[x, y] = (0, 0, 0, 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h:
                nidx = ny * w + nx
                if not visited[nidx]:
                    nr, ng, nb, _ = pixels[nx, ny]
                    if is_bg(nr, ng, nb):
                        queue.append((nx, ny))

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a > 0 and b > r + 15 and b > g + 15 and r < 110 and g < 110:
                pixels[x, y] = (0, 0, 0, 0)

    save_square_png(img, out_path)

def process_sticker_icon(src_path, out_path):
    img = Image.open(src_path).convert("RGBA")
    remove_white_bg(img, tolerance=20)
    save_square_png(img, out_path)

def save_square_png(img, out_path):
    bbox = img.getbbox()
    if not bbox:
        return
    pad = 8
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
    resized = square.resize((256, 256), Image.Resampling.LANCZOS)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    resized.save(out_path, "PNG")
    print(f"-> Generated {out_path} (256x256)")

def main():
    os.makedirs(NAV_ICONS_DIR, exist_ok=True)
    for src_file, out_name in ICON_MAPPING.items():
        src_path = os.path.join(SOURCE_DIR, src_file)
        out_path = os.path.join(NAV_ICONS_DIR, out_name)
        if not os.path.exists(src_path):
            print(f"Warning: source file not found: {src_path}")
            continue
        if out_name == "home.png":
            process_home_icon(src_path, out_path)
        else:
            process_sticker_icon(src_path, out_path)
    print("All icons successfully generated in", NAV_ICONS_DIR)

if __name__ == "__main__":
    main()
