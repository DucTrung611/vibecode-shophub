# Feature: seller-orders

## Purpose
`/seller/orders` (status-tab table, paginated) and `/seller/orders/:id` (detail:
items, totals, shipping address snapshot, status-update control), backed by
`GET /shops/me/orders`, `GET /orders/:id`, `PATCH /orders/:id/status`.

## Key decisions
- List pagination goes through `shared/services/api-client.ts`'s `rawApiClient`
  (not the main `apiClient`, whose interceptor discards `meta`) to get
  `meta.total` for `Pagination` — same pattern used by the admin features.
- `utils/order-status.util.ts` encodes the valid status-transition graph from
  API_SPEC.md §6/§7.3 (`NEXT_STATUS_OPTIONS`); `OrderStatusUpdateForm` only ever
  renders radios for the legal next states of the order's current status, so an
  invalid `ORDER_002` transition can't be submitted from this UI.
- Duplicates a small status label/variant map also present in `seller-dashboard`
  (see that feature's context.md for why it isn't shared).

## Owner
Built as part of the Seller Center feature pass (dashboard/products/orders/inventory/settings).
