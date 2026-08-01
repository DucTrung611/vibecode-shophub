# ShopHub — Frontend PROJECT-RULES.md

Applies to both frontend apps: **Next.js** (buyer storefront, App Router) and **React + Vite** (seller/admin dashboards). Same feature-based structure and rules in both; framework-specific notes are called out where they diverge.

## Tech Stack
- Framework: Next.js 14 (App Router) for storefront · React 18 + Vite for seller/admin dashboards
- State management: TanStack Query (server state/cache) + Zustand (minimal client/UI state)
- Styling: Tailwind CSS
- HTTP client: Axios, wrapped in a typed `apiClient` per app (interceptors for auth header, 401 refresh, error envelope)

---

## 1. Feature Structure

```
features/product/
├── components/
│   ├── ProductCard.tsx
│   └── ProductList.tsx
├── hooks/
│   ├── useProducts.ts        # TanStack Query hooks
│   └── useProductFilters.ts
├── services/
│   └── product.service.ts    # apiClient calls, request/response mapping
├── stores/
│   └── product-filter.store.ts  # Zustand, only if state is truly cross-component
├── types/
│   └── product.types.ts
├── utils/
│   └── format-price.ts
├── __tests__/
│   └── ProductCard.test.tsx
├── index.ts                  # barrel — the ONLY import surface for other code
└── context.md
```

---

## 2. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Feature folders | `kebab-case`, singular | `features/product`, `features/order` |
| Components | `PascalCase.tsx` | `ProductCard.tsx`, `CheckoutForm.tsx` |
| Hooks | `camelCase`, `use` prefix | `useProducts.ts`, `useCart.ts` |
| Services | `kebab-case.service.ts` | `product.service.ts` |
| Types | `PascalCase`, `kebab-case.types.ts` file | `Product`, `ProductFilters` in `product.types.ts` |
| Stores | `kebab-case.store.ts` | `cart.store.ts` |

---

## 3. Feature Rules

- Each feature is self-contained; everything it needs (components, hooks, services, types) lives inside it.
- **Export only via `index.ts`** — the barrel re-exports the public API (components/hooks meant for other features/pages), nothing else.
- **No direct imports between features** — never reach into another feature's internal files.
- Cross-feature communication, in order of preference:
  1. **URL params** — e.g. `cart` feature reads `?productId=` to preselect, `order` reads `orderId` from the route.
  2. **Events** — a small pub/sub (or native `CustomEvent`) for decoupled signals, e.g. `cart:item-added` triggering a toast from a different feature.
  3. **Global state (minimal)** — only truly cross-cutting state (auth session, cart summary badge count) lives in a top-level store outside `features/`; feature-local state stays in that feature's `stores/`.
- Shared components location: `src/shared/components/` (Button, Modal, Input, Skeleton) — generic, no feature knowledge.

**DO**
```ts
// pages/cart/checkout.tsx
import { CheckoutForm } from '@/features/order';   // ✅ via barrel
```
**DON'T**
```ts
import { CheckoutForm } from '@/features/order/components/CheckoutForm'; // ❌ bypasses index.ts
import { useCartStore } from '@/features/cart/stores/cart.store';        // ❌ cross-feature internal import
```

---

## 4. Component Rules

- One component per file, file name matches component name.
- Co-locate: styles (Tailwind classes inline, no separate CSS file needed), tests in `__tests__/`, and a `.stories.tsx` if Storybook is used.
- **Props typing required** — every component has an explicit `interface Props { ... }` or `type Props = { ... }`; no implicit `any` props.
- **Max ~150 lines per component** — beyond that, extract a sub-component or move logic into a hook.

```tsx
// DO
interface ProductCardProps {
  product: Product;
  onAddToCart: (variantId: number) => void;
}
export function ProductCard({ product, onAddToCart }: ProductCardProps) { /* ... */ }
```

---

## 5. Code Patterns (MUST follow)

- **API calls:** only inside `features/*/services/*.service.ts`, called through TanStack Query hooks (`useQuery`/`useMutation`) in `hooks/`. Components never call `apiClient` or `fetch` directly.
- **State:** local (`useState`) first; lift to feature store only when 2+ sibling components need it; global store only for app-wide concerns (auth, cart badge).
- **Error handling:** a top-level `ErrorBoundary` per app catches render errors; mutation/query errors surface via a shared toast/notification service (`shared/services/notify.ts`), not inline `alert()`.
- **Loading states:** skeleton components (`shared/components/Skeleton*`) for content areas; spinner only for button/inline actions.
- **Form handling:** `react-hook-form` + `zod` schema per form, colocated in the feature (`features/order/utils/checkout.schema.ts`).

```tsx
// DO
const { data, isLoading } = useProducts({ categoryId });
if (isLoading) return <ProductListSkeleton />;
```
```tsx
// DON'T
useEffect(() => {
  fetch('/api/v1/products').then(r => r.json()).then(setProducts); // ❌ raw fetch in component
}, []);
```

---

## 6. Anti-patterns (MUST NOT)

- ❌ Import from another feature's internal files (only via its `index.ts`).
- ❌ API calls directly in components (must go through `services/` + a query hook).
- ❌ Business logic in components (e.g. discount math, stock checks) — belongs in `services/` or `utils/`.
- ❌ Deep prop drilling beyond 2 levels — use composition or feature-local context/store instead.
- ❌ Untyped code (`any`) — use `unknown` + narrowing, or a proper type/generic.
- ❌ Inline `style={{ ... }}` — use Tailwind classes; inline style only for computed/dynamic values (e.g. a progress bar width).

---

## 7. Git Workflow

- **Branch naming:** `<type>/<feature-scope>-<short-desc>` — `feat/product-variant-selector`, `fix/cart-badge-count`.
- **Commit message:** Conventional Commits — `feat(product): add variant selector to PDP`.
- **PR scope:** one feature (or shared/) per PR where possible; screenshots/GIF required for visual changes; no cross-feature internal imports (lint-enforced).

---

## 8. Testing

- **Location:** `features/<name>/__tests__/`, mirroring the source file name (`ProductCard.tsx` → `ProductCard.test.tsx`).
- **What to test:** component render/interaction (Testing Library — query by role/text, not implementation detail), hooks in isolation (`renderHook`), service functions (mock `apiClient`).
- **Coverage focus:** prioritize `hooks/` and `services/` (logic-bearing) over pure presentational components; snapshot tests avoided in favor of behavior assertions.

---

## [Tech-Specific Additions]

- **Next.js (storefront):** Server Components by default for data-heavy pages (product listing/detail) fetching via `services/` server-side; `'use client'` only on interactive leaves (add-to-cart button, filters). Route handlers under `app/api/` are avoided — the app talks to the NestJS API directly via `apiClient`, never proxies business logic through Next.js routes.
- **React + Vite (dashboards):** Routing via `react-router`; each feature registers its routes in its `index.ts` for the app shell to compose, rather than a central route file importing feature internals.
- **TanStack Query conventions:** query keys are feature-scoped tuples, `['product', 'list', filters]`, defined alongside the hook — never inlined ad hoc at call sites, to keep cache invalidation consistent.
- **Zustand stores:** kept small and feature-scoped; the one cross-feature/global store (`shared/stores/session.store.ts`) holds only `user`, `accessToken` status, and `cartItemCount` — nothing else is promoted to global state without a documented reason in `context.md`.
