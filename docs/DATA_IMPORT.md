# HANU Hungry data import

The import source consists of two UTF-8 CSV exports:

- `HANU_Hungry_FoodData.xlsx - Data quan an.csv`
- `HANU_Hungry_FoodData.xlsx - Ghi chú.csv`

The importer reads them from the current user's `Downloads` directory by default. Use `--data` and `--notes` to pass other paths. It does not edit either CSV.

## Source audit

The food CSV has a title row, a header row and 1,003 data rows. `STT` values 1–59 identify 59 distinct restaurants in 10 areas. Repeated `STT` rows represent dishes. There are 950 dish rows for 34 restaurants. Of those dishes, 874 have a source price and 76 do not. The remaining 53 rows contain restaurant details without a dish. Nine restaurants lack an address, and 29 lack a category. No dish name repeats within one restaurant in this export.

Prices are text in the source. The importer preserves this text and derives numeric minimum and maximum VND only when it can parse every component as a standalone menu price. Source formats include single prices, ranges, S/M/L size prices and per-unit prices. `None` and `?K - 40,000` remain without numeric bounds. `+5,000` is a topping surcharge, and `Miễn phí` is a free accompaniment; neither is used as a numeric restaurant price.

The notes CSV lists 13 suggested categories and says that one restaurant can have several categories separated by commas. The source food CSV also contains categories outside that list (`Đồ uống`, `Đồ Hàn`, `Đồ Nhật`, `Bún`). The importer seeds the union and keeps the exact category labels. The notes CSV says all addresses are blank, but that statement is outdated: 50 restaurants have a nonempty address field, usually a plus code. Some precise addresses and phone numbers are only in restaurant notes and remain unparsed text for human review.

## Run

Apply the schema migration first. A server-side Supabase key is required for a live import. Set `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY` in the process environment or the local `.env.local` file. Keep this value out of `NEXT_PUBLIC_` variables and Git.

```powershell
node scripts/import-food-data.ts --dry-run
node scripts/import-food-data.ts --apply
node scripts/import-food-data.ts --sql-out supabase/seed.sql
```

Custom source paths:

```powershell
node scripts/import-food-data.ts --dry-run --data "C:\path\Data quan an.csv" --notes "C:\path\Ghi chú.csv"
```

The default mode is a dry run. It validates CSV structure, restaurant consistency, duplicate dish identity and category slug collisions, then reports record counts and prices requiring review. It makes no network request. `--apply` imports in batches after the checks pass. `--sql-out` generates an idempotent, transactional SQL seed from the same parser and does not contact Supabase. The checked-in `supabase/seed.sql` can be used with `supabase db push --include-seed` after the schema migration is reviewed. Run the dry run and review migration state before applying.

## Identity and update behavior

- Restaurants upsert on `source_stt`.
- Categories upsert on `slug`.
- Dishes carry `source_key = food-csv:<STT>:<SHA-256 of normalized dish name>` and a 1-based `source_row` for traceability. `source_key` is stable if rows are reordered; `source_row` is informational and has no uniqueness requirement.
- Restaurant/category links are added when absent.
- Missing CSV prices, notes and addresses do not erase previously enriched values. Source values that are present refresh those fields. Existing descriptions, images, coordinates and `is_active` values are untouched. Records missing from a later CSV are not deleted.

The import is safe to rerun with the same source. If a dish is renamed in the CSV, its source key changes and the old dish remains. Review that case manually before running a new source revision. The importer does not infer coordinates from plus codes, translate categories, or invent missing menu prices.

## Verification

```powershell
node --test scripts/import-food-data.test.mjs
node scripts/import-food-data.ts --dry-run
```

After a live import, compare restaurant, dish and category counts with the dry-run summary and spot-check a restaurant with size prices, one with missing prices, and one with restaurant notes. A second `--apply` should leave row counts unchanged.

Read-only live validation uses the publishable key from `.env.local`:

```powershell
node scripts/verify-database.ts
node scripts/verify-database.ts --expect-seed
```

The first command checks public schema access, protected table denial and search RPCs. The second also checks imported record counts, source identity uniqueness, price bounds and source gaps. To check USER and ADMIN sessions, set `HANU_VERIFY_USER_ACCESS_TOKEN` and `HANU_VERIFY_ADMIN_ACCESS_TOKEN` in the process environment. The verifier reads only; it never prints tokens or writes to the database.
