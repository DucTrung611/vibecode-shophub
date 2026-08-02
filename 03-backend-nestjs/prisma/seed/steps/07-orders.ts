import type { PrismaClient } from '../../../generated/prisma/client';
import type { SeededAddress } from './03-addresses';
import type { SeededShop } from './04-shops';
import type { SeededProduct } from './05-products';
import { OrderTimeSampler } from '../lib/order-time';
import { WeightedPicker, addDays, addHours, pick, randomInt, zipfWeights } from '../lib/random';

const ORDER_TOTAL_TARGET = 950;
const SEED_WINDOW_DAYS = 182; // ~6 months
const SHIPPING_FEE_OPTIONS = [0, 15_000, 20_000, 25_000, 30_000, 35_000];
const CARRIERS = ['GHN', 'GHTK', 'Viettel Post', 'J&T Express'];
const PAYMENT_METHODS = ['cod', 'vnpay', 'momo', 'bank_transfer'];

export interface ReviewCandidate {
  orderItemId: number;
  productId: number;
  buyerId: number;
  orderDeliveredAt: Date;
}

interface PlannedItem {
  productId: number;
  variantId: number;
  productName: string;
  attributes: Record<string, string>;
  unitPrice: number;
  quantity: number;
}

interface PlannedOrder {
  orderCode: string;
  buyerId: number;
  shopId: number;
  createdAt: Date;
  items: PlannedItem[];
  groupKey: number; // links sibling orders from the same checkout
}

function pickOrderStatus(daysAgo: number): {
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
} {
  const r = Math.random();
  if (daysAgo < 2) {
    if (r < 0.3) return { status: 'pending', paymentStatus: 'pending' };
    if (r < 0.7) return { status: 'confirmed', paymentStatus: 'paid' };
    if (r < 0.9) return { status: 'shipped', paymentStatus: 'paid' };
    return { status: 'cancelled', paymentStatus: 'failed' };
  }
  if (daysAgo < 6) {
    if (r < 0.1) return { status: 'confirmed', paymentStatus: 'paid' };
    if (r < 0.4) return { status: 'shipped', paymentStatus: 'paid' };
    if (r < 0.9) return { status: 'delivered', paymentStatus: 'paid' };
    return { status: 'cancelled', paymentStatus: 'refunded' };
  }
  return r < 0.92
    ? { status: 'delivered', paymentStatus: 'paid' }
    : { status: 'cancelled', paymentStatus: 'refunded' };
}

/** Buyers are Pareto-weighted too — a handful of repeat shoppers place most orders,
 * matching the same "20% drives 80%" instruction that applies to product popularity. */
function buildBuyerPicker(buyers: { id: number }[]): WeightedPicker<{ id: number }> {
  const weights = zipfWeights(buyers.length, 0.9);
  const shuffled = [...buyers].sort(() => Math.random() - 0.5);
  return new WeightedPicker(shuffled, weights);
}

