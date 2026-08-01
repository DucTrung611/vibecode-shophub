# Feature: catalog

## Purpose
Categories, products, and product variants — the buyer-facing browsing surface and the seller-facing product management API.

## Key decisions
- **Image upload deferred.** `POST /products/:id/images` (multipart → S3) is not implemented — no object storage configured yet. Products can be created/updated without images for now.
- **Category tree assembled in JS**, not a recursive CTE — fine at this data scale (see `category.repository.ts`); revisit if the category count grows large.
- **`sortBy` whitelist trimmed to `createdAt|soldCount|ratingAvg`** — `price` lives on `product_variants`, not `products`, so sorting by it needs either a denormalized min-price column or a raw query. Deferred.
- **Ownership checks** (`PATCH/DELETE /products/:id`, variant routes) compare `product.shop.ownerId` to the caller — fetched via a single Prisma `include`, not a cross-feature service call. The only cross-feature dependency is `SHOP_PORT.findByOwnerId` in `createProduct` (resolving the caller's own shop).
- **Public listing defaults to `status=active`** when the caller doesn't pass `status` explicitly — sellers/admins can still query other statuses via the query param (no additional guard on that param at this scope; revisit once a seller product-management UI exists and needs to see its own `draft` items by default).

## Owner
Built as part of the initial vibecode pass, right after the minimal `shop` feature it depends on.
