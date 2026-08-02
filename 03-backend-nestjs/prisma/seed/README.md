# ShopHub seed script

Produces a realistic-looking dev dataset — not flat/uniform test fixtures — for the
whole schema: users, shops, categories, products/variants/images, carts, orders
(items/payments/shipments), reviews, wishlists, vouchers.

## Run it

```bash
npm run seed
```

Truncates and reseeds the database this backend's `DATABASE_URL` points at (see
`.env`) — safe to re-run any time, but **never point this at a shared/staging/prod
database**. Takes ~5-8 seconds locally.

All seeded accounts share the password `Password123!`. Admin login is
`admin@shophub.vn`; seller/buyer accounts are `seller.*@...` / `buyer.*@...` — look
them up in the `users` table if you need a specific one.

## What makes this not look like `faker.commerce.productName()` output

- **Product names/images** come from DummyJSON + Fake Store API (real product
  titles/photos, fetched live at seed time) supplemented by a curated static list
  of ~230 real product names per category (`data/curated-products.ts`) so total
  volume doesn't depend on the external APIs staying up — if both are unreachable,
  the seed still runs fine off the curated lists alone (just without photos).
- **Curated-list products also get a real photo**, not a blank product page —
  `lib/external-products.ts#buildCategoryImagePools` groups every fetched
  API photo by category, and a curated product borrows a random real photo from
  its own category's pool (the same way real sellers often reuse similar stock
  photography across near-identical listings). Book titles in "Sách & Văn phòng
  phẩm" get an actual matching cover from Open Library instead (free, keyless;
  searched by the book's *original* English title/author since Open Library's
  catalog is overwhelmingly English — see `BOOK_COVER_SEARCH_QUERY` in
  `data/curated-products.ts`). Last run: **64% of products have a real photo**
  overall, 100% in every category that has *any* matching external source.
  "Mẹ & Bé" (baby products) is the one category with no photos at all — neither
  API has a baby/kids category or search hits, and there's no honest way to
  reuse an unrelated category's photos for it, so it's left imageless rather
  than mismatched. 2 of the 8 curated book titles (Vietnamese-original
  bestsellers with no confirmed English edition) are skipped the same way.
- **Vietnamese names/addresses** are built from curated real name/place data
  (`data/vietnamese-names.ts`, `data/vietnam-locations.ts`) — weighted surname
  frequency (Nguyễn/Trần/Lê dominate, matching reality), real provinces/districts,
  not `faker.person.fullName()`.
- **Review text** is drawn from a small bank of realistic Vietnamese phrases per
  rating tier (`data/review-phrases.ts`), not Lorem Ipsum — including a ~15% chance
  of no comment at all, like real reviews.

## Distributions (see `lib/random.ts`, `lib/order-time.ts`)

Nothing here is uniform random — that's what would make it read as synthetic:

| What | How |
|---|---|
| Product popularity | Zipf-weighted (`zipfWeights`) — ~20% of products get picked for ~80% of order items/reviews/wishlists |
| Pricing | Per-category VND range (`data/categories.ts`), skewed toward the low end on a log scale, ~40% get a "...900,000"-style psychological price |
| Ratings | Each product has its own quality center (`gaussian(4.2, 0.35)`), individual reviews cluster around it, plus an 8% long-tail complaint chance regardless of quality |
| Order timestamps | Weighted by weekday (weekend boost), VN shopping-campaign days (9/9, 10/10, 11/11, 12/12, Tết ±4 days), and evening browsing hours (peak 20-22h) |
| Stock | Most variants 5-50 units; the top ~15% by popularity get 150-400 ("hot" restocked items) |
| Seller size | 3 power sellers (50-80 products), 5 mid (20-35), 10 long-tail (5-15) |
| Order status | Funnel by order age — recent orders are still pending/confirmed/shipped, orders older than ~6 days are ~92% delivered / ~8% cancelled |

## Relational consistency

- Order items snapshot `productNameSnapshot`/`variantAttrsSnapshot`/`unitPrice` at
  order time, per the snapshot pattern in `DATABASE.md` §2 — never re-derived from
  the live product row.
- Cart items never exceed the variant's actual `stockQuantity`.
- Reviews are only generated for order items whose *order* status is `delivered`
  (`REVIEW_CANDIDATE` list built in `steps/07-orders.ts`, consumed in
  `steps/08-reviews.ts`) — a review literally cannot exist without a completed
  purchase by that reviewer, mirroring the `reviews.order_item_id UNIQUE` constraint.
- `products.sold_count`/`rating_avg` and `shops.total_sold`/`rating_avg` aren't
  tracked incrementally through the run — `steps/10-aggregates.ts` recomputes them
  from the actual seeded orders/reviews at the end via SQL, so they can't drift out
  of sync with what's really in the tables.

## Volume (this run, will vary slightly — randomness + live external APIs)

~18 sellers · ~420-430 products · ~950-1050 variants · 50 buyers · 950 orders ·
~2000-2100 order items · ~700-770 reviews (~40% of delivered items) · 10-20 open
carts · 12 vouchers.

## Why `npm run seed` shells out to `run.js` instead of `ts-node` directly

The generated Prisma client (`generated/prisma/client.ts`, Prisma 7's new
`prisma-client` generator) uses NodeNext-style relative imports with `.js`
extensions pointing at sibling `.ts` files. That only resolves correctly once
`tsc` has actually emitted matching `.js` files (exactly how `nest build` runs
the app in production) — plain `ts-node` doesn't remap those `.js` specifiers back
to `.ts` at runtime and fails with `MODULE_NOT_FOUND`. `run.js` builds the project
with `tsc` first (ignoring its exit code — two pre-existing spec files unrelated to
this script fail type-check but `tsc` still emits everything else) then runs the
compiled `dist/prisma/seed/index.js`. This is also why the script chain isn't just
inlined as `"seed": "tsc && node ..."` in `package.json` — `;`/`&&` behave
differently across cmd.exe/PowerShell/bash, so the "build, ignore its exit code,
then run" logic lives in a small cross-platform Node script instead.
