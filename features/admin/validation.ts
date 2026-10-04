type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isUuid(value: string): boolean {
  return UUID.test(value);
}

function value(form: FormData, key: string): string {
  const raw = form.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

function optionalText(form: FormData, key: string, max: number): Result<string | null> {
  const text = value(form, key);
  if (text.length > max) return { ok: false, error: `${key} quá dài (tối đa ${max} ký tự).` };
  return { ok: true, data: text || null };
}

function requiredText(form: FormData, key: string, label: string, max: number): Result<string> {
  const text = value(form, key);
  if (!text || text.length > max) {
    return { ok: false, error: `${label} cần từ 1 đến ${max} ký tự.` };
  }
  return { ok: true, data: text };
}

function optionalNumber(form: FormData, key: string, min: number, max: number, integer = false): Result<number | null> {
  const text = value(form, key);
  if (!text) return { ok: true, data: null };
  const number = Number(text);
  if (!Number.isFinite(number) || number < min || number > max || (integer && !Number.isInteger(number))) {
    return { ok: false, error: `${key} không hợp lệ.` };
  }
  return { ok: true, data: number };
}

function optionalUrl(form: FormData, key: string): Result<string | null> {
  const text = value(form, key);
  if (!text) return { ok: true, data: null };
  if (text.length > 2000) return { ok: false, error: "URL ảnh quá dài." };
  try {
    const url = new URL(text);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("protocol");
    return { ok: true, data: url.toString() };
  } catch {
    return { ok: false, error: "URL ảnh phải bắt đầu bằng http:// hoặc https://." };
  }
}

export function parseRestaurantForm(form: FormData): Result<{
  data: {
    name: string; area: string | null; address_text: string | null;
    plus_code: string | null; latitude: number | null; longitude: number | null;
    description: string | null; image_url: string | null; notes: string | null;
  };
  categoryIds: string[];
}> {
  const name = requiredText(form, "name", "Tên quán", 180);
  if (!name.ok) return name;
  const area = optionalText(form, "area", 150);
  if (!area.ok) return area;
  const address = optionalText(form, "address_text", 500);
  if (!address.ok) return address;
  const plusCode = optionalText(form, "plus_code", 150);
  if (!plusCode.ok) return plusCode;
  const latitude = optionalNumber(form, "latitude", -90, 90);
  if (!latitude.ok) return latitude;
  const longitude = optionalNumber(form, "longitude", -180, 180);
  if (!longitude.ok) return longitude;
  if ((latitude.data === null) !== (longitude.data === null)) {
    return { ok: false, error: "Vĩ độ và kinh độ phải được nhập cùng nhau." };
  }
  const description = optionalText(form, "description", 5000);
  if (!description.ok) return description;
  const image = optionalUrl(form, "image_url");
  if (!image.ok) return image;
  const notes = optionalText(form, "notes", 5000);
  if (!notes.ok) return notes;
  const categoryIds = [...new Set(form.getAll("category_ids").filter((id): id is string => typeof id === "string"))];
  if (!categoryIds.every(isUuid)) return { ok: false, error: "Category không hợp lệ." };
  return {
    ok: true,
    data: {
      data: {
        name: name.data, area: area.data, address_text: address.data,
        plus_code: plusCode.data, latitude: latitude.data, longitude: longitude.data,
        description: description.data, image_url: image.data, notes: notes.data,
      },
      categoryIds,
    },
  };
}

export function parseCategoryForm(form: FormData): Result<{ name: string; slug: string }> {
  const name = requiredText(form, "name", "Tên category", 100);
  if (!name.ok) return name;
  const slug = value(form, "slug").toLowerCase();
  if (!SLUG.test(slug) || slug.length > 100) {
    return { ok: false, error: "Slug chỉ gồm chữ thường không dấu, số và dấu gạch nối." };
  }
  return { ok: true, data: { name: name.data, slug } };
}

export function parseDishForm(form: FormData): Result<{
  restaurant_id: string; name: string; price_text: string | null;
  price_min_vnd: number | null; price_max_vnd: number | null; notes: string | null;
}> {
  const restaurantId = value(form, "restaurant_id");
  if (!isUuid(restaurantId)) return { ok: false, error: "Quán không hợp lệ." };
  const name = requiredText(form, "name", "Tên món", 200);
  if (!name.ok) return name;
  const priceText = optionalText(form, "price_text", 150);
  if (!priceText.ok) return priceText;
  const priceMin = optionalNumber(form, "price_min_vnd", 0, 1_000_000_000, true);
  if (!priceMin.ok) return priceMin;
  const priceMax = optionalNumber(form, "price_max_vnd", 0, 1_000_000_000, true);
  if (!priceMax.ok) return priceMax;
  if (priceMax.data !== null && (priceMin.data === null || priceMax.data < priceMin.data)) {
    return { ok: false, error: "Giá tối đa phải lớn hơn hoặc bằng giá tối thiểu." };
  }
  const notes = optionalText(form, "notes", 3000);
  if (!notes.ok) return notes;
  return {
    ok: true,
    data: {
      restaurant_id: restaurantId, name: name.data, price_text: priceText.data,
      price_min_vnd: priceMin.data, price_max_vnd: priceMax.data, notes: notes.data,
    },
  };
}

export function parseBlogForm(form: FormData): Result<{
  slug: string; title: string; excerpt: string | null; content: string;
  cover_image_url: string | null; status: "draft" | "published";
  seo_title: string | null; seo_description: string | null;
}> {
  const slug = value(form, "slug").toLowerCase();
  if (!SLUG.test(slug) || slug.length > 180) {
    return { ok: false, error: "Slug chỉ gồm chữ thường không dấu, số và dấu gạch nối." };
  }
  const title = requiredText(form, "title", "Tiêu đề", 200);
  if (!title.ok) return title;
  const excerpt = optionalText(form, "excerpt", 500);
  if (!excerpt.ok) return excerpt;
  const content = requiredText(form, "content", "Nội dung", 100_000);
  if (!content.ok) return content;
  const cover = optionalUrl(form, "cover_image_url");
  if (!cover.ok) return cover;
  const status = value(form, "status");
  if (status !== "draft" && status !== "published") {
    return { ok: false, error: "Trạng thái Blog không hợp lệ." };
  }
  const seoTitle = optionalText(form, "seo_title", 200);
  if (!seoTitle.ok) return seoTitle;
  const seoDescription = optionalText(form, "seo_description", 500);
  if (!seoDescription.ok) return seoDescription;
  return {
    ok: true,
    data: {
      slug, title: title.data, excerpt: excerpt.data, content: content.data,
      cover_image_url: cover.data, status, seo_title: seoTitle.data,
      seo_description: seoDescription.data,
    },
  };
}
