# ShopHub — API_SPEC.md

REST API contract for the NestJS backend. Companion to `DATABASE.md` (data model) and `ARCHITECTURE.md` (request flow: Controller → Service → Repository).

---

## 1. Overview

- **Base URL:** `https://api.shophub.com/api/v1` (local: `http://localhost:3000/api/v1`)
- **Versioning:** URL-path major version (`/api/v1`, `/api/v2`). A new major version is introduced only for breaking changes; additive fields/endpoints ship within the current version. Version is set via Nest's `URI Versioning` (`app.enableVersioning({ type: VersioningType.URI })`).
- **Content-Type:** `application/json` for all standard requests/responses; `multipart/form-data` for file uploads (product images, shop logo/banner, avatar). Responses are always `application/json`.
- **Consumers:** Next.js storefront, React+Vite seller dashboard, React+Vite admin dashboard — all use the same versioned API, differentiated by `role` on the authenticated user and by `RolesGuard` per endpoint.

---

## 2. Authentication

- **Method:** JWT, access + refresh token pair. Stateless access token; refresh token tracked server-side (Redis) to allow revocation.
- **Header format:** `Authorization: Bearer <access_token>`
- **Token flow:**
  1. `POST /auth/login` (or `/auth/register`) → returns `accessToken` (15 min TTL) + `refreshToken` (7 day TTL, httpOnly cookie for web clients, or body field for non-browser clients).
  2. Client sends `accessToken` on every request via `Authorization` header.
  3. On `401` with `error.code = AUTH_002` (token expired), client calls `POST /auth/refresh` with the refresh token → new token pair issued; old refresh token is invalidated (rotation).
  4. `POST /auth/logout` revokes the current refresh token (removed from Redis).
- **Auth error handling:** missing/invalid token → `401` with `error.code = AUTH_001`; expired token → `401` `AUTH_002`; valid token but insufficient role → `403` `AUTH_003`. Guards: global `JwtAuthGuard` (opt-out via `@Public()`), route-level `@Roles('seller' | 'admin')` + `RolesGuard`.

---

## 3. Request Conventions

**Pagination** (list endpoints):
```
GET /products?page=1&limit=20
```
| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | int | 1 | 1-indexed |
| `limit` | int | 20 | max 100 |

**Sorting:**
```
GET /products?sortBy=createdAt&order=desc
```
`sortBy` whitelisted per endpoint (e.g. products: `createdAt`, `price`, `soldCount`, `ratingAvg`); `order` is `asc`/`desc`.

**Filtering:** plain query params scoped to the resource, e.g.
```
GET /products?categoryId=12&shopId=8&status=active&minPrice=100000&maxPrice=500000
GET /orders?status=shipped&from=2026-07-01&to=2026-07-31
```

**Request body:** JSON, `camelCase` keys (mapped to `snake_case` columns in the repository layer), validated by `class-validator` DTOs — unknown fields rejected (`forbidNonWhitelisted`).

**File upload:** `multipart/form-data`, field name matches resource (`images` for product images, `logo`/`banner` for shop, `avatar` for user). Max 5MB/file, `image/jpeg|png|webp` only; uploaded to object storage (S3-compatible), endpoint returns the resulting URL(s).
```
POST /products/:id/images
Content-Type: multipart/form-data
--- images: [file1.jpg, file2.jpg]
```

---

## 4. Response Format

