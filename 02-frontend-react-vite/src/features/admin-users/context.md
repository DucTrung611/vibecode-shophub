# Feature: admin-users

## Purpose
`/admin/users` — role-filtered, searchable user table with a lock/unlock action. Wired to
`GET /admin/users` and `PATCH /admin/users/:id/status`.

## Key decisions
- The design mock (`User Management.dc.html`) shows a 4-KPI row above the table (total
  users / buyers / sellers / admins broken out). The backend has no endpoint returning
  that per-role breakdown (`GET /admin/users` only returns the *currently filtered*
  page's `meta.total`, not all four counts simultaneously) — rather than fabricate the
  other three numbers, the KPI row is omitted. Noted as a deviation from the mock.
- Locking a user requires confirming via `Modal` first (brief calls this out explicitly
  as "a meaningful action") — unlocking also goes through the same modal for consistency,
  though it's lower-stakes.
- `useAdminUsers` keeps `placeholderData` from the previous page while refetching so the
  table doesn't flash to a loading state on every filter/page change.

## Owner
Built as part of the Admin Panel implementation pass (5 admin screens).
