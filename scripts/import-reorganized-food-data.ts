/**
 * Import reorganized food data from:
 * "D:\hanu-hungry\HANU_Hungry_FoodData_organized_v2 (1)(Món ăn đã phân lại).csv"
 * into Supabase catalog.
 *
 * Usage:
 *   node --env-file=.env.local scripts/import-reorganized-food-data.ts --dry-run
 *   node --env-file=.env.local scripts/import-reorganized-food-data.ts --apply
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const CSV_FILE = 'D:/hanu-hungry/HANU_Hungry_FoodData_organized_v2 (1)(Món ăn đã phân lại).csv';
const UUID_NAMESPACE = '6ecfa3c308e05ba99a230f8f8d6b0a16';

export function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
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
      if (cell !== '') throw new Error(`Unexpected quote in CSV row ${rows.length + 1}`);
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\r' || char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      if (char === '\r' && text[i + 1] === '\n') i += 1;
    } else {
      cell += char;
    }
  }
  if (quoted) throw new Error('CSV ends inside a quoted field');
  if (row.length > 0 || cell !== '') rows.push([...row, cell]);
  return rows;
}

export function normalizeStr(s: string): string {
  return (s || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/y/g, 'i')
    .replace(/[^a-z0-9]/g, '');
}

export function parsePrice(raw: string | null): { priceText: string | null; minVnd: number | null; maxVnd: number | null } {
  if (!raw || !raw.trim()) {
    return { priceText: null, minVnd: null, maxVnd: null };
  }
  const priceText = raw.trim().replace(/\s+/g, ' ');
  if (normalizeStr(priceText) === 'mienphi') {
    return { priceText, minVnd: 0, maxVnd: 0 };
  }

  // Extract all numbers that represent thousand VND amounts
  // Examples: 25,000; 30,000; 10000; 15,000
  const matches = [...priceText.matchAll(/(?:\b|:)\s*(\d{1,3}(?:,\d{3})+|\d{4,7})\b/g)];
  if (matches.length > 0) {
    const values = matches
      .map((m) => Number(m[1].replace(/,/g, '')))
      .filter((v) => Number.isSafeInteger(v) && v > 0);
    if (values.length > 0) {
      return {
        priceText,
        minVnd: Math.min(...values),
        maxVnd: Math.max(...values),
      };
    }
  }

  return { priceText, minVnd: null, maxVnd: null };
}

export function stableUuid(key: string): string {
  const bytes = createHash('sha1')
    .update(Buffer.from(UUID_NAMESPACE, 'hex'))
    .update(key, 'utf8')
    .digest()
    .subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

interface ParsedDish {
  sourceRow: number;
  name: string;
  priceText: string;
  minVnd: number | null;
  maxVnd: number | null;
  section: string | null;
  notes: string | null;
}

interface ParsedRestaurant {
  csvStt: string;
  name: string;
  area: string;
  sections: string[];
  dishes: ParsedDish[];
}

export function parseReorganizedCsv(filePath: string): ParsedRestaurant[] {
  const content = readFileSync(filePath, 'utf-8');
  const rows = parseCsv(content);

  const restaurants: ParsedRestaurant[] = [];
  let cur: ParsedRestaurant | null = null;
  let curSection: string | null = null;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const stt = row[0]?.trim();
    const name = row[1]?.trim().replace(/\r?\n/g, ' ');
    const area = row[2]?.trim();
    const dish = row[3]?.trim();
    const price = row[4]?.trim();
    const note = row[5]?.trim();

    // Check if new restaurant starts
    if (stt && name) {
      if (!cur || normalizeStr(cur.name) !== normalizeStr(name)) {
        cur = {
          csvStt: stt,
          name,
          area: area || (cur ? cur.area : ''),
          sections: [],
          dishes: [],
        };
        restaurants.push(cur);
        curSection = null;
      }
    } else if (name && !stt && cur && normalizeStr(cur.name) !== normalizeStr(name)) {
      // Handles typo variations within same block (e.g. Tacos nhà la bu)
      if (normalizeStr(cur.name).includes('tacos') && normalizeStr(name).includes('tacos')) {
        // same restaurant
      } else {
        // If it's a completely new name without STT
        cur = {
          csvStt: cur.csvStt,
          name,
          area: area || cur.area,
          sections: [],
          dishes: [],
        };
        restaurants.push(cur);
        curSection = null;
      }
    }

    if (!cur) continue;

    // Check row item
    if (dish && !price) {
      // Section header (e.g. "Đồ ăn vặt", "Đồ uống")
      curSection = dish;
      if (!cur.sections.includes(curSection)) {
        cur.sections.push(curSection);
      }
    } else if (dish && price) {
      // Dish item
      const parsedP = parsePrice(price);
      let combinedNotes: string | null = null;
      if (curSection && note) {
        combinedNotes = `[${curSection}] ${note}`;
      } else if (curSection) {
        combinedNotes = `[${curSection}]`;
      } else if (note) {
        combinedNotes = note;
      }

      cur.dishes.push({
        sourceRow: i + 1,
        name: dish,
        priceText: parsedP.priceText ?? price,
        minVnd: parsedP.minVnd,
        maxVnd: parsedP.maxVnd,
        section: curSection,
        notes: combinedNotes,
      });
    }
  }

  return restaurants;
}

const KNOWN_ALIASES: Record<string, string> = {
  [normalizeStr('Bánh mỳ Sài Gòn')]: normalizeStr('Bánh Mì Sài Gòn'),
  [normalizeStr('Bánh mì anh Tuấn')]: normalizeStr('Anh Tuấn bánh mỳ'),
  [normalizeStr('Bánh Mì Xôi')]: normalizeStr('Bánh mỳ, xôi chả'),
  [normalizeStr('Uji-don')]: normalizeStr('UIJ-DON'),
  [normalizeStr('Bún cá Hoàn Tà Lồ')]: normalizeStr('Bún Cá'),
  [normalizeStr('Malatang')]: normalizeStr('Malatang Chị Yến'),
  [normalizeStr('Bloom& Cafe')]: normalizeStr('Bloom&'),
  [normalizeStr('Tacos nhà labubu')]: normalizeStr('Tacos nhà la bu'),
  [normalizeStr('TORA COFFE')]: normalizeStr('Tora coffee'),
  [normalizeStr('Bánh mỳ')]: normalizeStr('Quán bánh mì nem khoai'),
};

async function main() {
  const isApply = process.argv.includes('--apply');
  const isDryRun = process.argv.includes('--dry-run') || !isApply;

  console.log(`=== HANU Hungry Food Data Import ===`);
  console.log(`Mode: ${isApply ? 'APPLY (Write to Database)' : 'DRY RUN (Read Only)'}`);
  console.log(`Target CSV: ${CSV_FILE}`);

  const parsedRestaurants = parseReorganizedCsv(CSV_FILE);
  const totalDishes = parsedRestaurants.reduce((sum, r) => sum + r.dishes.length, 0);

  console.log(`Parsed Restaurants from CSV: ${parsedRestaurants.length}`);
  console.log(`Parsed Dishes from CSV: ${totalDishes}`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Fetch all existing restaurants and dishes
  const { data: dbRests, error: restErr } = await supabase.from('restaurants').select('*');
  if (restErr) throw new Error(`Failed to fetch restaurants: ${restErr.message}`);

  const { data: dbDishes, error: dishErr } = await supabase.from('dishes').select('*');
  if (dishErr) throw new Error(`Failed to fetch dishes: ${dishErr.message}`);

  // Fetch existing check_ins to ensure foreign keys won't be broken
  const { data: checkIns, error: checkErr } = await supabase.from('check_ins').select('id, dish_id, restaurant_id');
  if (checkErr) throw new Error(`Failed to fetch check_ins: ${checkErr.message}`);
  const referencedDishIds = new Set(checkIns.filter((c) => c.dish_id).map((c) => c.dish_id));

  console.log(`Database currently has: ${dbRests.length} restaurants, ${dbDishes.length} dishes, ${referencedDishIds.size} referenced dishes in check_ins.`);

  // Find max source_stt for new restaurants
  let maxSourceStt = Math.max(...dbRests.map((r) => r.source_stt || 0), 60);

  const matchedShops: {
    csv: ParsedRestaurant;
    dbId: string;
    sourceStt: number;
    isNew: boolean;
  }[] = [];

  for (const cr of parsedRestaurants) {
    let crNorm = normalizeStr(cr.name);
    if (KNOWN_ALIASES[crNorm]) {
      crNorm = KNOWN_ALIASES[crNorm];
    }

    const found = dbRests.find((dr) => {
      const drNorm = normalizeStr(dr.name);
      return drNorm === crNorm || drNorm.includes(crNorm) || crNorm.includes(drNorm);
    });

    if (found) {
      matchedShops.push({
        csv: cr,
        dbId: found.id,
        sourceStt: found.source_stt,
        isNew: false,
      });
    } else {
      maxSourceStt++;
      matchedShops.push({
        csv: cr,
        dbId: stableUuid(`new-restaurant:${cr.name}`),
        sourceStt: maxSourceStt,
        isNew: true,
      });
    }
  }

  console.log(`\nMatched Restaurants: ${matchedShops.filter((m) => !m.isNew).length}`);
  console.log(`New Restaurants to Create: ${matchedShops.filter((m) => m.isNew).length}`);
  matchedShops.filter((m) => m.isNew).forEach((m) => console.log(`  + New: "${m.csv.name}" in ${m.csv.area}`));

  // Prepare dish operations
  const targetRestaurantIds = new Set(matchedShops.map((m) => m.dbId));
  const existingDishesInTargetRests = dbDishes.filter((d) => targetRestaurantIds.has(d.restaurant_id));

  // Build map of existing dishes by restaurant_id + normalized dish name
  const existingDishMap = new Map<string, typeof dbDishes[0]>();
  for (const d of existingDishesInTargetRests) {
    existingDishMap.set(`${d.restaurant_id}:${normalizeStr(d.name)}`, d);
  }

  type DishInsertRow = {
    id: string;
    restaurant_id: string;
    source_key: string;
    source_row: number;
    name: string;
    price_text: string | null;
    price_min_vnd: number | null;
    price_max_vnd: number | null;
    notes: string | null;
    is_active: boolean;
    updated_at: string;
  };

  const dishesToInsertOrUpdate: DishInsertRow[] = [];
  const keptDishIds = new Set<string>();

  for (const match of matchedShops) {
    for (const dish of match.csv.dishes) {
      const key = `${match.dbId}:${normalizeStr(dish.name)}`;
      const existing = existingDishMap.get(key);
      if (existing) {
        existingDishMap.delete(key);
      }

      // Stable ID: reuse existing dish ID if available and not yet used, otherwise deterministic UUID based on sourceRow
      let dishId = existing && !keptDishIds.has(existing.id) ? existing.id : stableUuid(`dish:${match.dbId}:${dish.sourceRow}:${dish.name}`);
      if (keptDishIds.has(dishId)) {
        dishId = stableUuid(`dish:${match.dbId}:${dish.sourceRow}:${Math.random()}`);
      }
      keptDishIds.add(dishId);

      const sourceKey = `reorg:${match.sourceStt}:${dish.sourceRow}:${normalizeStr(dish.name)}`;

      dishesToInsertOrUpdate.push({
        id: dishId,
        restaurant_id: match.dbId,
        source_key: sourceKey,
        source_row: dish.sourceRow,
        name: dish.name,
        price_text: dish.priceText,
        price_min_vnd: dish.minVnd,
        price_max_vnd: dish.maxVnd,
        notes: dish.notes,
        is_active: true,
        updated_at: new Date().toISOString(),
      });
    }
  }

  // Obsolete dishes are dishes in target restaurants that are not in the new CSV
  const obsoleteDishes = existingDishesInTargetRests.filter((d) => !keptDishIds.has(d.id));
  const obsoleteReferenced = obsoleteDishes.filter((d) => referencedDishIds.has(d.id));

  console.log(`\nDishes to Upsert: ${dishesToInsertOrUpdate.length}`);
  console.log(`Obsolete dishes to delete from updated restaurants: ${obsoleteDishes.length}`);
  if (obsoleteReferenced.length > 0) {
    console.log(`Note: ${obsoleteReferenced.length} obsolete dishes are referenced in check_ins (foreign key ON DELETE SET NULL will safely unlink them).`);
  }

  if (isDryRun) {
    console.log(`\n=== DRY RUN COMPLETED SUCCESSFULLY ===`);
    console.log(`To apply these changes to the Supabase database, run with: --apply`);
    return;
  }

  // --- APPLY PHASE ---
  console.log(`\nApplying updates to Supabase...`);

  // 1. Upsert new restaurants
  const newRests = matchedShops
    .filter((m) => m.isNew)
    .map((m) => ({
      id: m.dbId,
      name: m.csv.name,
      area: m.csv.area,
      source_stt: m.sourceStt,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

  if (newRests.length > 0) {
    const { error: insRestErr } = await supabase.from('restaurants').insert(newRests);
    if (insRestErr) throw new Error(`Failed to insert new restaurants: ${insRestErr.message}`);
    console.log(`Inserted ${newRests.length} new restaurants.`);
  }

  // 2. Update matched restaurants (name and area)
  for (const m of matchedShops.filter((s) => !s.isNew)) {
    const { error: updRestErr } = await supabase
      .from('restaurants')
      .update({
        name: m.csv.name,
        area: m.csv.area,
        updated_at: new Date().toISOString(),
      })
      .eq('id', m.dbId);
    if (updRestErr) console.warn(`Warning updating restaurant ${m.csv.name}: ${updRestErr.message}`);
  }
  console.log(`Updated names/areas for ${matchedShops.filter((s) => !s.isNew).length} existing restaurants.`);

  // 3. Clean replacement of dishes:
  // First, delete obsolete dishes in target restaurants that are NOT referenced in check_ins
  const targetIdsList = Array.from(targetRestaurantIds);
  console.log(`Clearing existing unreferenced dishes for ${targetIdsList.length} target restaurants...`);
  
  // Fetch all existing dishes for target restaurants to get IDs to delete
  const { data: dishesToDelete } = await supabase
    .from('dishes')
    .select('id')
    .in('restaurant_id', targetIdsList);

  if (dishesToDelete && dishesToDelete.length > 0) {
    const idsToDelete = dishesToDelete.map((d) => d.id).filter((id) => !referencedDishIds.has(id));
    console.log(`Deleting ${idsToDelete.length} unreferenced dishes...`);
    for (let i = 0; i < idsToDelete.length; i += 200) {
      const chunk = idsToDelete.slice(i, i + 200);
      const { error: delErr } = await supabase.from('dishes').delete().in('id', chunk);
      if (delErr) throw new Error(`Failed to delete old dishes: ${delErr.message}`);
    }
  }

  // 4. Insert/Upsert new dishes in chunks of 100
  console.log(`Inserting/Upserting ${dishesToInsertOrUpdate.length} dishes in batches of 100...`);
  for (let i = 0; i < dishesToInsertOrUpdate.length; i += 100) {
    const chunk = dishesToInsertOrUpdate.slice(i, i + 100);
    const { error: upsertErr } = await supabase.from('dishes').upsert(chunk, { onConflict: 'id' });
    if (upsertErr) throw new Error(`Dishes upsert failed at batch ${i}: ${upsertErr.message}`);
  }
  console.log(`Successfully upserted all ${dishesToInsertOrUpdate.length} dishes.`);

  console.log(`\n=== IMPORT FINISHED SUCCESSFULLY! ===`);
}

import { pathToFileURL } from 'node:url';

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((err) => {
    console.error('Fatal error during import:', err);
    process.exitCode = 1;
  });
}

