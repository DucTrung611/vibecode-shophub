import type { PrismaClient } from '../../../generated/prisma/client';
import { randomVnAddress } from '../data/vietnam-locations';
import { randomVnPhone } from '../data/vietnamese-names';
import { SHOP_NAME_POOL, shopSlugSuffix } from '../data/shop-names';
import { pickMany, randomInt, shuffle } from '../lib/random';
import { slugify } from '../../../src/shared/utils/slugify.util';
import type { SeededCategory } from './01-categories';

export type ShopTier = 'power' | 'mid' | 'long-tail';

export interface SeededShop {
  id: number;
  ownerId: number;
  tier: ShopTier;
  targetProductCount: number;
  status: 'approved' | 'pending' | 'suspended' | 'rejected';
  /** Real marketplace shops specialize — each shop only lists products from 1-2
   * categories rather than a random spread across all 10. */
  categorySlugs: string[];
}

const TIER_CONFIG: { tier: ShopTier; count: number; productRange: [number, number] }[] = [
  { tier: 'power', count: 3, productRange: [50, 80] },
  { tier: 'mid', count: 5, productRange: [20, 35] },
  { tier: 'long-tail', count: 10, productRange: [5, 15] },
];

const STATUS_WEIGHTS: { status: 'approved' | 'pending' | 'suspended' | 'rejected'; weight: number }[] = [
  { status: 'approved', weight: 80 },
  { status: 'pending', weight: 10 },
  { status: 'suspended', weight: 5 },
  { status: 'rejected', weight: 5 },
];

function pickShopStatus(): 'approved' | 'pending' | 'suspended' | 'rejected' {
  const total = STATUS_WEIGHTS.reduce((sum, s) => sum + s.weight, 0);
  let threshold = Math.random() * total;
  for (const entry of STATUS_WEIGHTS) {
    threshold -= entry.weight;
    if (threshold <= 0) return entry.status;
  }
  return 'approved';
}

export async function seedShops(
  prisma: PrismaClient,
  sellers: { id: number; fullName: string }[],
  categories: SeededCategory[],
): Promise<SeededShop[]> {
  const tiers: ShopTier[] = [];
  const productTargets: number[] = [];
  for (const config of TIER_CONFIG) {
    for (let i = 0; i < config.count; i++) {
      tiers.push(config.tier);
      productTargets.push(randomInt(config.productRange[0], config.productRange[1]));
    }
  }

  const names = pickMany(SHOP_NAME_POOL, sellers.length);
  const seeded: SeededShop[] = [];

  for (let i = 0; i < sellers.length; i++) {
    const seller = sellers[i];
    const tier = tiers[i] ?? 'long-tail';
    const targetProductCount = productTargets[i] ?? randomInt(5, 15);
    const name = names[i] ?? `${SHOP_NAME_POOL[i % SHOP_NAME_POOL.length]} ${shopSlugSuffix(i)}`;
    const categoryCount = Math.random() < 0.3 ? 2 : 1;
    const categorySlugs = shuffle(categories)
      .slice(0, categoryCount)
      .map((c) => c.slug);
    const slug = `${slugify(name)}-${shopSlugSuffix(i)}`;
    const status = pickShopStatus();
    const loc = randomVnAddress();

    const shop = await prisma.shop.create({
      data: {
        ownerId: seller.id,
        name,
        slug,
        status,
        rejectionReason: status === 'rejected' ? 'Giấy phép kinh doanh không hợp lệ' : null,
        description: `${name} — chuyên cung cấp sản phẩm chính hãng, cam kết chất lượng và giao hàng nhanh chóng toàn quốc.`,
        phone: randomVnPhone(),
        email: `contact@${slug.replace(/-/g, '')}.vn`,
        province: loc.province,
        district: loc.district,
        ward: loc.ward,
        detailAddress: loc.detailAddress,
        shippingSettings: { defaultCarrier: 'GHN', baseShippingFee: randomInt(15, 35) * 1000 },
        paymentSettings: { bankName: 'Vietcombank', bankAccountNumber: String(randomInt(1e9, 9e9)) },
        notificationSettings: { notifyOnNewOrder: true, notifyOnLowStock: true },
      },
    });

    seeded.push({ id: shop.id, ownerId: seller.id, tier, targetProductCount, status, categorySlugs });
  }

  console.log(`  Seeded ${seeded.length} shops (3 power, 5 mid, 10 long-tail)`);
  return seeded;
}
