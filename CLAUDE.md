# Project: ShopHub

## Overview
A multi-vendor e-commerce marketplace with three surfaces: buyer storefront, Seller Center dashboard, and Admin Panel. Covers product catalog, cart, checkout (order-per-shop split), reviews, wishlist, vouchers, and notifications.

## Tech Stack
- Frontend (buyer storefront): Next.js 16 (App Router) + React 19, TypeScript
- Frontend (seller/admin dashboards): React 19 + Vite, TypeScript
- Backend: NestJS v11, TypeScript — modular monolith, feature-based
- Database: PostgreSQL 15+
- Cache/ephemeral layer: Redis (session, cart cache, rate limiting)
- Search: Meilisearch/Elasticsearch, synced from Postgres (product search) — see backend ARCHITECTURE.md

## Structure
```
├── 01-frontend-nextjs/       → @01-frontend-nextjs/CLAUDE.md (buyer storefront)
├── 02-frontend-react-vite/   → @02-frontend-react-vite/CLAUDE.md (seller + admin dashboards)
├── 03-backend-nestjs/        → @03-backend-nestjs/docs/ARCHITECTURE.md, @03-backend-nestjs/docs/PROJECT-RULES.md
├── 00-share-docs/            → Shared API/DB contract, read by all 3 apps
└── ShopHub-Design-System/    → High-fidelity design references (.dc.html), not code
```

Each backend/frontend app has its own `docker-compose.yml` + `.env.example` for local Postgres + Redis.

## Shared Docs
- @00-share-docs/API_SPEC.md — REST contract: auth flow, response envelope, error codes, endpoints by feature
- @00-share-docs/DATABASE.md — schema by feature, relationships, migration rules

## Design Reference
- @ShopHub-Design-System/design_handoff_shophub/README.md — design tokens (colors/type/spacing) + full 22-screen list, shared by both frontend apps

## Available Skills

### Git
- `commit-code` — stages and commits changes following this repo's Conventional Commits convention. Use when the user asks to commit, "commit code", "commit giúp tôi", "lưu thay đổi vào git". Never runs proactively — only on explicit request.

### Skill Routing
When user asks to:
- "commit", "commit code", "lưu thay đổi vào git", "push code" → use the `commit-code` skill

## Important
- Read the relevant shared doc (`API_SPEC.md` / `DATABASE.md`) BEFORE writing backend or frontend code that touches the API contract or schema
- Each app has its own CLAUDE.md (frontends) or `docs/ARCHITECTURE.md` + `docs/PROJECT-RULES.md` (backend) — read those before writing feature code in that app
- No cross-feature internal imports in any app — only via a feature's public barrel/module, per each app's PROJECT-RULES.md
- Design files (`.dc.html`) are high-fidelity references to recreate pixel-close, not code to copy directly
