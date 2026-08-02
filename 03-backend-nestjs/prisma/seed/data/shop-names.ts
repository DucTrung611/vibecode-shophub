/** Curated real-sounding shop names (the kind you'd actually see on Shopee/Lazada/Tiki),
 * loosely grouped by the category the shop mostly sells in. */

export const SHOP_NAME_POOL: string[] = [
  'TechZone Official Store',
  'MobileWorld Chính Hãng',
  'Điện Thoại Giá Sỉ',
  'Laptop Việt Store',
  'PC House Official',
  'Gia Dụng Thông Minh',
  'Nhà Bếp Xinh',
  'HomeStyle Living',
  'Fashion House VN',
  'Local Brand Store',
  'Xưởng May Việt',
  'Giày Sneaker Việt',
  'Shoes Center VN',
  'Beauty Corner Official',
  'Mỹ Phẩm Chính Hãng',
  'Skincare Việt Store',
  'Sport Gear VN',
  'Outdoor Life Store',
  'Mẹ và Bé Shop',
  'BabyCare Official',
  'Nhà Sách Tri Thức',
  'Văn Phòng Phẩm Xinh',
  'Phụ Kiện Số Việt',
  'Gadget Hub VN',
  'Thời Trang Công Sở',
  'Street Style Store',
  'Đồng Hồ Thời Trang',
  'Túi Xách Cao Cấp',
  'Nội Thất Xinh',
  'Elec World Store',
];

export function shopSlugSuffix(index: number): string {
  return String(index).padStart(2, '0');
}
