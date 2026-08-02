# Feature: admin-users

## Purpose
`/admin/users` — role-filtered, searchable user table with a lock/unlock action. Wired to
`GET /admin/users` and `PATCH /admin/users/:id/status`.

## Key decisions
- The design mock (`User Management.dc.html`) shows a KPI row above the table (buyers /
  sellers / admins broken out). There's still no dedicated "role counts" endpoint, but
  `GET /admin/users` accepts a `role` filter and its `meta.total` is an exact count for
  that role — `useUserRoleCounts` fires 3 parallel `limit=1` requests (one per role) and
  reads `meta.total` off each, rather than adding a backend endpoint or fabricating
  numbers. "Total users" isn't shown since it'd be a 4th request for a number the 3 role
  cards already sum to.
- Locking a user requires confirming via `Modal` first (brief calls this out explicitly
  as "a meaningful action") — unlocking also goes through the same modal for consistency,
  though it's lower-stakes.
- `useAdminUsers` keeps `placeholderData` from the previous page while refetching so the
  table doesn't flash to a loading state on every filter/page change.

## Owner
Built as part of the Admin Panel implementation pass (5 admin screens).
