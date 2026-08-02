import type { PrismaClient } from '../../../generated/prisma/client';
import { randomVnAddress } from '../data/vietnam-locations';
import { randomVnPhone } from '../data/vietnamese-names';

export interface SeededAddress {
  userId: number;
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  isDefault: boolean;
}

/** Each buyer gets 1-2 addresses (most people have exactly one saved address, a
 * minority have a second — e.g. home + office). Returns the default address per
 * buyer for reuse as the `shippingAddress` snapshot on seeded orders. */
export async function seedAddresses(
  prisma: PrismaClient,
  buyers: { id: number; fullName: string }[],
): Promise<Map<number, SeededAddress>> {
  const rows: SeededAddress[] = [];
  const defaultByBuyer = new Map<number, SeededAddress>();

  for (const buyer of buyers) {
    const addressCount = Math.random() < 0.25 ? 2 : 1;
    for (let i = 0; i < addressCount; i++) {
      const loc = randomVnAddress();
      const address: SeededAddress = {
        userId: buyer.id,
        recipientName: buyer.fullName,
        phone: randomVnPhone(),
        province: loc.province,
        district: loc.district,
        ward: loc.ward,
        detailAddress: loc.detailAddress,
        isDefault: i === 0,
      };
      rows.push(address);
      if (i === 0) defaultByBuyer.set(buyer.id, address);
    }
  }

  await prisma.address.createMany({ data: rows });
  console.log(`  Seeded ${rows.length} addresses for ${buyers.length} buyers`);

  return defaultByBuyer;
}
