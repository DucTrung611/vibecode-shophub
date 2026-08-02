import type { PrismaClient } from '../../../generated/prisma/client';

/** Recomputes derived stats (`products.sold_count`/`rating_avg`,
 * `shops.total_sold`/`rating_avg`) from the order/review rows just seeded, rather
 * than tracking running totals through every earlier step — simpler to keep
 * correct, and it's exactly what these columns are supposed to reflect. */
export async function recomputeAggregates(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRawUnsafe(`
    UPDATE products p
    SET sold_count = agg.total_qty
    FROM (
      SELECT oi.product_id, SUM(oi.quantity)::int AS total_qty
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status = 'delivered'
      GROUP BY oi.product_id
    ) agg
    WHERE p.id = agg.product_id
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE products p
    SET rating_avg = agg.avg_rating
    FROM (
      SELECT product_id, ROUND(AVG(rating)::numeric, 2) AS avg_rating
      FROM reviews
      GROUP BY product_id
    ) agg
    WHERE p.id = agg.product_id
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE shops s
    SET total_sold = agg.total_qty
    FROM (
      SELECT o.shop_id, SUM(oi.quantity)::int AS total_qty
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status = 'delivered'
      GROUP BY o.shop_id
    ) agg
    WHERE s.id = agg.shop_id
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE shops s
    SET rating_avg = agg.avg_rating
    FROM (
      SELECT p.shop_id, ROUND(AVG(r.rating)::numeric, 2) AS avg_rating
      FROM reviews r
      JOIN products p ON p.id = r.product_id
      GROUP BY p.shop_id
    ) agg
    WHERE s.id = agg.shop_id
  `);

  console.log('  Recomputed product/shop sold_count and rating_avg from real order/review data');
}
