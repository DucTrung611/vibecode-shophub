# seller-dashboard

Read-only aggregation feature for `GET /shops/me/dashboard`. Split out of `shop` on purpose:
it needs `ORDER_PORT` and `CATALOG_PORT`, and both `order` and `catalog` already import
`ShopModule`. Adding those imports directly to `ShopModule` would create a circular module
dependency. Since nothing needs to depend on this feature back, it sits above `shop`/`order`/
`catalog` in the import graph instead.

No DTOs — the endpoint takes no input beyond the authenticated user.
