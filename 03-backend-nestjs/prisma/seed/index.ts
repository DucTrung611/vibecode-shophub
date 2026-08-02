import { prisma } from './lib/client';
import { resetDatabase } from './lib/reset';
import { BOOK_COVER_SEARCH_QUERY, BOOK_TITLES } from './data/curated-products';
import {
  buildCategoryImagePools,
  fetchBookCovers,
  fetchExternalProducts,
} from './lib/external-products';
import { seedCategories } from './steps/01-categories';
import { seedUsers } from './steps/02-users';
import { seedAddresses } from './steps/03-addresses';
import { seedShops } from './steps/04-shops';
import { seedProducts } from './steps/05-products';
import { seedCarts } from './steps/06-carts';
import { seedOrders } from './steps/07-orders';
import { seedReviews } from './steps/08-reviews';
import { seedWishlists, seedVouchers } from './steps/09-extras';
import { recomputeAggregates } from './steps/10-aggregates';

async function main() {
  const startedAt = Date.now();
  console.log('ShopHub seed — starting\n');

  console.log('[0/10] Fetching real product data from DummyJSON + Fake Store API...');
  const external = await fetchExternalProducts();
  console.log(`  Fetched ${external.length} usable products from public APIs`);
  const categoryImagePools = buildCategoryImagePools(external);
  const bookCovers = await fetchBookCovers(BOOK_TITLES, BOOK_COVER_SEARCH_QUERY);
  console.log(`  Fetched ${bookCovers.size}/${BOOK_TITLES.length} real book covers from Open Library`);

  console.log('\n[1/10] Resetting database...');
  await resetDatabase(prisma);

  console.log('\n[2/10] Seeding categories...');
  const categories = await seedCategories(prisma);

  console.log('\n[3/10] Seeding users (admin, sellers, buyers)...');
  const users = await seedUsers(prisma);

  console.log('\n[4/10] Seeding buyer addresses...');
  const defaultAddressByBuyer = await seedAddresses(prisma, users.buyers);

  console.log('\n[5/10] Seeding shops...');
  const shops = await seedShops(prisma, users.sellers, categories);

  console.log('\n[6/10] Seeding products, variants, images...');
  const products = await seedProducts(
    prisma,
    shops,
    categories,
    external,
    categoryImagePools,
    bookCovers,
  );

  console.log('\n[7/10] Seeding open carts...');
  await seedCarts(prisma, users.buyers, products);

  console.log('\n[8/10] Seeding orders, items, payments, shipments...');
  const reviewCandidates = await seedOrders(prisma, users.buyers, shops, products, defaultAddressByBuyer);

  console.log('\n[9/10] Seeding reviews...');
  await seedReviews(prisma, reviewCandidates);

  console.log('\n[10/10] Seeding wishlists, vouchers, recomputing aggregates...');
  await seedWishlists(prisma, users.buyers, products);
  await seedVouchers(prisma, shops);
  await recomputeAggregates(prisma);

  const counts = await getCounts();
  const elapsedSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);

  console.log('\n──────────────────────────────────────────');
  console.log('Seed complete in', elapsedSeconds, 'seconds');
  console.log('──────────────────────────────────────────');
  for (const [label, count] of Object.entries(counts)) {
    console.log(`  ${label.padEnd(16)} ${count}`);
  }
  console.log('\nAll seeded accounts share the password: Password123!');
  console.log('  Admin:  admin@shophub.vn');
  console.log('  Seller/buyer emails: check the `users` table (seller.*/buyer.* prefixes)');
}

async function getCounts() {
  const [
    users,
    shops,
    categories,
    products,
    variants,
    orders,
    orderItems,
    reviews,
    carts,
    wishlists,
    vouchers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.shop.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.order.count(),
    prisma.orderItem.count(),
    prisma.review.count(),
    prisma.cart.count(),
    prisma.wishlist.count(),
    prisma.voucher.count(),
  ]);
  return { users, shops, categories, products, variants, orders, orderItems, reviews, carts, wishlists, vouchers };
}

main()
  .catch((err) => {
    console.error('\nSeed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
