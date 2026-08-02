# Feature: seller-inventory

## Purpose
Renders `/seller/inventory` — stock KPIs (total SKUs / low stock / out of stock),
a low-stock warning banner, status filter tabs, and a per-SKU table, backed by
`GET /shops/me/inventory/summary?status=`.

## Key decisions
- Single endpoint already returns everything (KPIs + filtered item list) — no
  separate KPI query, one `useInventorySummary(status)` refetches on tab change.
- `status=all` (a UI-only value) omits the `status` query param entirely rather
  than sending it, since the backend only recognizes `in_stock|low_stock|out_of_stock`.

## Owner
Built as part of the Seller Center feature pass (dashboard/products/orders/inventory/settings).
