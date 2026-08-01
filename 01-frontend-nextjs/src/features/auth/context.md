# Feature: auth (storefront)

## Purpose
Login, register, and forgot-password screens for the buyer storefront, wired to the NestJS `auth` API (`03-backend-nestjs/src/features/auth`).

## Key decisions
- Session (`user`, `accessToken`, `refreshToken`) is persisted client-side via Zustand + `persist` (localStorage) — see `shared/stores/session.store.ts`. This is an MVP simplification; the backend doesn't set httpOnly cookies, so tokens live in JS-accessible storage. Revisit before production (XSS exposure).
- `shared/services/api-client.ts` unwraps the backend's `{ success, data, meta }` envelope down to `data`, attaches the access token, and does a single silent refresh-and-retry on `401` (skipped for `/auth/*` endpoints to avoid loops).
- Forgot-password has **no backend endpoint yet** (not in `API_SPEC.md`) — the form validates the email client-side and shows a "coming soon" notice instead of calling a real API.
- Error codes from the backend (`AUTH_004/005/006`, `VALIDATION_001`) are mapped to Vietnamese messages in `utils/error-message.util.ts`.

## Owner
Built as part of the initial vibecode pass, following `ShopHub-Design-System/design_handoff_shophub/Auth.dc.html`.
