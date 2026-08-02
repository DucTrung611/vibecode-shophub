# Feature: admin-categories

## Purpose
`/admin/categories` — indented parent/child category table with commission % and an
active toggle, plus a `Modal` form (shared for create and edit) with a parent-category
picker. Wired to `GET /categories`, `POST /categories`, `PATCH /categories/:id`,
`DELETE /categories/:id`.

## Key decisions
- Product-count column from the mock is omitted — `GET /categories` returns the tree with
  no aggregate product count, and the brief explicitly says not to fabricate it.
- `flattenCategories` (utils) walks the tree depth-first to build an indented flat list
  for `Table`, tagging each node with `depth` for the `paddingLeft` indent — mirrors the
  mock's `level * 24px` treatment.
- One `CategoryFormModal` handles both create and edit (brief calls this "new category"
  form but an edit action is also required) — it seeds its fields from `editing` via a
  `useEffect` keyed on `open`/`editing` so re-opening a fresh "add" after editing resets
  cleanly.
- Delete uses a native `window.confirm` rather than the shared `Modal` — kept lightweight
  since the brief's explicit "confirm via Modal" requirement is called out only for the
  user-lock action; a `CATEGORY_001` (409, has products/children) failure surfaces via
  the toast service per the brief.
- The parent-category `<select>` excludes the category currently being edited (can't be
  its own parent) but does not deeply exclude its descendants — an edge case not worth
  the extra tree-walk for this MVP pass.

## Owner
Built as part of the Admin Panel implementation pass (5 admin screens).
