# Feature: seller-products

## Purpose
`/seller/products` (search/category/status filters, table, pagination),
`/seller/products/new` (create), `/seller/products/:slug/edit` (edit: basic
info, image upload, variant sub-table), per `Product Management.dc.html`.

## Key decisions
- **Resolving "my shop id":** the public `GET /products?shopId=` filter needs a
  shop id, but the API has no `GET /shops/me`. Imports `useMyShop` from
  `../seller-settings`'s barrel (allowed — cross-feature imports via `index.ts`
  are fine per `FRONTEND-PROJECT-RULES.md` §3) rather than duplicating the
  `PATCH /shops/me`-as-read workaround here. See `seller-settings/context.md`
  for the full rationale.
- **Edit route is keyed by `:slug`, not `:id`** — the only single-product read
  endpoint is `GET /products/:slug` (no `GET /products/:id`). The list still
  exposes numeric `id` for PATCH/DELETE/variant mutations, resolved from the
  slug-fetched detail payload once loaded.
- **Pagination:** `getShopProducts` uses `shared/services/api-client.ts`'s
  `rawApiClient` (full `{success,data,meta}` envelope), not the main `apiClient`
  (which unwraps straight to `data`, discarding `meta`) — the admin features use
  the same `rawApiClient` pattern for their paginated lists.
- **No server-side product text search.** `GET /products` has no `search`/`name`
  query param in API_SPEC.md (full-text search is served by Meilisearch in
  production, not this API). The search box filters the currently-loaded page
  client-side as a lightweight approximation — documented as an approximation,
  not a real server search.
- **Image upload wired to `POST /products/:id/images`** (`ProductImageUpload`,
  `services/product.service.ts#uploadProductImages`) — multipart, field `images`,
  multiple files at once. Only shown once the product exists (edit mode); new/unsaved
  products render `ProductImageUploadDisabledHint` instead, since the endpoint needs a
  product id. Uploaded image URLs come back as `/uploads/products/<file>` (local disk
  on the backend, see backend `catalog/context.md`) — resolved to an absolute URL via
  `shared/utils/asset-url.ts#getAssetUrl` for the `<img>` preview grid.
- **Variant attributes simplified to color/size** — the API's `attributes` field
  is a free-form JSONB object; the form only exposes `color`/`size` inputs
  (matching the buyer PDP's variant swatch pattern) rather than a generic
  key-value editor, to keep the form usable within scope.
- Status changes (draft/active/inactive) on the edit page submit immediately via
  `PATCH /products/:id` on radio click, independent of the name/category form.

## Owner
Built as part of the Seller Center feature pass (dashboard/products/orders/inventory/settings).
