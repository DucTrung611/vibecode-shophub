# Feature: admin-products (Product Moderation)

## Purpose
`/admin/products` — table of flagged products (`status='flagged'`) with a review action
that opens a `Modal` (not a separate route) to approve / request changes / remove. Wired
to `GET /admin/products` and `PATCH /admin/products/:id/moderate`.

## Key decisions
- Detail is a `Modal`, not a separate `/admin/products/:id` route — the brief explicitly
  calls this "your call, simplest that works" since there's no admin-specific product
  detail endpoint. The list item already carries everything the modal needs
  (`images`, `variants`, `flagReason`, `moderationLogs`) via `PRODUCT_FLAGGED_INCLUDE`
  (backend's flagged-list-only include, wider than the public `PRODUCT_LIST_INCLUDE`),
  so no extra fetch is needed and no route/param plumbing is added.
- **Moderation history** renders from `product.moderationLogs` (newest first, backend-sorted)
  — action label, acting admin's name, timestamp, and note if present. No separate
  endpoint; it rides along on the same `GET /admin/products` list response.
- The list table only shows `shopId` (not shop/category name) — `GET /admin/products`
  uses `PRODUCT_LIST_INCLUDE`, which does not join `shop`/`category`. Rather than fetch
  those separately (extra N+1-ish requests not in the brief's endpoint list), the raw ID
  is shown. Noted as a deviation from the mock's "GIAN HÀNG"/"DANH MỤC" columns.
- "Yêu cầu chỉnh sửa" requires a non-empty note (mirrors the backend, which only persists
  `flagReason` from `note` on `request_changes`); "Duyệt" and "Gỡ" don't require one.

## Owner
Built as part of the Admin Panel implementation pass (5 admin screens).
