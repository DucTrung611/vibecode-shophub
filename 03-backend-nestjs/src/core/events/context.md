# Core: events

## Purpose
Two layers of "events" that are easy to conflate — keep them separate:
- **In-process domain events** (`EventEmitterModule` / `EventEmitter2`, registered in `event-emitter.module.ts`): feature services emit (`order.service.ts` → `order.created`, `order.status.updated`; `product.repository.ts` → `variant.stock.changed`) and other features' listeners react (`NotificationListener`, `CartStockListener`) without a direct cross-feature import — this is the existing "no cross-feature imports" boundary mechanism.
- **Outbound WebSocket push** (`ws.gateway.ts` / `websocket.module.ts`, Socket.IO under the `/ws` namespace, per API_SPEC.md "Tech-Specific Additions"): `EventsGateway` authenticates the handshake with the same JWT used for REST (`Authorization` header, verified via `JwtService` + `jwt.secret` config), joins the socket to `user:<id>` and — if the token's role is `seller` — `shop:<shopId>` (looked up via `SHOP_PORT`). Feature code never touches raw sockets; it calls `eventsGateway.emitToUser(...)` / `emitToShop(...)`.

## Key decisions
- **The domain-event listeners are the bridge to WebSocket, not the emitters.** `product.repository.ts` and `order.service.ts` only emit internal events; `NotificationListener` (in `features/notification`) and `CartStockListener` (in `features/cart`) are what turn those into `notification.new` / `order.status.updated` / `cart.stock.changed` socket pushes. Add new real-time events by adding a listener, not by importing `EventsGateway` into unrelated services.
- **`cart.stock.changed` only reaches logged-in users.** It resolves recipients via `CartRepository.findUserIdsWithVariantInCart`, which requires `cart.userId` — guest/session-only carts aren't tracked by socket room today, so they won't receive this push. Revisit if/when guest cart sessions get a room-joining mechanism.
- **WS auth failure disconnects the socket** rather than leaving it connected-but-unauthenticated; there is no `@Public()`-style anonymous WS access.

## Owner
Added when `POST /products/:id/images` (local-disk) and the WebSocket layer were implemented — the WS gateway was previously an API_SPEC-documented gap with no code.
