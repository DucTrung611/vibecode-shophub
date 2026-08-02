import type { PrismaClient } from '../../../generated/prisma/client';
import { slugify } from '../../../src/shared/utils/slugify.util';
import { CURATED_PRODUCTS } from '../data/curated-products';
import type { ExternalProduct } from '../lib/external-products';
import { pick, pickMany, randomInt, shuffle, skewedPriceInRange, zipfWeights } from '../lib/random';
import type { SeededCategory } from './01-categories';
import type { SeededShop } from './04-shops';

const BOOK_CATEGORY_SLUG = 'sach-van-phong-pham';

const FLAG_REASONS = [
  'Hình ảnh không đúng với mô tả sản phẩm',
  'Nghi ngờ hàng nhái/giả mạo thương hiệu',
  'Giá bán bất thường so với thị trường',
  'Mô tả sản phẩm vi phạm chính sách quảng cáo',
];

const STATUS_WEIGHTS: { status: 'active' | 'draft' | 'flagged' | 'inactive'; weight: number }[] = [
  { status: 'active', weight: 88 },
  { status: 'draft', weight: 4 },
  { status: 'flagged', weight: 6 },
  { status: 'inactive', weight: 2 },
];

function pickProductStatus() {
  const total = STATUS_WEIGHTS.reduce((sum, s) => sum + s.weight, 0);
  let threshold = Math.random() * total;
  for (const entry of STATUS_WEIGHTS) {
    threshold -= entry.weight;
    if (threshold <= 0) return entry.status;
  }
  return 'active' as const;
}

interface VariantAttributeSet {
  attributes: Record<string, string>;
}

const COLORS = ['Đen', 'Trắng', 'Xám', 'Xanh Navy', 'Be', 'Đỏ'];
const CLOTHING_SIZES = ['S', 'M', 'L', 'XL'];
const SHOE_SIZES = ['38', '39', '40', '41', '42'];
const STORAGE_OPTIONS = ['128GB', '256GB', '512GB'];

function variantAttributeSets(categorySlug: string): VariantAttributeSet[] {
  if (categorySlug === 'dien-thoai-phu-kien' || categorySlug === 'laptop-may-tinh') {
    const count = randomInt(1, 3);
    return shuffle(STORAGE_OPTIONS)
      .slice(0, count)
      .map((storage) => ({ attributes: { 'phiên bản': storage } }));
  }
  if (categorySlug === 'thoi-trang-nam' || categorySlug === 'thoi-trang-nu') {
    const colors = shuffle(COLORS).slice(0, randomInt(1, 3));
    const sizes = shuffle(CLOTHING_SIZES).slice(0, randomInt(1, 3));
    const sets: VariantAttributeSet[] = [];
    for (const color of colors) {
      for (const size of sizes) {
        sets.push({ attributes: { màu: color, size } });
      }
    }
    return sets.slice(0, 6);
  }
  if (categorySlug === 'giay-dep') {
    const sizes = shuffle(SHOE_SIZES).slice(0, randomInt(2, 4));
    return sizes.map((size) => ({ attributes: { size } }));
  }
  // Everything else (beauty, home goods, sports, mom & baby, books): usually one SKU,
  // occasionally a couple of pack-size/color variants.
  if (Math.random() < 0.3) {
    return shuffle(COLORS)
      .slice(0, randomInt(2, 3))
      .map((color) => ({ attributes: { 'phân loại': color } }));
  }
  return [{ attributes: { 'phân loại': 'Mặc định' } }];
}

interface PlannedProduct {
  name: string;
  slug: string;
  shopId: number;
  categoryId: number;
  categorySlug: string;
  images: string[];
  status: 'active' | 'draft' | 'flagged' | 'inactive';
  flagReason: string | null;
}

export interface SeededProduct {
  id: number;
  name: string;
  shopId: number;
  categoryId: number;
  status: string;
  popularityWeight: number;
  variants: { id: number; price: number; stockQuantity: number; attributes: Record<string, string> }[];
}

function buildNamePools(
  categories: SeededCategory[],
  external: ExternalProduct[],
): Map<string, { name: string; images: string[] }[]> {
  const pools = new Map<string, { name: string; images: string[] }[]>();
  for (const category of categories) {
    const fromExternal = external
      .filter((p) => p.categorySlug === category.slug)
      .map((p) => ({ name: p.name, images: p.images }));
    const fromCurated = (CURATED_PRODUCTS[category.slug] ?? []).map((name) => ({
      name,
      images: [] as string[],
    }));
    pools.set(category.slug, [...fromExternal, ...fromCurated]);
  }
  return pools;
}

