# Feature: catalog

## Purpose
Categories, products, and product variants — the buyer-facing browsing surface and the seller-facing product management API.

## Key decisions
- **Image upload stored on local disk, not S3.** `POST /products/:id/images` accepts up to 10 files (field `images`, jpeg/png/webp, 5MB max each — see `product-image.multer-config.ts`), saves them under `<repo>/uploads/products/` via Multer `diskStorage`, and persists `product_images` rows with a `/uploads/products/<file>` URL. `main.ts` serves that folder statically at `/uploads` (outside the `/api` prefix). This is a dev-friendly stand-in for the S3-compatible object storage described in API_SPEC.md — swap `diskStorage` for an S3 multer adapter when object storage is provisioned; the DB/URL shape stays the same.
- **Category tree assembled in JS**, not a recursive CTE — fine at this data scale (see `category.repository.ts`); revisit if the category count grows large.
- **`sortBy` whitelist trimmed to `createdAt|soldCount|ratingAvg`** — `price` lives on `product_variants`, not `products`, so sorting by it needs either a denormalized min-price column or a raw query. Deferred.
- **Ownership checks** (`PATCH/DELETE /products/:id`, variant routes) compare `product.shop.ownerId` to the caller — fetched via a single Prisma `include`, not a cross-feature service call. The only cross-feature dependency is `SHOP_PORT.findByOwnerId` in `createProduct` (resolving the caller's own shop).
- **Public listing defaults to `status=active`** when the caller doesn't pass `status` explicitly — sellers/admins can still query other statuses via the query param (no additional guard on that param at this scope; revisit once a seller product-management UI exists and needs to see its own `draft` items by default).
- **`GET /admin/products` (flagged list) includes full moderation history**, not just the current `flagReason`. `PRODUCT_FLAGGED_INCLUDE` (`entities/product.entity.ts`) joins `moderationLogs` (newest first, with the acting admin's `id`/`fullName`) — this is deliberately a wider include than the public `PRODUCT_LIST_INCLUDE`/`PRODUCT_DETAIL_INCLUDE` so moderation-only data never leaks into buyer-facing responses. There's no separate `GET /admin/products/:id`; the admin moderation UI is expected to render its detail view/modal from the row it already has in the list.

## Owner
Built as part of the initial vibecode pass, right after the minimal `shop` feature it depends on.
