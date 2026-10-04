/**
 * Import the two HANU Hungry CSV exports into the Supabase catalog.
 *
 * Dry run: node scripts/import-food-data.ts
 * Apply:   node scripts/import-food-data.ts --apply
 * Node 24+ runs this TypeScript file without an extra runtime dependency.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DATA_FILE = "HANU_Hungry_FoodData.xlsx - Data quan an.csv";
const NOTES_FILE = "HANU_Hungry_FoodData.xlsx - Ghi chú.csv";
const HEADERS = [
  "STT",
  "Khu vực",
  "Địa chỉ cụ thể",
  "Tên quán",
  "Phân loại quán",
  "Món ăn",
  "Giá tiền",
  "Ghi chú",
];
const UUID_NAMESPACE = "6ecfa3c308e05ba99a230f8f8d6b0a16";

type CsvRow = Record<(typeof HEADERS)[number], string>;

export type Price = {
  priceText: string | null;
  minVnd: number | null;
  maxVnd: number | null;
};

export type DishSeed = {
  sourceRow: number;
  sourceKey: string;
  name: string;
  price: Price;
  notes: string | null;
};

export type RestaurantSeed = {
  sourceStt: number;
  name: string;
  area: string;
  addressText: string | null;
  plusCode: string | null;
  notes: string | null;
  categories: string[];
  dishes: DishSeed[];
};

export type CatalogSeed = {
  restaurants: RestaurantSeed[];
  categories: string[];
  sourceRows: number;
  suggestedCategories: string[];
};

/** Read RFC 4180-style CSV, including quoted commas, quotes and newlines. */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      if (cell !== "") throw new Error(`Unexpected quote in CSV row ${rows.length + 1}`);
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\r" || char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      if (char === "\r" && text[i + 1] === "\n") i += 1;
    } else {
      cell += char;
    }
  }
  if (quoted) throw new Error("CSV ends inside a quoted field");
  if (row.length > 0 || cell !== "") rows.push([...row, cell]);
  return rows;
}

