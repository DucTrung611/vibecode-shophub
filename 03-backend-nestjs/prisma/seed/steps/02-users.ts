import * as bcrypt from 'bcrypt';
import type { PrismaClient } from '../../../generated/prisma/client';
import { emailFromName, randomVnFullName, randomVnPhone } from '../data/vietnamese-names';

const BCRYPT_ROUNDS = 10;
const SEED_PASSWORD = 'Password123!';

export interface SeededUsers {
  admin: { id: number };
  sellers: { id: number; fullName: string }[];
  buyers: { id: number; fullName: string }[];
}

const SELLER_COUNT = 18;
const BUYER_COUNT = 50;

export async function seedUsers(prisma: PrismaClient): Promise<SeededUsers> {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, BCRYPT_ROUNDS);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@shophub.vn',
      phone: randomVnPhone(),
      passwordHash,
      fullName: 'Quản Trị Viên ShopHub',
      role: 'admin',
      isActive: true,
      emailVerifiedAt: new Date(),
    },
  });

  const sellerData = Array.from({ length: SELLER_COUNT }, (_, i) => {
    const { fullName } = randomVnFullName();
    return {
      email: `seller.${emailFromName(fullName, i)}`,
      phone: randomVnPhone(),
      passwordHash,
      fullName,
      role: 'seller' as const,
      isActive: true,
      emailVerifiedAt: new Date(),
    };
  });
  const sellers = await prisma.user.createManyAndReturn({ data: sellerData });

  const buyerData = Array.from({ length: BUYER_COUNT }, (_, i) => {
    const { fullName } = randomVnFullName();
    // ~4% of buyer accounts are locked, matching real platforms having a small
    // share of disabled/banned accounts rather than every account being active.
    const isActive = Math.random() > 0.04;
    return {
      email: `buyer.${emailFromName(fullName, i)}`,
      phone: randomVnPhone(),
      passwordHash,
      fullName,
      role: 'buyer' as const,
      isActive,
      emailVerifiedAt: Math.random() > 0.1 ? new Date() : null,
    };
  });
  const buyers = await prisma.user.createManyAndReturn({ data: buyerData });

  console.log(`  Seeded 1 admin, ${sellers.length} sellers, ${buyers.length} buyers`);
  console.log(`  All seeded accounts share password: ${SEED_PASSWORD}`);

  return {
    admin: { id: admin.id },
    sellers: sellers.map((s) => ({ id: s.id, fullName: s.fullName })),
    buyers: buyers.map((b) => ({ id: b.id, fullName: b.fullName })),
  };
}
