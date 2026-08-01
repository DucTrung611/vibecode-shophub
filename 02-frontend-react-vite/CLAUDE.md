# Frontend: ShopHub Seller/Admin Dashboard (02-frontend-react-vite)

## Tech Stack
- Language: TypeScript
- Framework: React 19 + Vite
- State management: TanStack Query (server state/cache) + Zustand (minimal client/UI state — session, sidebar/theme)
- Styling: TailwindCSS
- Routing: `react-router` v6 `createBrowserRouter` — each feature registers its routes in its `index.ts`, composed by the app shell (no central file imports feature internals); `React.lazy()` + `Suspense` per feature route so seller/admin code stays code-split
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
- @../ShopHub-Design-System/design_handoff_shophub/Design%20System.dc.html - shared component/token reference (buttons, inputs, badges, cards, tabs, table, pagination, breadcrumbs, modal, toast) — shared with 01-frontend-nextjs
- This app's screens (11, all `.dc.html`), desktop-first (1440px canvas):
  - Seller Center: `Seller Dashboard`, `Product Management`, `Order Management`, `Inventory Management`, `Shop Settings`
  - Admin Panel: `Admin Dashboard`, `User Management`, `Shop Approval`, `Product Moderation`, `Category Management`, `Reports Analytics`

Each `.dc.html` is a **high-fidelity reference, not code to copy** — open it directly in a browser; colors/type/spacing/copy (Vietnamese) and component states shown are final and should be recreated pixel-close using this app's own components.

These dashboards are desktop-only (no mobile mockup/toggle) — `browser-window.jsx` in that folder is just the browser-chrome wrapper the `.dc.html` previews use to frame the desktop mockup; it's preview scaffolding, not implementation code. `android-frame.jsx` is not relevant here (it's only used by 01-frontend-nextjs's buyer screens).

## Quick Reference

### Feature Location
`src/features/[name]/` - feature-based, self-contained vertical slices (`auth`, `product`, `order`, `shop`, `voucher`, `notification`, ...); see FRONTEND-ARCHITECTURE.md §2-3. `pages/` exists only here (Vite dashboards render their own page components), unlike the Next.js storefront's `app/(routes)/.../page.tsx`.

### Response Handling
API responses follow `{ success, data, meta? }` / `{ success: false, error: { code, message, details } }` (API_SPEC.md §4) — unwrap this envelope once in `shared/services/api-client.ts`, don't repeat it per call site

### Error Code Prefix
`[FEATURE]_[NUMBER]` - e.g., AUTH_001, ORDER_002, SHOP_001 (API_SPEC.md §5)

### Auth-first Routing
Everything except `/login` is protected, wrapped in a top-level `<RequireAuth role="seller|admin">` route element reading `session.store` — see FRONTEND-ARCHITECTURE.md §6 and FRONTEND-PROJECT-RULES.md §[TECH-SPECIFIC ADDITIONS]
