# Feature: admin-reports

## Purpose
`/admin/reports` — 3-tab layout (Revenue / Users / Order Ops). Wired to
`GET /admin/reports/revenue`, `GET /admin/reports/users`, `GET /admin/reports/orders`.

## Key decisions
- `getUserSignupReport` and `getOrderOpsReport` return the response payload as a plain
  array, per the brief ("NOT wrapped in an object, just the array directly as `data`") —
  the shared `apiClient` interceptor already unwraps `{success,data,meta}` down to
  `data`, so these service functions need no special handling; only the TypeScript
  return type differs from the object-shaped `RevenueReport`.
- Each tab is its own component (`RevenueTab`/`UsersTab`/`OrderOpsTab`) with its own
  `useQuery` call rather than one page-level fetch-everything hook — matches the mock's
  independent per-tab KPI/chart sets and means switching tabs doesn't need to wait on
  data the inactive tabs don't use (React Query still fetches all three eagerly since
  they're mounted conditionally by the parent, but each stays independently
  loading/error-isolated).
- `deliveryRate` from the backend is a 0..1 fraction (`delivered/total`); the Order Ops
  table multiplies by 100 for display — verified against
  `order.repository.ts#getCarrierPerformance`.
- The mock's date-range picker and "Xuất báo cáo" (export) button are static chrome with
  no wired behavior in the mock itself and no corresponding backend support — omitted
  rather than built as a non-functional decoration.

## Owner
Built as part of the Admin Panel implementation pass (5 admin screens).
