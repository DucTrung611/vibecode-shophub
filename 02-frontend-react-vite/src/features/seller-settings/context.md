# Feature: seller-settings

## Purpose
Renders `/seller/settings` — Shop Settings screen with a left sub-nav (Shop info /
Liên hệ & địa chỉ / Vận chuyển / Thanh toán / Thông báo) driving a right-hand panel,
per `Shop Settings.dc.html`. All 5 sections are real, backed by `GET`/`PATCH /shops/me`.

## Key decisions
- **`getMyShop()` calls `GET /shops/me`** (added to the backend alongside this
  work — previously there was no read endpoint, so this feature called
  `PATCH /shops/me` with an empty body as a workaround; that's gone now).
- **Contact/Shipping/Payment/Notifications write through the same `PATCH /shops/me`**
  as Shop info — the backend added `phone`/`email`/`province`/`district`/`ward`/
  `detailAddress` as plain columns and `shippingSettings`/`paymentSettings`/
  `notificationSettings` as free-form JSONB (see backend `shop/context.md`). Each
  section's form only sends its own slice of the payload; unrelated fields are
  `undefined` and the DTO leaves them untouched server-side.
- **Logo/banner are separate upload endpoints** (`POST /shops/me/logo`,
  `POST /shops/me/banner`, multipart, single file each), not part of the
  `PATCH /shops/me` JSON body — `useUploadShopLogo`/`useUploadShopBanner` in
  `hooks/useUploadShopImage.ts`. Returned URLs are relative (`/uploads/shops/...`);
  resolved to an absolute `<img src>` via `shared/utils/asset-url.ts#getAssetUrl`.
- **`seller-products` depends on this feature's `useMyShop`/`getMyShop`** (imported
  via this feature's barrel `index.ts`, which is allowed per
  `FRONTEND-PROJECT-RULES.md` §3 — cross-feature imports must go through the
  barrel) to resolve its own `shopId` for `GET /products?shopId=`, since the public
  catalog endpoint has no "my shop's products" shortcut.

## Owner
Built as part of the Seller Center feature pass (dashboard/products/orders/inventory/settings);
Contact/Shipping/Payment/Notifications + logo/banner filled in once the backend
gained `GET /shops/me` and the settings-fields/logo/banner endpoints.
