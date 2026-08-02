import type { PrismaClient } from '../../../generated/prisma/client';
import { WeightedPicker, randomInt } from '../lib/random';
import type { SeededProduct } from './05-products';

const CART_BUYER_SHARE = 0.3; // ~30% of buyers currently have something in their cart

export async function seedCarts(
  prisma: PrismaClient,
  buyers: { id: number }[],
  products: SeededProduct[],
): Promise<void> {
  const sellable = products.filter(
    (p) => p.status === 'active' && p.variants.some((v) => v.stockQuantity > 0),
  );
  if (sellable.length === 0) return;

  const picker = new WeightedPicker(
    sellable,
    sellable.map((p) => p.popularityWeight),
  );

  const shoppers = buyers.filter(() => Math.random() < CART_BUYER_SHARE);
  let itemCount = 0;

  for (const buyer of shoppers) {
    const cart = await prisma.cart.create({ data: { userId: buyer.id } });
    const itemsInCart = randomInt(1, 3);
    const usedVariantIds = new Set<number>();

    for (let i = 0; i < itemsInCart; i++) {
      const product = picker.pick();
      const inStockVariants = product.variants.filter((v) => v.stockQuantity > 0);
      if (inStockVariants.length === 0) continue;
      const variant = inStockVariants[randomInt(0, inStockVariants.length - 1)];
      if (usedVariantIds.has(variant.id)) continue;
      usedVariantIds.add(variant.id);

      // Cart quantity must respect actual stock (CART_001 in API_SPEC.md is exactly
      // this constraint) — never seed a cart line that's already over-stock.
      const quantity = randomInt(1, Math.min(3, variant.stockQuantity));
      await prisma.cartItem.create({
        data: { cartId: cart.id, variantId: variant.id, quantity },
      });
      itemCount += 1;
    }
  }

  console.log(`  Seeded ${shoppers.length} open carts with ${itemCount} items`);
}