**Success:**
```json
{
  "success": true,
  "data": { "id": 101, "name": "Wireless Mouse" },
  "meta": { "page": 1, "limit": 20, "total": 143 }
}
```
`meta` is present only for paginated list responses; omitted (or `null`) for single-resource responses. Produced by the global `TransformInterceptor`.

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_002",
    "message": "Product not found",
    "details": null
  }
}
```
`details` holds structured info when useful (e.g. field-level validation errors as an array). Produced by the global `AllExceptionsFilter`.

---

## 5. Error Codes

**Format:** `[FEATURE]_[NUMBER]`, feature prefix uppercase, 3-digit sequential number per feature (e.g. `ORDER_001`, `CART_003`).

**Common (cross-feature) codes:**
| Code | HTTP Status | Meaning |
|---|---|---|
| `AUTH_001` | 401 | Missing or invalid access token |
| `AUTH_002` | 401 | Access token expired |
| `AUTH_003` | 403 | Authenticated but role/permission denied |
| `VALIDATION_001` | 400 | Request body/query failed DTO validation (`details` = field errors) |
| `COMMON_404` | 404 | Resource not found (generic fallback; features prefer their own `_NF` code) |
| `COMMON_409` | 409 | Conflict (e.g. unique constraint violation) |
| `COMMON_429` | 429 | Rate limit exceeded |
| `COMMON_500` | 500 | Unhandled server error |

**Feature-specific examples:**
| Code | HTTP Status | Meaning |
|---|---|---|
| `PRODUCT_001` | 404 | Product not found |
| `PRODUCT_002` | 400 | Variant out of stock |
| `CART_001` | 409 | Cart item quantity exceeds available stock |
| `ORDER_001` | 404 | Order not found |
| `ORDER_002` | 409 | Order cannot transition from current status (invalid state change) |
| `PAYMENT_001` | 402 | Payment failed / declined |
| `SHOP_001` | 403 | Shop not approved — seller actions blocked |
| `VOUCHER_001` | 400 | Voucher expired or usage limit reached |
| `REVIEW_001` | 409 | Order item already reviewed |
| `SHOP_002` | 409 | Owner already has a shop |
| `SHOP_003` | 400 | `rejectionReason` missing when rejecting a shop |
| `USER_001` | 404 | User not found |
| `CATEGORY_001` | 409 | Category has products or child categories, cannot delete |

**HTTP status usage:** `200` read/update success, `201` created, `204` deleted (no body), `400` validation, `401`/`403` auth, `404` not found, `409` conflict/state error, `402` payment failed, `422` semantically invalid (e.g. checkout with empty cart), `429` rate limited, `500` unhandled.

---

## 6. Endpoints by Feature

### auth
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register buyer/seller account | Public |
| POST | `/auth/login` | Login, returns token pair | Public |
| POST | `/auth/refresh` | Rotate access/refresh token | Refresh token |
| POST | `/auth/logout` | Revoke refresh token | Bearer |
| GET | `/auth/me` | Current authenticated user | Bearer |

### user
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/users/:id` | Get user profile (public fields) | Bearer |
| PATCH | `/users/me` | Update own profile | Bearer |
| GET | `/users/me/addresses` | List own addresses | Bearer |
| POST | `/users/me/addresses` | Add address | Bearer |
| PATCH | `/users/me/addresses/:id` | Update address | Bearer |
| DELETE | `/users/me/addresses/:id` | Delete address | Bearer |
| GET | `/admin/users` | List/filter users (role, status, search) | Bearer (admin) |
| PATCH | `/admin/users/:id/status` | Lock/unlock a user account | Bearer (admin) |

### shop
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/shops` | Create shop (seller onboarding, starts `pending`) | Bearer (buyer→seller) |
| GET | `/shops/:slug` | Public shop profile | Public |
| PATCH | `/shops/me` | Update own shop | Bearer (seller) |
| GET | `/shops/me/dashboard` | Seller dashboard summary (KPIs, revenue trend, recent orders, top products) | Bearer (seller) |
| GET | `/admin/shops` | List shops filtered by status (pending/approved/suspended/rejected) | Bearer (admin) |
| GET | `/admin/shops/:id` | Shop detail incl. documents, for approval review | Bearer (admin) |
| PATCH | `/admin/shops/:id/status` | Approve/reject/suspend shop (`rejectionReason` required when rejecting) | Bearer (admin) |

### catalog
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/categories` | List category tree | Public |
| GET | `/products` | List/search/filter products | Public |
| GET | `/products/:slug` | Product detail incl. variants | Public |
| POST | `/products` | Create product | Bearer (seller) |
| PATCH | `/products/:id` | Update product | Bearer (seller, owner) |
| DELETE | `/products/:id` | Deactivate product (status→inactive) | Bearer (seller, owner) |
| POST | `/products/:id/images` | Upload product images | Bearer (seller, owner) |
| POST | `/products/:id/variants` | Add variant | Bearer (seller, owner) |
| PATCH | `/products/:id/variants/:variantId` | Update variant (price/stock) | Bearer (seller, owner) |
| GET | `/shops/me/inventory/summary` | Stock KPIs + low-stock variant list for own shop | Bearer (seller) |
| POST | `/categories` | Create category | Bearer (admin) |
| PATCH | `/categories/:id` | Update category (incl. `commissionRate`, `isActive`) | Bearer (admin) |
| DELETE | `/categories/:id` | Delete category (only if no products/children) | Bearer (admin) |
| GET | `/admin/products` | List flagged/pending-moderation products | Bearer (admin) |
| PATCH | `/admin/products/:id/moderate` | Approve / request-changes / remove a product | Bearer (admin) |

### admin dashboard & reports
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/admin/dashboard` | Platform KPIs, GMV trend, needs-action queue, new shops, top categories | Bearer (admin) |
| GET | `/admin/reports/revenue` | Weekly GMV bars + category breakdown + top sellers | Bearer (admin) |
| GET | `/admin/reports/users` | Weekly new-user bars | Bearer (admin) |
| GET | `/admin/reports/orders` | Carrier performance table | Bearer (admin) |

### cart
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/cart` | Get current cart (user or guest session) | Bearer or guest |
| POST | `/cart/items` | Add item to cart | Bearer or guest |
| PATCH | `/cart/items/:id` | Update quantity | Bearer or guest |
| DELETE | `/cart/items/:id` | Remove item | Bearer or guest |

