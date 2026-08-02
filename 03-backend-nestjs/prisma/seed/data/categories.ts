export interface SeedCategory {
  slug: string;
  name: string;
  /** VND, drives skewedPriceInRange() for every product in this category. */
  minPrice: number;
  maxPrice: number;
  commissionRate: number;
}

export const SEED_CATEGORIES: SeedCategory[] = [
  { slug: 'dien-thoai-phu-kien', name: 'Điện thoại & Phụ kiện', minPrice: 150_000, maxPrice: 32_000_000, commissionRate: 3.5 },
  { slug: 'laptop-may-tinh', name: 'Laptop & Máy tính', minPrice: 4_000_000, maxPrice: 45_000_000, commissionRate: 3 },
  { slug: 'thoi-trang-nam', name: 'Thời trang nam', minPrice: 89_000, maxPrice: 850_000, commissionRate: 8 },
  { slug: 'thoi-trang-nu', name: 'Thời trang nữ', minPrice: 79_000, maxPrice: 950_000, commissionRate: 8 },
  { slug: 'giay-dep', name: 'Giày dép', minPrice: 199_000, maxPrice: 2_800_000, commissionRate: 7 },
  { slug: 'my-pham-lam-dep', name: 'Mỹ phẩm & Làm đẹp', minPrice: 45_000, maxPrice: 1_600_000, commissionRate: 6 },
  { slug: 'do-gia-dung', name: 'Đồ gia dụng', minPrice: 120_000, maxPrice: 9_500_000, commissionRate: 5 },
  { slug: 'the-thao-du-lich', name: 'Thể thao & Du lịch', minPrice: 99_000, maxPrice: 3_200_000, commissionRate: 6 },
  { slug: 'me-be', name: 'Mẹ & Bé', minPrice: 39_000, maxPrice: 1_300_000, commissionRate: 7 },
  { slug: 'sach-van-phong-pham', name: 'Sách & Văn phòng phẩm', minPrice: 15_000, maxPrice: 320_000, commissionRate: 10 },
];