export async function seedOrders(
  prisma: PrismaClient,
  buyers: { id: number }[],
  shops: SeededShop[],
  products: SeededProduct[],
  defaultAddressByBuyer: Map<number, SeededAddress>,
): Promise<ReviewCandidate[]> {
  const sellableByShop = new Map<number, SeededProduct[]>();
  for (const p of products) {
    if (p.status !== 'active') continue;
    if (p.variants.length === 0) continue;
    const list = sellableByShop.get(p.shopId) ?? [];
    list.push(p);
    sellableByShop.set(p.shopId, list);
  }
  const sellableShops = shops.filter((s) => s.status === 'approved' && sellableByShop.has(s.id));
  if (sellableShops.length === 0) {
    console.log('  No approved shops with sellable products — skipping order seeding');
    return [];
  }

  const buyerPicker = buildBuyerPicker(buyers);
  const now = new Date();
  const windowStart = addDays(now, -SEED_WINDOW_DAYS);
  const timeSampler = new OrderTimeSampler(windowStart, now);

  const planned: PlannedOrder[] = [];
  let orderSeq = 0;
  let groupSeq = 0;

  while (planned.length < ORDER_TOTAL_TARGET) {
    const buyer = buyerPicker.pick();
    const createdAt = timeSampler.sample();
    const shopCount = Math.random() < 0.15 ? 2 : 1;
    const checkoutShops = pickDistinctShops(sellableShops, shopCount);
    groupSeq += 1;

    for (const shop of checkoutShops) {
      const shopProducts = sellableByShop.get(shop.id)!;
      const itemPicker = new WeightedPicker(
        shopProducts,
        shopProducts.map((p) => p.popularityWeight),
      );
      const itemCount = randomInt(1, 4);
      const items: PlannedItem[] = [];
      const usedVariants = new Set<number>();

      for (let i = 0; i < itemCount; i++) {
        const product = itemPicker.pick();
        const variant = pick(product.variants);
        if (usedVariants.has(variant.id)) continue;
        usedVariants.add(variant.id);
        items.push({
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          attributes: variant.attributes,
          unitPrice: variant.price,
          quantity: randomInt(1, 3),
        });
      }
      if (items.length === 0) continue;

      orderSeq += 1;
      const yyyymmdd = `${createdAt.getFullYear()}${String(createdAt.getMonth() + 1).padStart(2, '0')}${String(createdAt.getDate()).padStart(2, '0')}`;
      planned.push({
        // Real production derives this from the DB-assigned order id (see
        // order-code.util.ts); the seed script self-manages a sequence instead
        // since it inserts orders in batches before ids are known.
        orderCode: `SH-${yyyymmdd}-${String(orderSeq).padStart(6, '0')}`,
        buyerId: buyer.id,
        shopId: shop.id,
        createdAt,
        items,
        groupKey: groupSeq,
      });

      if (planned.length >= ORDER_TOTAL_TARGET) break;
    }
  }

  const reviewCandidates: ReviewCandidate[] = [];
  const CHUNK_SIZE = 25;
  let created = 0;

  for (let start = 0; start < planned.length; start += CHUNK_SIZE) {
    const chunk = planned.slice(start, start + CHUNK_SIZE);

    // One OrderGroup per checkout in this chunk (siblings share a groupKey).
    const groupKeys = [...new Set(chunk.map((o) => o.groupKey))];
    const buyerByGroupKey = new Map(chunk.map((o) => [o.groupKey, o.buyerId]));
    const createdGroups = await prisma.orderGroup.createManyAndReturn({
      data: groupKeys.map((key) => ({ buyerId: buyerByGroupKey.get(key)! })),
    });
    // Safe to zip by array position: a single createMany call issues one
    // multi-row INSERT ... RETURNING, and Postgres preserves input row order
    // for that statement — same assumption used for variants/images in 05-products.ts.
    const groupIdByKey = new Map(groupKeys.map((key, i) => [key, createdGroups[i].id]));

    const daysAgoByCode = new Map(
      chunk.map((o) => [o.orderCode, Math.floor((now.getTime() - o.createdAt.getTime()) / 86_400_000)]),
    );

    const createdOrders = await prisma.order.createManyAndReturn({
      data: chunk.map((o) => {
        const subtotal = o.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        const shippingFee = pick(SHIPPING_FEE_OPTIONS);
        const address = defaultAddressByBuyer.get(o.buyerId);
        const { status, paymentStatus } = pickOrderStatus(daysAgoByCode.get(o.orderCode)!);
        return {
          orderGroupId: groupIdByKey.get(o.groupKey)!,
          orderCode: o.orderCode,
          buyerId: o.buyerId,
          shopId: o.shopId,
          status,
          paymentStatus,
          subtotal,
          shippingFee,
          totalAmount: subtotal + shippingFee,
          shippingAddress: address
            ? {
                recipientName: address.recipientName,
                phone: address.phone,
                province: address.province,
                district: address.district,
                ward: address.ward,
                detailAddress: address.detailAddress,
              }
            : {},
          createdAt: o.createdAt,
          updatedAt: o.createdAt,
        };
      }),
    });

    const orderIdByCode = new Map(createdOrders.map((row) => [row.orderCode, row.id]));

    const itemRows: {
      orderId: number;
      productId: number;
      variantId: number;
      productNameSnapshot: string;
      variantAttrsSnapshot: Record<string, string>;
      unitPrice: number;
      quantity: number;
      subtotal: number;
    }[] = [];
    // Parallel array so we can zip item rows back to their (buyerId, order status)
    // after insert, for review eligibility — same order-preservation assumption.
    const itemMeta: { buyerId: number; status: string; createdAt: Date; productId: number }[] = [];

    for (const o of chunk) {
      const orderId = orderIdByCode.get(o.orderCode)!;
      const orderRow = createdOrders.find((row) => row.id === orderId)!;
      for (const item of o.items) {
        itemRows.push({
          orderId,
          productId: item.productId,
          variantId: item.variantId,
          productNameSnapshot: item.productName,
          variantAttrsSnapshot: item.attributes,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          subtotal: item.unitPrice * item.quantity,
        });
        itemMeta.push({
          buyerId: o.buyerId,
          status: orderRow.status,
          createdAt: o.createdAt,
          productId: item.productId,
        });
      }
    }

    const createdItems = await prisma.orderItem.createManyAndReturn({ data: itemRows });
    createdItems.forEach((row, index) => {
      const meta = itemMeta[index];
      if (meta.status === 'delivered') {
        reviewCandidates.push({
          orderItemId: row.id,
          productId: meta.productId,
          buyerId: meta.buyerId,
          orderDeliveredAt: addDays(meta.createdAt, randomInt(2, 6)),
        });
      }
    });

    // Payments: one per order.
    await prisma.payment.createMany({
      data: chunk.map((o) => {
        const orderId = orderIdByCode.get(o.orderCode)!;
        const orderRow = createdOrders.find((row) => row.id === orderId)!;
        const amount = Number(orderRow.totalAmount);
        const txnStatus =
          orderRow.paymentStatus === 'paid'
            ? 'success'
            : orderRow.paymentStatus === 'refunded'
              ? 'refunded'
              : orderRow.paymentStatus === 'failed'
                ? 'failed'
                : 'pending';
        return {
          orderId,
          method: pick(PAYMENT_METHODS),
          amount,
          status: txnStatus,
          paidAt: txnStatus === 'success' || txnStatus === 'refunded' ? o.createdAt : null,
        };
      }),
    });

    // Shipments: only for orders that actually reached shipped/delivered.
    const shipmentRows = chunk
      .map((o) => {
        const orderId = orderIdByCode.get(o.orderCode)!;
        const orderRow = createdOrders.find((row) => row.id === orderId)!;
        if (orderRow.status !== 'shipped' && orderRow.status !== 'delivered') return null;
        const shippedAt = addDays(o.createdAt, randomInt(1, 2));
        const deliveredAt =
          orderRow.status === 'delivered' ? addHours(shippedAt, randomInt(24, 96)) : null;
        return {
          orderId,
          carrier: pick(CARRIERS),
          trackingNumber: `VN${randomInt(100000000, 999999999)}`,
          status: orderRow.status === 'delivered' ? 'delivered' : 'shipped',
          shippedAt,
          deliveredAt,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    if (shipmentRows.length > 0) {
      await prisma.shipment.createMany({ data: shipmentRows });
    }

    created += chunk.length;
    console.log(`  Seeded ${created}/${planned.length} orders...`);
  }

  return reviewCandidates;
}

function pickDistinctShops(shops: SeededShop[], count: number): SeededShop[] {
  if (count >= shops.length) return shops;
  const pool = [...shops];
  const result: SeededShop[] = [];
  for (let i = 0; i < count; i++) {
    const index = randomInt(0, pool.length - 1);
    result.push(pool[index]);
    pool.splice(index, 1);
  }
  return result;
}