export async function seedProducts(
  prisma: PrismaClient,
  shops: SeededShop[],
  categories: SeededCategory[],
  external: ExternalProduct[],
  categoryImagePools: Map<string, string[]>,
  bookCovers: Map<string, string>,
): Promise<SeededProduct[]> {
  const namePools = buildNamePools(categories, external);
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

  const planned: PlannedProduct[] = [];
  let slugCounter = 0;
  let borrowedImageCount = 0;

  for (const shop of shops) {
    const usedNamesInShop = new Set<string>();
    for (let i = 0; i < shop.targetProductCount; i++) {
      const categorySlug = pick(shop.categorySlugs);
      const category = categoryBySlug.get(categorySlug);
      if (!category) continue;
      const pool = namePools.get(categorySlug) ?? [];
      if (pool.length === 0) continue;

      let candidate = pick(pool);
      // Avoid the same shop listing the identical name twice; a small number of
      // retries is enough given pool sizes, then just accept the duplicate.
      for (let attempt = 0; attempt < 5 && usedNamesInShop.has(candidate.name); attempt++) {
        candidate = pick(pool);
      }
      usedNamesInShop.add(candidate.name);

      // Curated (non-API) products ship with no photo of their own — borrow a
      // real one: an Open Library cover for genuine book titles, otherwise a
      // random real photo from another product in the same category (see
      // lib/external-products.ts#buildCategoryImagePools). Categories with no
      // external source at all (e.g. "Mẹ & Bé") stay imageless rather than get a
      // mismatched stock photo.
      let images = candidate.images;
      if (images.length === 0) {
        const bookCover = categorySlug === BOOK_CATEGORY_SLUG ? bookCovers.get(candidate.name) : undefined;
        if (bookCover) {
          images = [bookCover];
          borrowedImageCount += 1;
        } else {
          const imagePool = categoryImagePools.get(categorySlug) ?? [];
          if (imagePool.length > 0) {
            images = pickMany(imagePool, Math.min(2, imagePool.length));
            borrowedImageCount += 1;
          }
        }
      }

      slugCounter += 1;
      const status = pickProductStatus();
      planned.push({
        name: candidate.name,
        slug: `${slugify(candidate.name)}-${slugCounter}`,
        shopId: shop.id,
        categoryId: category.id,
        categorySlug,
        images,
        status,
        flagReason: status === 'flagged' ? pick(FLAG_REASONS) : null,
      });
    }
  }
  console.log(`  ${borrowedImageCount} curated-list products borrowed a real photo from their category pool`);

  // Zipf popularity: shuffle first so rank isn't correlated with shop/category order.
  const weights = zipfWeights(planned.length);
  const shuffledIndices = shuffle(planned.map((_, i) => i));
  const weightBySlug = new Map<string, number>();
  shuffledIndices.forEach((productIndex, rank) => {
    weightBySlug.set(planned[productIndex].slug, weights[rank]);
  });
  const hotThreshold = weights[Math.floor(planned.length * 0.15)] ?? 0;

  const seeded: SeededProduct[] = [];
  const CHUNK_SIZE = 40;

  for (let start = 0; start < planned.length; start += CHUNK_SIZE) {
    const chunk = planned.slice(start, start + CHUNK_SIZE);

    const createdProducts = await prisma.product.createManyAndReturn({
      data: chunk.map((p) => ({
        shopId: p.shopId,
        categoryId: p.categoryId,
        name: p.name,
        slug: p.slug,
        status: p.status,
        flagReason: p.flagReason,
        moderatedAt: p.status === 'active' ? new Date() : null,
      })),
    });

    const bySlug = new Map(createdProducts.map((row) => [row.slug, row]));

    const variantRows: {
      productId: number;
      sku: string;
      attributes: Record<string, string>;
      price: number;
      compareAtPrice: number | null;
      stockQuantity: number;
    }[] = [];
    const imageRows: { productId: number; url: string; sortOrder: number }[] = [];

    for (const p of chunk) {
      const row = bySlug.get(p.slug);
      if (!row) continue;
      const category = categoryBySlug.get(p.categorySlug)!;
      const weight = weightBySlug.get(p.slug) ?? 0;
      const isHot = weight >= hotThreshold;

      const attributeSets = variantAttributeSets(p.categorySlug);
      attributeSets.forEach((set, variantIndex) => {
        const price = skewedPriceInRange(category.minPrice, category.maxPrice);
        const hasCompareAt = Math.random() < 0.35;
        const compareAtPrice = hasCompareAt
          ? Math.round((price * (1.1 + Math.random() * 0.4)) / 1000) * 1000
          : null;
        const stockQuantity = isHot ? randomInt(150, 400) : randomInt(5, 50);
        variantRows.push({
          productId: row.id,
          // `row.slug` already embeds a globally unique counter (see slugCounter
          // above), so appending the variant index after it keeps every SKU
          // unique without needing a length-truncated (and collision-prone) slice.
          sku: `${row.slug}-V${variantIndex + 1}`.toUpperCase(),
          attributes: set.attributes,
          price,
          compareAtPrice,
          stockQuantity,
        });
      });

      p.images.forEach((url, index) => {
        imageRows.push({ productId: row.id, url, sortOrder: index });
      });
    }

    const createdVariants = await prisma.productVariant.createManyAndReturn({
      data: variantRows,
    });

    if (imageRows.length > 0) {
      await prisma.productImage.createMany({ data: imageRows });
    }

    const variantsByProduct = new Map<
      number,
      { id: number; price: number; stockQuantity: number; attributes: Record<string, string> }[]
    >();
    for (const v of createdVariants) {
      const list = variantsByProduct.get(v.productId) ?? [];
      list.push({
        id: v.id,
        price: Number(v.price),
        stockQuantity: v.stockQuantity,
        attributes: v.attributes as Record<string, string>,
      });
      variantsByProduct.set(v.productId, list);
    }

    for (const p of chunk) {
      const row = bySlug.get(p.slug);
      if (!row) continue;
      seeded.push({
        id: row.id,
        name: row.name,
        shopId: row.shopId,
        categoryId: row.categoryId,
        status: row.status,
        popularityWeight: weightBySlug.get(p.slug) ?? 0,
        variants: variantsByProduct.get(row.id) ?? [],
      });
    }

    console.log(`  Seeded ${Math.min(start + CHUNK_SIZE, planned.length)}/${planned.length} products...`);
  }

  return seeded;
}
