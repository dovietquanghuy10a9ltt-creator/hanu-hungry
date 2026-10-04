/**
 * Read-only live checks for the HANU Hungry Supabase schema and CSV import.
 *
 * node scripts/verify-database.ts
 * node scripts/verify-database.ts --expect-seed
 *
 * Optional: HANU_VERIFY_USER_ACCESS_TOKEN and HANU_VERIFY_ADMIN_ACCESS_TOKEN
 * add read-only role checks. Tokens and keys are never printed.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const EXPECTED = {
  restaurants: 59,
  dishes: 950,
  categories: 17,
  categoryLinks: 30,
  unknownNumericPrices: 4,
  missingRestaurantAddresses: 9,
  missingRestaurantCategories: 29,
};

type Row = Record<string, unknown>;
type Client = ReturnType<typeof createClient>;
type RpcResult = { data: unknown; error: { code?: string; message: string } | null };

function makeClient(url: string, key: string, accessToken?: string): Client {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    ...(accessToken ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } } : {}),
  });
}

async function fetchAll(client: Client, table: string, columns: string, orderBy = "id"): Promise<Row[]> {
  const rows: Row[] = [];
  for (let from = 0; ; from += 500) {
    const { data, error } = await client.from(table).select(columns).order(orderBy).range(from, from + 499);
    if (error) throw new Error(`${table} SELECT failed: ${error.code ?? "unknown"} ${error.message}`);
    const page = (data ?? []) as unknown as Row[];
    rows.push(...page);
    if (page.length < 500) return rows;
  }
}

async function count(client: Client, table: string): Promise<number> {
  const { count: value, error } = await client.from(table).select("*", { count: "exact", head: true });
  if (error) throw new Error(`${table} COUNT failed: ${error.code ?? "unknown"} ${error.message}`);
  if (value === null) throw new Error(`${table} COUNT missing`);
  return value;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function rpc(client: Client, name: string, args?: Record<string, unknown>): Promise<RpcResult> {
  // This project has no generated Supabase Database type yet. Keep the cast at
  // the RPC boundary and verify the returned shape at each call site.
  return await client.rpc(name as never, args as never) as unknown as RpcResult;
}

async function verifyAnonymous(client: Client): Promise<void> {
  const publicTables = ["restaurants", "dishes", "categories", "restaurant_categories", "site_settings"];
  for (const table of publicTables) {
    const total = await count(client, table);
    console.log(`anon ${table}: ${total}`);
  }

  // A successful zero-row response from a protected table would still indicate
  // unintended SELECT permission, so require a permission error instead.
  const protectedTables = ["profiles", "check_ins", "contact_messages", "notifications", "admin_audit_logs"];
  for (const table of protectedTables) {
    const result = await client.from(table).select("*", { count: "exact", head: true });
    assert(result.error && (result.status === 401 || result.status === 403), `anon SELECT ${table} was not denied by privileges`);
    console.log(`anon ${table}: denied (HTTP ${result.status})`);
  }

  const normalize = await rpc(client, "normalize_search", { input_text: "Đồ Hàn" });
  if (normalize.error) throw new Error(`normalize_search failed: ${normalize.error.message}`);
  assert(normalize.data === "do han", "normalize_search returned an unexpected value");
  const search = await rpc(client, "search_restaurants", {
    query: null,
    category_slug: null,
    max_price_vnd: null,
    limit_count: 100,
  });
  if (search.error) throw new Error(`search_restaurants failed: ${search.error.message}`);
  const searchRows = search.data;
  assert(Array.isArray(searchRows), "search_restaurants did not return rows");
  console.log(`anon search_restaurants: ${searchRows.length} rows (limited to 100)`);

  const vietnameseSearch = await rpc(client, "search_restaurants", {
    query: "bun bo hue",
    category_slug: null,
    max_price_vnd: null,
    limit_count: 100,
  });
  if (vietnameseSearch.error) throw new Error(`Vietnamese search failed: ${vietnameseSearch.error.message}`);
  const vietnameseRows = vietnameseSearch.data;
  assert(Array.isArray(vietnameseRows), "Vietnamese search did not return rows");
  if (searchRows.length > 0) {
    assert(vietnameseRows.some((row: Row) => row.name === "Bún bò Huế 18"), "Accent-insensitive search missed Bún bò Huế 18");
  }
  console.log(`anon accent-insensitive search: ${vietnameseRows.length} rows`);

  const zeroPriceSearch = await rpc(client, "search_restaurants", {
    query: null,
    category_slug: null,
    max_price_vnd: 0,
    limit_count: 100,
  });
  if (zeroPriceSearch.error) throw new Error(`Zero-price search failed: ${zeroPriceSearch.error.message}`);
  const zeroPriceRows = zeroPriceSearch.data;
  assert(Array.isArray(zeroPriceRows), "Zero-price search did not return rows");
  if (searchRows.length > 0) {
    assert(zeroPriceRows.length === 0, "A free accompaniment or surcharge is treated as a standalone 0đ dish");
  }
  console.log(`anon max_price_vnd=0: ${zeroPriceRows.length} rows`);

  for (const functionName of ["is_admin", "admin_analytics"]) {
    const { error } = await rpc(client, functionName);
    assert(error?.code === "42501", `anon can execute restricted function ${functionName}, or received an unexpected error`);
    console.log(`anon ${functionName}: denied (SQLSTATE ${error.code})`);
  }
}

async function verifySeed(client: Client): Promise<void> {
  const [restaurants, dishes, categories, links] = await Promise.all([
    fetchAll(client, "restaurants", "id,source_stt,address_text,is_active"),
    fetchAll(client, "dishes", "id,restaurant_id,source_key,source_row,price_text,price_min_vnd,price_max_vnd,is_active"),
    fetchAll(client, "categories", "id,slug"),
    fetchAll(client, "restaurant_categories", "restaurant_id,category_id", "restaurant_id"),
  ]);
  const seededRestaurants = restaurants.filter((row) => Number.isInteger(row.source_stt));
  const seededDishes = dishes.filter((row) => String(row.source_key ?? "").startsWith("food-csv:"));
  assert(seededRestaurants.length === EXPECTED.restaurants, `Expected ${EXPECTED.restaurants} seeded restaurants; found ${seededRestaurants.length}`);
  assert(seededDishes.length === EXPECTED.dishes, `Expected ${EXPECTED.dishes} seeded dishes; found ${seededDishes.length}`);
  assert(categories.length >= EXPECTED.categories, `Expected at least ${EXPECTED.categories} categories; found ${categories.length}`);
  assert(links.length >= EXPECTED.categoryLinks, `Expected at least ${EXPECTED.categoryLinks} category links; found ${links.length}`);

  const stts = seededRestaurants.map((row) => Number(row.source_stt));
  const sourceKeys = seededDishes.map((row) => String(row.source_key));
  assert(new Set(stts).size === stts.length, "Duplicate restaurant source_stt");
  assert(new Set(sourceKeys).size === sourceKeys.length, "Duplicate dish source_key");
  assert(stts.every((stt) => stt >= 1 && stt <= 59), "Seeded restaurant STT outside 1–59");
  assert(seededRestaurants.every((row) => row.is_active === true), "Seeded restaurant not publicly active");
  assert(seededDishes.every((row) => row.is_active === true), "Seeded dish not publicly active");
  const restaurantIds = new Set(seededRestaurants.map((row) => String(row.id)));
  assert(seededDishes.every((row) => restaurantIds.has(String(row.restaurant_id))), "Seeded dish has no visible seeded restaurant");

  const unknownPrices = seededDishes.filter((row) => row.price_text !== null && row.price_min_vnd === null);
  const missingAddresses = seededRestaurants.filter((row) => row.address_text === null);
  const categorizedRestaurantIds = new Set(links.map((row) => String(row.restaurant_id)));
  const missingCategories = seededRestaurants.filter((row) => !categorizedRestaurantIds.has(String(row.id)));
  assert(unknownPrices.length === EXPECTED.unknownNumericPrices, `Expected ${EXPECTED.unknownNumericPrices} text-only prices; found ${unknownPrices.length}`);
  assert(missingAddresses.length === EXPECTED.missingRestaurantAddresses, `Expected ${EXPECTED.missingRestaurantAddresses} missing addresses; found ${missingAddresses.length}`);
  assert(missingCategories.length === EXPECTED.missingRestaurantCategories, `Expected ${EXPECTED.missingRestaurantCategories} uncategorized restaurants; found ${missingCategories.length}`);
  assert(seededDishes.every((row) =>
    row.price_max_vnd === null ||
    (typeof row.price_min_vnd === "number" && typeof row.price_max_vnd === "number" && row.price_max_vnd >= row.price_min_vnd),
  ), "Invalid dish price bounds");

  console.log(`seed verified: ${seededRestaurants.length} restaurants, ${seededDishes.length} dishes, ${categories.length} categories, ${links.length} links`);
  console.log(`source gaps: ${missingAddresses.length} addresses, ${missingCategories.length} restaurant categories, ${unknownPrices.length} text-only prices`);
}

async function verifySession(url: string, key: string, token: string, label: "USER" | "ADMIN"): Promise<void> {
  const client = makeClient(url, key, token);
  const { data: userData, error: userError } = await client.auth.getUser(token);
  if (userError || !userData.user) throw new Error(`${label} token is not a valid user session`);
  const { data: profiles, error: profileError } = await client.from("profiles").select("id,role");
  if (profileError) throw new Error(`${label} profile read failed: ${profileError.message}`);
  const profileRows = (profiles ?? []) as unknown as Array<{ id: string; role: string }>;
  assert(profileRows.length === 1 && profileRows[0].id === userData.user.id, `${label} session can read more or fewer than its own profile`);
  assert(profileRows[0].role === label, `${label} profile has unexpected role`);
  const { data: isAdmin, error: adminError } = await rpc(client, "is_admin");
  if (adminError) throw new Error(`${label} is_admin failed: ${adminError.message}`);
  assert(isAdmin === (label === "ADMIN"), `${label} is_admin result is incorrect`);
  const analytics = await rpc(client, "admin_analytics");
  if (label === "ADMIN") {
    if (analytics.error) throw new Error(`ADMIN analytics failed: ${analytics.error.message}`);
    assert(analytics.data && typeof analytics.data === "object", "ADMIN analytics did not return an object");
  } else {
    assert(analytics.error?.code === "42501", "USER can execute admin_analytics, or received an unexpected error");
  }
  console.log(`${label} session: own profile and admin RPC permissions verified`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--expect-seed")) throw new Error("Only --expect-seed is supported");
  const envPath = resolve(".env.local");
  if (existsSync(envPath)) process.loadEnvFile(envPath);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required");
  const anon = makeClient(url, key);
  await verifyAnonymous(anon);
  if (args.includes("--expect-seed")) await verifySeed(anon);
  const userToken = process.env.HANU_VERIFY_USER_ACCESS_TOKEN;
  const adminToken = process.env.HANU_VERIFY_ADMIN_ACCESS_TOKEN;
  if (userToken) await verifySession(url, key, userToken, "USER");
  if (adminToken) await verifySession(url, key, adminToken, "ADMIN");
  if (!userToken || !adminToken) console.log("Session RLS checks pending: provide USER and ADMIN access tokens in environment to run both.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
