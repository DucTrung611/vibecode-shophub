export interface ExternalProduct {
  name: string;
  categorySlug: string;
  images: string[];
  source: 'dummyjson' | 'fakestoreapi';
}

/** DummyJSON category slug → our seed category slug. Categories with no reasonable
 * mapping (motorcycle, vehicle, groceries has a weak fit only) are simply skipped. */
const DUMMYJSON_CATEGORY_MAP: Record<string, string> = {
  smartphones: 'dien-thoai-phu-kien',
  'mobile-accessories': 'dien-thoai-phu-kien',
  laptops: 'laptop-may-tinh',
  tablets: 'laptop-may-tinh',
  'mens-shirts': 'thoi-trang-nam',
  'mens-watches': 'thoi-trang-nam',
  tops: 'thoi-trang-nu',
  'womens-dresses': 'thoi-trang-nu',
  'womens-jewellery': 'thoi-trang-nu',
  'womens-watches': 'thoi-trang-nu',
  'mens-shoes': 'giay-dep',
  'womens-shoes': 'giay-dep',
  beauty: 'my-pham-lam-dep',
  fragrances: 'my-pham-lam-dep',
  'skin-care': 'my-pham-lam-dep',
  furniture: 'do-gia-dung',
  'home-decoration': 'do-gia-dung',
  'kitchen-accessories': 'do-gia-dung',
  groceries: 'do-gia-dung',
  'sports-accessories': 'the-thao-du-lich',
  sunglasses: 'the-thao-du-lich',
  'womens-bags': 'the-thao-du-lich',
};

const FAKESTORE_CATEGORY_MAP: Record<string, string> = {
  "men's clothing": 'thoi-trang-nam',
  "women's clothing": 'thoi-trang-nu',
  jewelery: 'thoi-trang-nu',
  electronics: 'dien-thoai-phu-kien',
};

interface DummyJsonProduct {
  title: string;
  category: string;
  thumbnail?: string;
  images?: string[];
}

interface FakeStoreProduct {
  title: string;
  category: string;
  image: string;
}

async function fetchJson<T>(url: string, timeoutMs = 8000): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchDummyJson(): Promise<ExternalProduct[]> {
  const data = await fetchJson<{ products: DummyJsonProduct[] }>(
    'https://dummyjson.com/products?limit=194',
  );
  if (!data) return [];
  const result: ExternalProduct[] = [];
  for (const p of data.products) {
    const categorySlug = DUMMYJSON_CATEGORY_MAP[p.category];
    if (!categorySlug) continue;
    const images = (p.images && p.images.length > 0 ? p.images : [p.thumbnail]).filter(
      (url): url is string => Boolean(url),
    );
    result.push({ name: p.title, categorySlug, images, source: 'dummyjson' });
  }
  return result;
}

async function fetchFakeStoreApi(): Promise<ExternalProduct[]> {
  const data = await fetchJson<FakeStoreProduct[]>('https://fakestoreapi.com/products');
  if (!data) return [];
  const result: ExternalProduct[] = [];
  for (const p of data) {
    const categorySlug = FAKESTORE_CATEGORY_MAP[p.category];
    if (!categorySlug) continue;
    result.push({ name: p.title, categorySlug, images: [p.image], source: 'fakestoreapi' });
  }
  return result;
}

/** Fetches from both public sources in parallel; either can fail independently
 * (network hiccup, rate limit) without aborting the seed — the curated static
 * lists in data/curated-products.ts cover the gap either way. */
export async function fetchExternalProducts(): Promise<ExternalProduct[]> {
  const [dummyJson, fakeStore] = await Promise.all([
    fetchDummyJson().catch(() => []),
    fetchFakeStoreApi().catch(() => []),
  ]);
  return [...dummyJson, ...fakeStore];
}

/** Groups every fetched external product's real photos by our category slug,
 * regardless of whether the product's *name* was reused. Curated-list products
 * (no external counterpart by name — e.g. "Áo sơ mi nam công sở dài tay") borrow a
 * real photo from this pool instead of shipping with no image at all — the same
 * way many real marketplace sellers reuse similar stock photography across
 * near-identical listings. */
export function buildCategoryImagePools(external: ExternalProduct[]): Map<string, string[]> {
  const pools = new Map<string, string[]>();
  for (const product of external) {
    const list = pools.get(product.categorySlug) ?? [];
    list.push(...product.images);
    pools.set(product.categorySlug, list);
  }
  return pools;
}

interface OpenLibraryDoc {
  cover_i?: number;
}

/** Real book cover art from Open Library (free, keyless) for the actual real book
 * titles in data/curated-products.ts's `sach-van-phong-pham` list — DummyJSON/Fake
 * Store API have no book category, so this fills that specific gap. Only looked up
 * for genuine book titles (see BOOK_TITLES in curated-products.ts); stationery
 * items in the same category (pens, notebooks) have no equivalent free photo
 * source and are seeded without an image rather than a mismatched one. */
export async function fetchBookCovers(
  titles: string[],
  searchQueryOverrides: Record<string, string>,
): Promise<Map<string, string>> {
  const covers = new Map<string, string>();
  await Promise.all(
    titles.map(async (title) => {
      const searchTerm = searchQueryOverrides[title];
      if (!searchTerm) return; // no confident English-title mapping — skip rather than guess
      const query = encodeURIComponent(searchTerm);
      const data = await fetchJson<{ docs: OpenLibraryDoc[] }>(
        `https://openlibrary.org/search.json?q=${query}&fields=cover_i&limit=1`,
      ).catch(() => null);
      const coverId = data?.docs?.[0]?.cover_i;
      if (coverId) {
        covers.set(title, `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`);
      }
    }),
  );
  return covers;
}
