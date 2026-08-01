@AGENTS.md

# Frontend: ShopHub Storefront (01-frontend-nextjs)

## Tech Stack
- Language: TypeScript
- Framework: Next.js 16 (App Router) + React 19
- State management: TanStack Query (server state/cache) + Zustand (minimal client/UI state — session, cart badge)
- Styling: TailwindCSS
- Routing: Next.js App Router (file-based, route groups for public vs `(protected)` checkout/orders/account)
- HTTP client: Axios, wrapped in a single `shared/services/api-client.ts` (auth header, 401 refresh, error envelope unwrap) — feature `*.service.ts` files call through it, never instantiate their own client

## Documentation

### Must Read
- @docs/FRONTEND-PROJECT-RULES.md - Conventions, patterns, MUST/MUST NOT
- @docs/FRONTEND-ARCHITECTURE.md - Folder structure, layers, feature anatomy

### Reference
- @../00-share-docs/API_SPEC.md - API contract (endpoints, auth flow, response envelope, error codes to consume)
- @../00-share-docs/DATABASE.md - Schema (entity shapes returned by the API)

## Design Reference

Before implementing any screen, check `../ShopHub-Design-System/design_handoff_shophub/`:
- @../ShopHub-Design-System/design_handoff_shophub/README.md - read first: design tokens (colors/type/spacing) + full screen list
- @../ShopHub-Design-System/design_handoff_shophub/Design%20System.dc.html - shared component/token reference (buttons, inputs, badges, cards, tabs, table, pagination, breadcrumbs, modal, toast) — shared with 02-frontend-react-vite
- This app's screens (11, all `.dc.html`): `Homepage`, `Category Listing`, `Product Detail`, `Search Results`, `Cart`, `Checkout`, `Order Tracking`, `Profile Settings`, `Wishlist`, `Auth`, `Seller Storefront`

Each `.dc.html` is a **high-fidelity reference, not code to copy** — open it directly in a browser; colors/type/spacing/copy (Vietnamese) and component states shown are final and should be recreated pixel-close using this app's own components.

Every buyer screen ships a mobile mockup (phone frame) **and** a desktop mockup (browser frame), toggled in-page via a "📱 Mobile / 💻 Website" switcher — build both breakpoints from these two views. `android-frame.jsx` / `browser-window.jsx` in that folder are just the device-chrome wrappers the `.dc.html` previews use to render those two frames; they are preview scaffolding, not implementation code — ignore their internals.

## Quick Reference

### Feature Location
`src/features/[name]/` - feature-based, self-contained vertical slices (`auth`, `product`, `cart`, `order`, `shop`, `review`, `wishlist`, `voucher`, `notification`, ...); see FRONTEND-ARCHITECTURE.md §2-3

### Response Handling
API responses follow `{ success, data, meta? }` / `{ success: false, error: { code, message, details } }` (API_SPEC.md §4) — unwrap this envelope once in `shared/services/api-client.ts`, don't repeat it per call site

### Error Code Prefix
`[FEATURE]_[NUMBER]` - e.g., AUTH_001, ORDER_002, CART_001 (API_SPEC.md §5)

### Server vs Client Components
Server Components by default for data-heavy/SEO pages (`/products`, `/products/[slug]` fetch directly via feature services in the page); `'use client'` only where genuine interactivity is needed (Add to Cart button, filter controls, checkout/orders/account — always client-rendered, personal auth-gated data) — see FRONTEND-PROJECT-RULES.md §[TECH-SPECIFIC ADDITIONS]