### order
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/checkout` | Create order group from cart (splits per shop) | Bearer |
| GET | `/orders` | List own orders (buyer) | Bearer |
| GET | `/orders/:id` | Order detail | Bearer (owner/shop/admin) |
| PATCH | `/orders/:id/cancel` | Cancel order (buyer, pre-shipment) | Bearer (owner) |
| PATCH | `/orders/:id/status` | Update fulfillment status | Bearer (seller, owner shop) |
| GET | `/shops/me/orders` | List orders for own shop | Bearer (seller) |
| POST | `/orders/:id/payment` | Initiate/confirm payment | Bearer (owner) |

### review
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/reviews` | Create review (requires `orderItemId`) | Bearer |
| GET | `/products/:id/reviews` | List product reviews | Public |
| POST | `/reviews/:id/reply` | Seller reply to review | Bearer (seller, owner) |

### wishlist
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/wishlist` | List saved products | Bearer |
| POST | `/wishlist` | Add product | Bearer |
| DELETE | `/wishlist/:productId` | Remove product | Bearer |

### voucher
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/vouchers` | List available vouchers (platform + followed shops) | Bearer |
| POST | `/vouchers/validate` | Validate a code against a cart total | Bearer |
| POST | `/shops/me/vouchers` | Create shop voucher | Bearer (seller) |

### notification
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/notifications` | List own notifications | Bearer |
| PATCH | `/notifications/:id/read` | Mark as read | Bearer |
| PATCH | `/notifications/read-all` | Mark all as read | Bearer |

---

## 7. Endpoint Details (complex endpoints)

### 7.1 `POST /checkout`

Splits the buyer's cart into one order per shop (see `DATABASE.md` §2.6 order-per-shop pattern), inside a DB transaction; on success emits `order.created` per resulting order.

**Request:**
```json
{
  "addressId": 55,
  "paymentMethod": "vnpay",
  "voucherCode": "SHOPHUB50",
  "cartItemIds": [201, 202, 205]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "orderGroupId": 91,
    "orders": [
      { "id": 501, "shopId": 8, "orderCode": "SH-20260801-501", "totalAmount": 350000, "status": "pending" },
      { "id": 502, "shopId": 12, "orderCode": "SH-20260801-502", "totalAmount": 129000, "status": "pending" }
    ],
    "grandTotal": 479000
  },
  "meta": null
}
```

**Error cases:**
| Code | Status | Condition |
|---|---|---|
| `CART_001` | 409 | An item's quantity exceeds current stock at checkout time |
| `VOUCHER_001` | 400 | Voucher expired, usage limit reached, or below `minOrderAmount` |
| `VALIDATION_001` | 400 | Missing/invalid `addressId` or empty `cartItemIds` |
| `ORDER_003` | 422 | Resulting cart selection is empty after removing unavailable items |

### 7.2 `POST /auth/login`

**Request:**
```json
{ "email": "buyer@example.com", "password": "••••••••" }
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "8f3c1e0a-...",
    "user": { "id": 1, "fullName": "Nguyen Van A", "role": "buyer" }
  },
  "meta": null
}
```

**Error cases:** `AUTH_004` (401, invalid credentials), `AUTH_005` (403, account inactive/unverified), `VALIDATION_001` (400).

### 7.3 `PATCH /orders/:id/status` (seller fulfillment update)

**Request:**
```json
{ "status": "shipped", "trackingNumber": "VN123456789", "carrier": "GHN" }
```

**Response (200):**
```json
{
  "success": true,
  "data": { "id": 501, "status": "shipped", "updatedAt": "2026-08-01T09:30:00Z" },
  "meta": null
}
```

**Error cases:** `ORDER_002` (409, invalid status transition — e.g. `delivered` → `pending`), `AUTH_003` (403, not the owning shop), `ORDER_001` (404).

---

## [Tech-Specific Additions — WebSocket Events]

Real-time updates use a Socket.IO gateway (`core/events` + a thin `notification` gateway) authenticated via the same JWT (`Authorization` handshake header). Namespace: `/ws`.

| Event | Direction | Payload | Trigger |
|---|---|---|---|
| `order.status.updated` | Server→Client | `{ orderId, status, updatedAt }` | Emitted after `PATCH /orders/:id/status`, delivered to the buyer's room (`user:<id>`) |
| `notification.new` | Server→Client | `{ id, title, type, createdAt }` | Emitted whenever a `notifications` row is created |
| `cart.stock.changed` | Server→Client | `{ variantId, stockQuantity }` | Emitted when a variant a client has in-cart drops in stock |

Rooms follow `user:<userId>` and `shop:<shopId>` conventions; the gateway joins a socket to its rooms on connect based on the JWT's `sub`/`role` claims, so feature services only need to `server.to('user:123').emit(...)` — no direct socket lookups from business code.
