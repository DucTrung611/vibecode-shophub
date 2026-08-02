# Feature: admin-dashboard

## Purpose
`/admin` landing page — platform KPIs, weekly GMV chart, a "needs action" queue, newly
registered shops, and top categories by product count. Wired to `GET /admin/dashboard`.

## Key decisions
- Single non-paginated query (`useAdminDashboard`) — the endpoint returns one aggregate
  payload, no list/pagination concerns here.
- KPI icons are mapped positionally (index 0..3) since the backend returns a plain
  `{label, value, pendingCount?}[]` with no icon/type discriminator — matches the fixed
  4-KPI order documented in the task brief (GMV, users, active shops, orders).
- "Cần xử lý" (needs action) items are clickable only when their label matches a known
  route target (`Gian hàng chờ duyệt` → `/admin/shops`, `Sản phẩm chờ kiểm duyệt` →
  `/admin/products`) — the backend only ever returns these two labels today, so unmapped
  future labels degrade gracefully to non-clickable rows instead of throwing.
- `topCategories` renders as ranked progress bars (design shows the same treatment on
  both the dashboard and the Revenue report tab) driven by `count`, not a fabricated GMV
  figure — the backend's `getTopCategories` aggregates by product count only.

## Owner
Built as part of the Admin Panel implementation pass (5 admin screens).