function normalized(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function identity(value: string): string {
  return normalized(value).toLocaleLowerCase("vi");
}

export function slugify(value: string): string {
  return normalized(value)
    .toLocaleLowerCase("vi")
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Price bounds are populated only when every component is unambiguous. */
export function parsePrice(raw: string): Price {
  const priceText = normalized(raw) || null;
  if (!priceText) return { priceText: null, minVnd: null, maxVnd: null };
  // "Miễn phí" in this source is an accompaniment, not a standalone meal.
  if (identity(priceText) === "miễn phí") {
    return { priceText, minVnd: null, maxVnd: null };
  }
  // A leading + is a surcharge, not the menu item's standalone price.
  if (priceText.startsWith("+")) {
    return { priceText, minVnd: null, maxVnd: null };
  }

  const pieces = priceText.split(/\s+-\s+|\s*-\s*/);
  const values: number[] = [];
  for (const piece of pieces) {
    const match = piece.match(
      /^(?:(?:XS|S|M|L|XL|XXL)\s*:\s*)?(\+?\d{1,3}(?:,\d{3})*|\+?\d+)(?:\s*\/\s*[\p{L}]+)?$/iu,
    );
    if (!match) return { priceText, minVnd: null, maxVnd: null };
    const value = Number(match[1].replace(/[+,]/g, ""));
    if (!Number.isSafeInteger(value)) {
      return { priceText, minVnd: null, maxVnd: null };
    }
    values.push(value);
  }
  return {
    priceText,
    minVnd: Math.min(...values),
    maxVnd: Math.max(...values),
  };
}

export function stableUuid(key: string): string {
  const bytes = createHash("sha1")
    .update(Buffer.from(UUID_NAMESPACE, "hex"))
    .update(key, "utf8")
    .digest()
    .subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function makeSourceKey(sourceStt: number, dishName: string): string {
  const hash = createHash("sha256").update(identity(dishName), "utf8").digest("hex");
  return `food-csv:${sourceStt}:${hash}`;
}

function extractPlusCode(address: string | null): string | null {
  if (!address) return null;
  const match = address.match(/^([A-Z0-9]{4,8}\+[A-Z0-9]{2,3})(?:\b|$)/i);
  return match ? match[1].toUpperCase() : null;
}

function readDataRows(csvText: string): CsvRow[] {
  const rows = parseCsv(csvText);
  const headerIndex = rows.findIndex((row) => HEADERS.every((name, i) => row[i] === name));
  if (headerIndex < 0) throw new Error("Food CSV header not found or changed");
  const dataRows: CsvRow[] = [];
  for (let i = headerIndex + 1; i < rows.length; i += 1) {
    const values = rows[i];
    if (values.every((value) => !normalized(value))) continue;
    if (values.length !== HEADERS.length) {
      throw new Error(`Food CSV row ${i + 1} has ${values.length} columns; expected 8`);
    }
    const record = Object.fromEntries(HEADERS.map((header, j) => [header, normalized(values[j])])) as CsvRow;
    dataRows.push(record);
  }
  return dataRows;
}

function readSuggestedCategories(notesCsv: string): string[] {
  const rows = parseCsv(notesCsv);
  const seen = new Set<string>();
  const values: string[] = [];
  for (const row of rows.slice(1)) {
    const name = normalized(row[0] ?? "");
    if (!name || seen.has(identity(name))) continue;
    seen.add(identity(name));
    values.push(name);
  }
  return values;
}

export function buildCatalog(dataCsv: string, notesCsv: string): CatalogSeed {
  const dataRows = readDataRows(dataCsv);
  const suggestedCategories = readSuggestedCategories(notesCsv);
  const restaurants = new Map<number, RestaurantSeed>();
  const dishKeys = new Set<string>();

  for (const [rowIndex, row] of dataRows.entries()) {
    const sourceStt = Number(row.STT);
    if (!Number.isSafeInteger(sourceStt) || sourceStt <= 0 || !row["Tên quán"] || !row["Khu vực"]) {
      throw new Error(`Invalid shop identity at STT ${JSON.stringify(row.STT)}`);
    }
    const name = row["Tên quán"];
    const area = row["Khu vực"];
    const address = row["Địa chỉ cụ thể"] || null;
    let shop = restaurants.get(sourceStt);
    if (!shop) {
      shop = {
        sourceStt,
        name,
        area,
        addressText: address,
        plusCode: extractPlusCode(address),
        notes: null,
        categories: [],
        dishes: [],
      };
      restaurants.set(sourceStt, shop);
    } else if (
      identity(shop.name) !== identity(name) ||
      identity(shop.area) !== identity(area) ||
      (address && shop.addressText && identity(shop.addressText) !== identity(address))
    ) {
      throw new Error(`Conflicting shop details for STT ${sourceStt}`);
    }
    if (!shop.addressText && address) {
      shop.addressText = address;
      shop.plusCode = extractPlusCode(address);
    }

    for (const category of row["Phân loại quán"].split(",")) {
      const categoryName = normalized(category);
      if (categoryName && !shop.categories.some((current) => identity(current) === identity(categoryName))) {
        shop.categories.push(categoryName);
      }
    }

    const dishName = row["Món ăn"];
    const note = row["Ghi chú"] || null;
    if (!dishName) {
      if (row["Giá tiền"]) throw new Error(`Price without dish at STT ${sourceStt}`);
      if (note) shop.notes = shop.notes ? `${shop.notes}\n${note}` : note;
      continue;
    }
    const dishKey = `${sourceStt}:${identity(dishName)}`;
    if (dishKeys.has(dishKey)) throw new Error(`Duplicate dish in CSV: ${dishKey}`);
    dishKeys.add(dishKey);
    const locationNote = note === "Chưa xác định vị trí/địa chỉ cụ thể";
    if (locationNote) shop.notes = shop.notes ? `${shop.notes}\n${note}` : note;
    shop.dishes.push({
      sourceRow: rowIndex + 1,
      sourceKey: makeSourceKey(sourceStt, dishName),
      name: dishName,
      price: parsePrice(row["Giá tiền"]),
      notes: locationNote ? null : note,
    });
  }

  const categoryMap = new Map<string, string>();
  for (const name of suggestedCategories) categoryMap.set(identity(name), name);
  for (const shop of restaurants.values()) {
    for (const name of shop.categories) categoryMap.set(identity(name), name);
  }
  const categories = [...categoryMap.values()];
  const slugs = new Set<string>();
  for (const category of categories) {
    const slug = slugify(category);
    if (!slug || slugs.has(slug)) throw new Error(`Category slug collision: ${category}`);
    slugs.add(slug);
  }
  return {
    restaurants: [...restaurants.values()].sort((a, b) => a.sourceStt - b.sourceStt),
    categories,
    sourceRows: dataRows.length,
    suggestedCategories,
  };
}

function sqlText(value: string | null): string {
  return value === null ? "NULL" : `'${value.replace(/'/g, "''")}'`;
}

function sqlNumber(value: number | null): string {
  return value === null ? "NULL" : String(value);
}

function sqlChunks<T>(values: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < values.length; i += size) chunks.push(values.slice(i, i + size));
  return chunks;
}

/** Build an idempotent SQL seed for `supabase db push --include-seed`. */
export function generateSeedSql(catalog: CatalogSeed): string {
  const lines: string[] = [
    "-- Generated from HANU Hungry CSV exports by scripts/import-food-data.ts.",
    "-- Review the migration and dry-run counts before applying to a database.",
    "BEGIN;",
    "",
  ];

  for (const batch of sqlChunks(catalog.categories, 100)) {
    lines.push(
      "INSERT INTO public.categories (name, slug) VALUES",
      batch.map((name) => `  (${sqlText(name)}, ${sqlText(slugify(name))})`).join(",\n"),
      "ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;",
      "",
    );
  }

  for (const batch of sqlChunks(catalog.restaurants, 100)) {
    lines.push(
      "INSERT INTO public.restaurants AS target (source_stt, name, area, address_text, plus_code, notes) VALUES",
      batch.map((shop) =>
        `  (${shop.sourceStt}, ${sqlText(shop.name)}, ${sqlText(shop.area)}, ${sqlText(shop.addressText)}, ${sqlText(shop.plusCode)}, ${sqlText(shop.notes)})`,
      ).join(",\n"),
      "ON CONFLICT (source_stt) DO UPDATE SET",
      "  name = EXCLUDED.name,",
      "  area = EXCLUDED.area,",
      "  address_text = COALESCE(EXCLUDED.address_text, target.address_text),",
      "  plus_code = COALESCE(EXCLUDED.plus_code, target.plus_code),",
      "  notes = COALESCE(EXCLUDED.notes, target.notes);",
      "",
    );
  }

  const dishes = catalog.restaurants.flatMap((shop) =>
    shop.dishes.map((dish) => ({ shop, dish })),
  );
  for (const batch of sqlChunks(dishes, 100)) {
    lines.push(
      "INSERT INTO public.dishes AS target (id, restaurant_id, source_key, source_row, name, price_text, price_min_vnd, price_max_vnd, notes)",
      "SELECT src.id::uuid, restaurant.id, src.source_key, src.source_row, src.name, src.price_text, src.price_min_vnd, src.price_max_vnd, src.notes",
      "FROM (VALUES",
      batch.map(({ shop, dish }) =>
        `  (${sqlText(stableUuid(dish.sourceKey))}, ${shop.sourceStt}, ${sqlText(dish.sourceKey)}, ${dish.sourceRow}, ${sqlText(dish.name)}, ${sqlText(dish.price.priceText)}, ${sqlNumber(dish.price.minVnd)}, ${sqlNumber(dish.price.maxVnd)}, ${sqlText(dish.notes)})`,
      ).join(",\n"),
      ") AS src(id, source_stt, source_key, source_row, name, price_text, price_min_vnd, price_max_vnd, notes)",
      "JOIN public.restaurants AS restaurant ON restaurant.source_stt = src.source_stt",
      "WHERE true",
      "ON CONFLICT (source_key) DO UPDATE SET",
      "  source_row = EXCLUDED.source_row,",
      "  name = EXCLUDED.name,",
      "  price_text = COALESCE(EXCLUDED.price_text, target.price_text),",
      "  price_min_vnd = CASE WHEN EXCLUDED.price_text IS NULL THEN target.price_min_vnd ELSE EXCLUDED.price_min_vnd END,",
      "  price_max_vnd = CASE WHEN EXCLUDED.price_text IS NULL THEN target.price_max_vnd ELSE EXCLUDED.price_max_vnd END,",
      "  notes = COALESCE(EXCLUDED.notes, target.notes);",
      "",
    );
  }

  const links = catalog.restaurants.flatMap((shop) =>
    shop.categories.map((category) => ({ sourceStt: shop.sourceStt, slug: slugify(category) })),
  );
  for (const batch of sqlChunks(links, 100)) {
    lines.push(
      "INSERT INTO public.restaurant_categories (restaurant_id, category_id)",
      "SELECT restaurant.id, category.id",
      "FROM (VALUES",
      batch.map((link) => `  (${link.sourceStt}, ${sqlText(link.slug)})`).join(",\n"),
      ") AS src(source_stt, category_slug)",
      "JOIN public.restaurants AS restaurant ON restaurant.source_stt = src.source_stt",
      "JOIN public.categories AS category ON category.slug = src.category_slug",
      "WHERE true",
      "ON CONFLICT (restaurant_id, category_id) DO NOTHING;",
      "",
    );
  }

  lines.push("COMMIT;", "");
  return lines.join("\n");
}

function printSummary(catalog: CatalogSeed): void {
  const dishes = catalog.restaurants.flatMap((shop) => shop.dishes);
  const unparsedPrices = dishes.filter(
    (dish) => dish.price.priceText !== null && dish.price.minVnd === null,
  );
  console.log(`Source rows: ${catalog.sourceRows}`);
  console.log(`Restaurants: ${catalog.restaurants.length}`);
  console.log(`Dishes: ${dishes.length}`);
  console.log(`Dishes with source price: ${dishes.filter((dish) => dish.price.priceText).length}`);
  console.log(`Prices requiring review: ${unparsedPrices.length}`);
  console.log(`Categories: ${catalog.categories.length} (${catalog.suggestedCategories.length} suggested)`);
  console.log(`Restaurants missing address: ${catalog.restaurants.filter((shop) => !shop.addressText).length}`);
  console.log(`Restaurants missing category: ${catalog.restaurants.filter((shop) => shop.categories.length === 0).length}`);
  for (const dish of unparsedPrices.slice(0, 10)) {
    console.log(`  Review price: ${dish.name}: ${dish.price.priceText}`);
  }
}

type DbRow = Record<string, unknown>;

async function applyCatalog(catalog: CatalogSeed): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("Apply requires SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) and NEXT_PUBLIC_SUPABASE_URL");
  }
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  async function fetchAll(table: string, columns: string, orderBy = "id"): Promise<DbRow[]> {
    const result: DbRow[] = [];
    for (let from = 0; ; from += 500) {
      const { data, error } = await supabase
        .from(table)
        .select(columns)
        .order(orderBy)
        .range(from, from + 499);
      if (error) throw new Error(`${table} read failed: ${error.message}`);
      const page = (data ?? []) as unknown as DbRow[];
      result.push(...page);
      if (page.length < 500) break;
    }
    return result;
  }

  async function upsertBatches(table: string, rows: DbRow[], onConflict: string): Promise<void> {
    for (let from = 0; from < rows.length; from += 100) {
      const { error } = await supabase.from(table).upsert(rows.slice(from, from + 100), { onConflict });
      if (error) throw new Error(`${table} upsert failed at offset ${from}: ${error.message}`);
    }
  }

  await upsertBatches(
    "categories",
    catalog.categories.map((name) => ({ name, slug: slugify(name) })),
    "slug",
  );
  const categoryIdBySlug = new Map(
    (await fetchAll("categories", "id,slug")).map((row) => [String(row.slug), String(row.id)]),
  );
  const existingShops = new Map(
    (await fetchAll("restaurants", "id,source_stt,address_text,plus_code,notes")).map((row) => [Number(row.source_stt), row]),
  );
  await upsertBatches(
    "restaurants",
    catalog.restaurants.map((shop) => {
      const prior = existingShops.get(shop.sourceStt);
      return {
        source_stt: shop.sourceStt,
        name: shop.name,
        area: shop.area,
        address_text: shop.addressText ?? prior?.address_text ?? null,
        plus_code: shop.plusCode ?? prior?.plus_code ?? null,
        notes: shop.notes ?? prior?.notes ?? null,
      };
    }),
    "source_stt",
  );
  const shopIdByStt = new Map(
    (await fetchAll("restaurants", "id,source_stt")).map((row) => [Number(row.source_stt), String(row.id)]),
  );

  const existingDishes = await fetchAll(
    "dishes",
    "id,restaurant_id,source_key,name,price_text,price_min_vnd,price_max_vnd,notes",
  );
  const dishByKey = new Map<string, DbRow>();
  const dishBySourceKey = new Map<string, DbRow>();
  for (const row of existingDishes) {
    const keyForDish = `${row.restaurant_id}:${identity(String(row.name))}`;
    if (dishByKey.has(keyForDish)) throw new Error(`Duplicate existing dish: ${keyForDish}`);
    dishByKey.set(keyForDish, row);
    if (row.source_key) {
      const sourceKey = String(row.source_key);
      if (dishBySourceKey.has(sourceKey)) throw new Error(`Duplicate existing source key: ${sourceKey}`);
      dishBySourceKey.set(sourceKey, row);
    }
  }

  const dishRows: DbRow[] = [];
  const categoryLinks: DbRow[] = [];
  for (const shop of catalog.restaurants) {
    const restaurantId = shopIdByStt.get(shop.sourceStt);
    if (!restaurantId) throw new Error(`Missing imported restaurant STT ${shop.sourceStt}`);
    for (const dish of shop.dishes) {
      const prior: DbRow | undefined = dishBySourceKey.get(dish.sourceKey) ?? dishByKey.get(`${restaurantId}:${identity(dish.name)}`);
      if (prior && prior.restaurant_id !== restaurantId) {
        throw new Error(`Source key belongs to another restaurant: ${dish.sourceKey}`);
      }
      const hasSourcePrice = dish.price.priceText !== null;
      dishRows.push({
        id: prior?.id ?? stableUuid(dish.sourceKey),
        restaurant_id: restaurantId,
        source_key: dish.sourceKey,
        source_row: dish.sourceRow,
        name: dish.name,
        price_text: hasSourcePrice ? dish.price.priceText : (prior?.price_text ?? null),
        price_min_vnd: hasSourcePrice ? dish.price.minVnd : (prior?.price_min_vnd ?? null),
        price_max_vnd: hasSourcePrice ? dish.price.maxVnd : (prior?.price_max_vnd ?? null),
        notes: dish.notes ?? prior?.notes ?? null,
      });
    }
    for (const categoryName of shop.categories) {
      const categoryId = categoryIdBySlug.get(slugify(categoryName));
      if (!categoryId) throw new Error(`Missing imported category ${categoryName}`);
      categoryLinks.push({ restaurant_id: restaurantId, category_id: categoryId });
    }
  }
  await upsertBatches("dishes", dishRows, "id");

  const existingLinks = await fetchAll("restaurant_categories", "restaurant_id,category_id", "restaurant_id");
  const linkKeys = new Set(existingLinks.map((row) => `${row.restaurant_id}:${row.category_id}`));
  const newLinks = categoryLinks.filter((row) => !linkKeys.has(`${row.restaurant_id}:${row.category_id}`));
  for (let from = 0; from < newLinks.length; from += 100) {
    const { error } = await supabase.from("restaurant_categories").insert(newLinks.slice(from, from + 100));
    if (error) throw new Error(`restaurant_categories insert failed at offset ${from}: ${error.message}`);
  }
  console.log(`Applied ${catalog.restaurants.length} restaurants, ${dishRows.length} dishes, ${catalog.categories.length} categories and ${categoryLinks.length} restaurant-category links.`);
}

