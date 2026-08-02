# Feature: seller-dashboard

## Purpose
Renders `/seller` — the Seller Center landing page: KPI cards, a 7-day revenue bar
chart (Recharts), an order-status breakdown, a recent-orders table, and a
top-products list. Single read-only screen backed by `GET /shops/me/dashboard`.

## Key decisions
- One endpoint, one query (`useSellerDashboard`) — no need for a dedicated store;
  all state is server state via TanStack Query.
- KPI icon/currency formatting is index-based + a `toLowerCase().includes("doanh thu")`
  heuristic on the label to decide currency vs plain-count formatting, since the API
  returns KPIs as a generic `{label, value, pendingCount?}[]` array without a `type`
  discriminator. If the backend adds a `type` field later, swap the heuristic for it.
- `utils/order-status.util.ts` maps raw order status enum values to Vietnamese labels
  and `Badge` variants — duplicated (small, ~20 lines) in `seller-orders` since
  features can't share internals except via barrel, and promoting it to `shared/`
  felt premature for a single small mapping used by 2 features.

## Owner
Built as part of the Seller Center feature pass (dashboard/products/orders/inventory/settings).
