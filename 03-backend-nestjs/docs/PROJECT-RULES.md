# ShopHub — Backend PROJECT-RULES.md

## Tech Stack
- Language: TypeScript
- Framework: NestJS
- ORM: Prisma (or TypeORM — pick one repo-wide; examples below use Prisma)

---

## 1. Feature Structure

```
src/features/product/
├── product.controller.ts
├── product.service.ts
├── product.repository.ts
├── dto/
│   ├── create-product.dto.ts
│   └── update-product.dto.ts
├── entities/
│   └── product.entity.ts
├── types/
│   └── product.types.ts
├── product.module.ts
├── product.events.ts        # published/handled domain events (if any)
├── __tests__/
│   ├── product.service.spec.ts
│   └── product.controller.spec.ts
└── context.md                # feature purpose, owner, key decisions
```

`shared/` and `common/` (see §3) never have a `controller.ts` — they export services, guards, pipes, and types only.

---

## 2. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Feature folders | `kebab-case`, singular | `features/order`, `features/cart` |
| Files | `kebab-case.role.ts` | `create-order.dto.ts`, `order.service.ts` |
| Classes | `PascalCase` + role suffix | `OrderService`, `CreateOrderDto`, `OrderController` |
| Interfaces/Types | `PascalCase`, no `I` prefix | `OrderSummary`, not `IOrderSummary` |
| Functions/Methods | `camelCase`, verb-first | `createOrder()`, `findActiveByShop()` |
| Variables/Constants | `camelCase`; module-level constants `UPPER_SNAKE_CASE` | `const orderId`, `const MAX_CART_ITEMS = 50` |
| Enums | `PascalCase` name, `PascalCase` or `UPPER_SNAKE_CASE` members | `OrderStatus.Pending` |

---

## 3. Feature Rules

- Each feature is self-contained: its module owns its controller, service, repository, DTOs, entities.
- **No direct imports between features** — never `import { ProductService } from '../product/product.service'` from inside `features/order`.
- Cross-feature communication, in order of preference:
  1. **Public interface via DI** — feature exposes a narrow exported provider (e.g. `ProductCatalogPort`) through its module; consumers inject that, never the internal service class.
  2. **Domain events** — `OrderModule` emits `order.created`; `NotificationModule` listens via `@OnEvent('order.created')`. Use `@nestjs/event-emitter` (in-process) or a queue (BullMQ/Redis) for anything that shouldn't block the request.
  3. **Shared service in `shared/`** — only for logic with no feature owner (e.g. price formatting, slug generation).
- Shared code location: `src/shared/` (guards, interceptors, pipes, filters, base entities, config, DI tokens) and `src/common/` (framework-agnostic utils, constants).

**DO**
```ts
// features/order/order.service.ts
constructor(@Inject(PRODUCT_CATALOG_PORT) private catalog: ProductCatalogPort) {}
```
**DON'T**
```ts
// features/order/order.service.ts
import { ProductRepository } from '../product/product.repository'; // ❌ internal import
```

---

## 4. Code Patterns

- **Error handling:** throw Nest built-in exceptions (`NotFoundException`, `BadRequestException`) from the service layer; a global `AllExceptionsFilter` in `shared/filters/` maps them to the standard response shape. Never `try/catch` and swallow errors in controllers.
- **Validation:** `class-validator` decorators on DTOs + a global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` in `main.ts`. No manual `if (!dto.name)` checks in services.
- **Logging:** inject Nest's `Logger` scoped per class (`new Logger(OrderService.name)`); no `console.log`. Log at service boundaries (start/end of a use case, caught errors), not inside tight loops.
- **Response format:** every endpoint returns `{ success: boolean, data: T | null, error: { code, message } | null }`, enforced by a global `TransformInterceptor` in `shared/interceptors/`.

```ts
// DO — service throws, controller stays thin
async getById(id: number) {
  const product = await this.repo.findById(id);
  if (!product) throw new NotFoundException('Product not found');
  return product;
}
```
```ts
// DON'T — business logic + query in controller
@Get(':id')
async getById(@Param('id') id: string) {
  const product = await this.prisma.product.findUnique({ where: { id: +id } }); // ❌
  if (!product) return { error: 'not found' };                                  // ❌ non-standard shape
  return product;
}
```

---

## 5. Anti-patterns (MUST NOT)

- ❌ Import directly from another feature's internal files (controller, service, repository, entity).
- ❌ Circular dependencies between feature modules (`forwardRef` is a smell — refactor to events/ports instead).
- ❌ Business logic in controllers/handlers — controllers only: validate input (via DTO), call one service method, return.
- ❌ Data queries (`prisma.*`, raw SQL) outside the repository layer — services call repositories, never the ORM client directly.
- ❌ Hardcoded configuration (URLs, secrets, limits) — use `@nestjs/config` + `.env`, never inline string/number literals for config values.

---

## 6. Git Workflow

- **Branch naming:** `<type>/<feature-scope>-<short-desc>` — `feat/order-split-checkout`, `fix/cart-race-condition`.
- **Commit message:** Conventional Commits — `feat(order): split checkout into per-shop orders`, `fix(cart): prevent duplicate variant rows`.
- **PR requirements:** description states the feature(s) touched; passes lint + typecheck + tests in CI; no direct cross-feature imports (checked by lint rule, see below); updates `context.md` if the feature's responsibilities changed.

---

## 7. Testing

- **Location:** co-located per feature, `features/<name>/__tests__/`.
- **Naming:** `<subject>.spec.ts` for unit tests, `<subject>.e2e-spec.ts` for end-to-end (root `test/` folder for cross-feature e2e flows like full checkout).
- **Structure:** AAA pattern (Arrange / Act / Assert); one `describe` per class/method, `it('should ...')` phrasing.
- **Coverage requirement:** ≥80% on `service.ts` and `repository.ts` files; controllers covered via e2e rather than unit mocks.

---

## [NestJS-Specific Additions]

- Every feature ships its own `*.module.ts`; app-level `AppModule` only imports feature modules and global config/shared modules — it contains no business providers.
- Enforce the no-cross-import rule with `eslint-plugin-boundaries` or a custom `no-restricted-imports` rule targeting `features/*/`.
- Prefer `@nestjs/config` with a typed `ConfigService` (validated via `zod`/`joi` schema at bootstrap) over `process.env` access anywhere outside `shared/config/`.
- Redis-backed concerns (cart cache, session, rate limiting) live behind an injectable port in `shared/cache/`, not called directly from feature services.
