-- Runs once on first container start (empty data volume only).
-- Table/enum creation is owned by ORM migrations (see 00-share-docs/DATABASE.md §5) — do not add DDL here.
CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- fuzzy/text search support (product name, shop name)
CREATE EXTENSION IF NOT EXISTS unaccent;  -- accent-insensitive slug/search matching