function valueAfter(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index < 0) return undefined;
  if (!args[index + 1] || args[index + 1].startsWith("--")) throw new Error(`${flag} requires a file path`);
  return args[index + 1];
}

export async function main(args = process.argv.slice(2)): Promise<void> {
  const allowed = new Set(["--apply", "--dry-run", "--data", "--notes", "--sql-out"]);
  for (const arg of args) {
    if (arg.startsWith("--") && !allowed.has(arg)) throw new Error(`Unknown option: ${arg}`);
  }
  if (args.includes("--apply") && args.includes("--dry-run")) {
    throw new Error("Choose --apply or --dry-run, not both");
  }
  if (args.includes("--apply") && args.includes("--sql-out")) {
    throw new Error("Choose --apply or --sql-out, not both");
  }
  if (args.includes("--dry-run") && args.includes("--sql-out")) {
    throw new Error("Choose --dry-run or --sql-out, not both");
  }
  const dataPath = resolve(
    valueAfter(args, "--data") ?? process.env.HANU_FOOD_DATA_CSV ?? join(homedir(), "Downloads", DATA_FILE),
  );
  const notesPath = resolve(
    valueAfter(args, "--notes") ?? process.env.HANU_FOOD_NOTES_CSV ?? join(homedir(), "Downloads", NOTES_FILE),
  );
  const catalog = buildCatalog(readFileSync(dataPath, "utf8"), readFileSync(notesPath, "utf8"));
  console.log(`CSV: ${basename(dataPath)}, ${basename(notesPath)}`);
  printSummary(catalog);
  const sqlOutput = valueAfter(args, "--sql-out");
  if (sqlOutput) {
    const outputPath = resolve(sqlOutput);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, generateSeedSql(catalog), "utf8");
    console.log(`SQL seed saved: ${outputPath}`);
    return;
  }
  if (!args.includes("--apply")) {
    console.log("Dry run only. Pass --apply after migrations are present and a server-side Supabase key is available.");
    return;
  }
  const envPath = resolve(".env.local");
  if (existsSync(envPath)) process.loadEnvFile(envPath);
  await applyCatalog(catalog);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
