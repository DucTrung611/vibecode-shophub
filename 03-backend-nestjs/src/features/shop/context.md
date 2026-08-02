# Feature: shop

## Purpose
Shop creation/onboarding, own-shop management (profile, settings, logo/banner), and admin approval workflow.

## Key decisions
- **Shipping/Payment/Notification settings are free-form JSONB** (`shippingSettings`, `paymentSettings`, `notificationSettings` on `shops`), not dedicated columns/tables — same rationale as `product_variants.attributes` in DATABASE.md: the Shop Settings screen's sub-tabs don't have a stable, finalized shape yet, and JSONB avoids a migration per new setting. `UpdateShopDto` accepts them as arbitrary objects (`@IsObject()`); no server-side shape validation beyond "is an object". If a setting becomes load-bearing for business logic (e.g. actually computing shipping fees from `shippingSettings`), promote it to real columns then.
- **`GET /shops/me` added alongside the existing `PATCH /shops/me`.** The public `GET /shops/:slug` intentionally can't be reused for the seller's own settings forms — it's meant for buyer-facing storefront data, not the full row (documents, rejection reason, contact/payment settings). `GET /shops/me` returns the full owned `ShopEntity`.
- **Logo/banner upload mirrors the catalog product-image pattern** (`shop-image.multer-config.ts`, local `diskStorage` under `uploads/shops/`, served at `/uploads/shops/*`) — same dev-friendly stand-in for S3, see `catalog/context.md`. Kept as two single-file endpoints (`POST /shops/me/logo`, `POST /shops/me/banner`) rather than one generic "shop images" endpoint because logo/banner are semantically distinct single slots, not an ordered gallery like product images.

## Owner
Shop settings/logo/banner endpoints added when closing out the API_SPEC gaps found during the Seller Center Shop Settings screen audit (4 of 5 sub-tabs had no backing endpoint).
