import type { PrismaClient } from '../../../generated/prisma/client';

const ALL_TABLES = [
  'notifications',
  'vouchers',
  'wishlists',
  'reviews',
  'shipments',
  'payments',
  'order_items',
  'orders',
  'order_groups',
  'cart_items',
  'carts',
  'product_moderation_logs',
  'product_images',
  'product_variants',
  'products',
  'categories',
  'shops',
  'addresses',
  'users',
];

/** TRUNCATE ... CASCADE resets every table (and identity sequences) in one
 * statement, in a single transaction — far faster than deleteMany() chains, and
 * makes every seed run idempotent (safe to re-run from a clean slate). Dev/local
 * seed tooling only; never run against a shared or production database. */
export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  const tableList = ALL_TABLES.map((t) => `"${t}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`);
  console.log(`  Truncated ${ALL_TABLES.length} tables`);
}
