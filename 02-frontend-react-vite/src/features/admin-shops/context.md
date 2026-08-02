# Feature: admin-shops (Shop/Seller Approval)

## Purpose
`/admin/shops` (status-tabbed list) and `/admin/shops/:id` (review detail) — approve,
reject (reason required), or suspend a seller's shop. Wired to `GET /admin/shops`,
`GET /admin/shops/:id`, `PATCH /admin/shops/:id/status`.

## Key decisions
- Reject requires a reason of at least 3 characters before the submit button in
  `ShopRejectModal` enables — mirrors the backend's `UpdateShopStatusDto`
  (`@MinLength(3)` on `rejectionReason`) so the client-side gate matches what the server
  actually enforces (`SHOP_003`), rather than an arbitrary UI-only minimum.
- `documents` (JSONB, shape not fixed by the schema) is parsed defensively — array of
  strings or `{name, url}` objects render as a document list; anything else (null, object,
  unexpected shape) falls back to the empty state "Chưa có tài liệu" rather than crashing.
  `businessLicenseUrl` renders as its own linked row when present.
- The mock's "review checklist" panel is intentionally NOT implemented — the brief marks
  it optional flourish, and there's no backend data to drive real checklist state (it
  would just be static copy), so it's skipped in favor of the required parts.
- A "Tạm ngưng gian hàng" (suspend) action is added beyond the mock's approve/reject pair
  since `PATCH /admin/shops/:id/status` accepts `suspended` and API_SPEC.md documents it
  as a real transition — shown only once a shop is already `approved`.

## Owner
Built as part of the Admin Panel implementation pass (5 admin screens).
