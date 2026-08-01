# Feature: auth (seller/admin dashboard)

## Purpose
Login screen for the shared Seller Center + Admin Panel app, wired to the same NestJS `auth` API used by the buyer storefront.

## Key decisions
- Only `/login` exists here (no register/forgot-password) — sellers are onboarded via `POST /shops` elsewhere; admins are provisioned directly. Matches `ShopHub-Design-System/design_handoff_shophub/README.md`'s stated routing model for this app.
- No `.dc.html` mock exists for this screen (not among the 5 Seller Center / 5 Admin Panel screens) — this is an original design reusing the shared Hub Blue/Sora/Manrope tokens and the buyer app's split-screen shell concept, deliberately neutral (no seller- or admin-specific branding) since the role is unknown until after login.
- `useLogin` rejects `buyer` role accounts client-side (`WrongRoleError`) — this is a UX guard only; the backend's `RolesGuard` is the real security boundary.
- Session persistence mirrors the buyer app's MVP simplification: tokens in a Zustand `persist` store (localStorage), not httpOnly cookies — see `shared/stores/session.store.ts`.
- Post-login landing (`/seller`, `/admin`) is a placeholder stub — the actual Seller/Admin Dashboard screens are a separate, larger pass.

## Owner
Built as part of the initial vibecode pass, mirroring the buyer storefront's auth feature.
