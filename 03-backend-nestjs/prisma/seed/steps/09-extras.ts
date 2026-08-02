import type { PrismaClient } from '../../../generated/prisma/client';
import type { SeededShop } from './04-shops';
import type { SeededProduct } from './05-products';
import { WeightedPicker, addDays, pick, pickMany, randomInt } from '../lib/random';

const WISHLIST_BUYER_SHARE = 0.45;
const VOUCHER_CODE_PREFIXES = ['SALE', 'FREESHIP', 'GIAM', 'HOT'];

export async function seedWishlists(
  prisma: PrismaClient,
  buyers: { id: number }[],
  products: SeededProduct[],
): Promise<void> {
  const active = products.filter((p) => p.status === 'active');
  if (active.length === 0) return;
  const picker = new WeightedPicker(
    active,
    active.map((p) => p.popularityWeight),
  );

  const shoppers = buyers.filter(() => Math.random() < WISHLIST_BUYER_SHARE);
  const rows: { userId: number; productId: number }[] = [];

  for (const buyer of shoppers) {
    const count = randomInt(1, 6);
    const seen = new Set<number>();
    for (let i = 0; i < count; i++) {
      const product = picker.pick();
      if (seen.has(product.id)) continue;
      seen.add(product.id);
      rows.push({ userId: buyer.id, productId: product.id });
    }
  }

  if (rows.length > 0) {
    await prisma.wishlist.createMany({ data: rows, skipDuplicates: true });
  }
  console.log(`  Seeded ${rows.length} wishlist entries for ${shoppers.length} buyers`);
}

export async function seedVouchers(prisma: PrismaClient, shops: SeededShop[]): Promise<void> {
  const now = new Date();
  const rows: {
    shopId: number | null;
    code: string;
    type: 'percentage' | 'fixed_amount';
    value: number;
    minOrderAmount: number | null;
    maxDiscount: number | null;
    usageLimit: number | null;
    usedCount: number;
    startsAt: Date;
    endsAt: Date;
  }[] = [];

  // Platform-wide vouchers (shopId: null).
  rows.push(
    {
      shopId: null,
      code: 'SHOPHUB50K',
      type: 'fixed_amount',
      value: 50_000,
      minOrderAmount: 300_000,
      maxDiscount: null,
      usageLimit: 1000,
      usedCount: randomInt(100, 900),
      startsAt: addDays(now, -30),
      endsAt: addDays(now, 30),
    },
    {
      shopId: null,
      code: 'FREESHIP0D',
      type: 'fixed_amount',
      value: 30_000,
      minOrderAmount: 0,
      maxDiscount: null,
      usageLimit: null,
      usedCount: randomInt(500, 3000),
      startsAt: addDays(now, -60),
      endsAt: addDays(now, 60),
    },
  );

  const approvedShops = pickMany(
    shops.filter((s) => s.status === 'approved'),
    Math.min(10, shops.length),
  );
  for (const shop of approvedShops) {
    const isPercentage = Math.random() < 0.6;
    const code = `${pick(VOUCHER_CODE_PREFIXES)}${shop.id}${randomInt(10, 99)}`;
    rows.push({
      shopId: shop.id,
      code,
      type: isPercentage ? 'percentage' : 'fixed_amount',
      value: isPercentage ? randomInt(5, 20) : randomInt(10, 50) * 1000,
      minOrderAmount: randomInt(50, 300) * 1000,
      maxDiscount: isPercentage ? randomInt(30, 100) * 1000 : null,
      usageLimit: randomInt(50, 300),
      usedCount: randomInt(0, 40),
      startsAt: addDays(now, -randomInt(1, 20)),
      endsAt: addDays(now, randomInt(10, 60)),
    });
  }

  await prisma.voucher.createMany({ data: rows });
  console.log(`  Seeded ${rows.length} vouchers (2 platform-wide + ${approvedShops.length} shop)`);
}
