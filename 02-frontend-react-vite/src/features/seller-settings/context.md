# Feature: seller-settings

## Purpose
Renders `/seller/settings` — Shop Settings screen with a left sub-nav (Shop info /
Liên hệ & địa chỉ / Vận chuyển / Thanh toán / Thông báo) driving a right-hand panel,
per `Shop Settings.dc.html`.

## Key decisions
- **Only "Shop info" is real.** The API only backs `name` via `PATCH /shops/me`.
  The other 4 sections render their designed fields via `ComingSoonSection` but
  show an info banner and, on submit, an honest "Tính năng sắp ra mắt" toast
  instead of silently no-oping — mirrors how `01-frontend-nextjs`'s
  `ForgotPasswordForm` handles a deferred backend feature.
- **No `GET /shops/me` exists** (API_SPEC.md only lists `PATCH /shops/me`). This
  feature's `getMyShop()` calls `PATCH /shops/me` with an empty body `{}` — every
  field in the shop PATCH DTO is optional, so this is a harmless no-op update that
  still returns the current shop, giving us `id`/`name`/`slug` without a dedicated
  read endpoint. Cached with a 5-minute `staleTime` since shop identity rarely
  changes.
- **`seller-products` depends on this feature's `useMyShop`/`getMyShop`** (imported
  via this feature's barrel `index.ts`, which is allowed per
  `FRONTEND-PROJECT-RULES.md` §3 — cross-feature imports must go through the
  barrel) to resolve its own `shopId` for `GET /products?shopId=`, since the public
  catalog endpoint has no "my shop's products" shortcut.

## Owner
Built as part of the Seller Center feature pass (dashboard/products/orders/inventory/settings).
