# admin

Cross-cutting aggregation only: `GET /admin/dashboard` and `GET /admin/reports/revenue`, both of
which genuinely need data from `shop` + `order` + `catalog` (+ `user` for dashboard) in one
response. Every other admin-facing route lives in its owning feature instead, to avoid needing
this module at all for the simple cases:

- Shop approval (`GET/PATCH /admin/shops*`) → `shop` feature (`shop.controller.ts`)
- Product moderation + category CRUD (`/admin/products*`, `/categories`) → `catalog` feature
- User management + weekly signup report (`/admin/users*`, `/admin/reports/users`) → `user` feature
- Carrier performance report (`/admin/reports/orders`) → `order` feature

This keeps `ShopModule`/`CatalogModule`/`OrderModule`/`UserModule` free of new imports (avoiding
circular module dependencies — several of them already import each other), since `AdminModule`
imports all four but none of them import it back.
