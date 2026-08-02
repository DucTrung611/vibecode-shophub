/** Real Vietnamese provinces/cities with a curated set of real districts each.
 * Wards mix real named wards (major cities) with the numbered "Phường N" pattern
 * that's genuinely how most wards in these districts are named. */

export interface SeedProvince {
  province: string;
  districts: { district: string; wards: string[] }[];
}

export const VN_PROVINCES: SeedProvince[] = [
  {
    province: 'TP. Hồ Chí Minh',
    districts: [
      { district: 'Quận 1', wards: ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Kho', 'Phường Đa Kao'] },
      { district: 'Quận 3', wards: ['Phường Võ Thị Sáu', 'Phường 4', 'Phường 5', 'Phường 6'] },
      { district: 'Quận 7', wards: ['Phường Tân Phong', 'Phường Tân Phú', 'Phường Phú Thuận'] },
      { district: 'TP. Thủ Đức', wards: ['Phường Linh Trung', 'Phường Bình Thọ', 'Phường Hiệp Bình Chánh'] },
      { district: 'Quận Bình Thạnh', wards: ['Phường 13', 'Phường 15', 'Phường 25'] },
    ],
  },
  {
    province: 'Hà Nội',
    districts: [
      { district: 'Quận Ba Đình', wards: ['Phường Cống Vị', 'Phường Ngọc Hà', 'Phường Kim Mã'] },
      { district: 'Quận Cầu Giấy', wards: ['Phường Dịch Vọng', 'Phường Nghĩa Đô', 'Phường Trung Hòa'] },
      { district: 'Quận Đống Đa', wards: ['Phường Láng Hạ', 'Phường Kim Liên', 'Phường Ô Chợ Dừa'] },
      { district: 'Quận Hoàng Mai', wards: ['Phường Đại Kim', 'Phường Định Công', 'Phường Hoàng Liệt'] },
    ],
  },
  {
    province: 'Đà Nẵng',
    districts: [
      { district: 'Quận Hải Châu', wards: ['Phường Thạch Thang', 'Phường Hòa Thuận Đông'] },
      { district: 'Quận Thanh Khê', wards: ['Phường Tam Thuận', 'Phường Xuân Hà'] },
      { district: 'Quận Sơn Trà', wards: ['Phường An Hải Bắc', 'Phường Mân Thái'] },
    ],
  },
  {
    province: 'Cần Thơ',
    districts: [
      { district: 'Quận Ninh Kiều', wards: ['Phường Tân An', 'Phường An Phú', 'Phường Xuân Khánh'] },
      { district: 'Quận Cái Răng', wards: ['Phường Lê Bình', 'Phường Hưng Thạnh'] },
    ],
  },
  {
    province: 'Hải Phòng',
    districts: [
      { district: 'Quận Hồng Bàng', wards: ['Phường Quang Trung', 'Phường Minh Khai'] },
      { district: 'Quận Lê Chân', wards: ['Phường An Biên', 'Phường Cát Dài'] },
    ],
  },
  {
    province: 'Bình Dương',
    districts: [
      { district: 'TP. Thủ Dầu Một', wards: ['Phường Phú Cường', 'Phường Hiệp Thành'] },
      { district: 'TP. Dĩ An', wards: ['Phường Dĩ An', 'Phường Tân Đông Hiệp'] },
    ],
  },
  {
    province: 'Đồng Nai',
    districts: [
      { district: 'TP. Biên Hòa', wards: ['Phường Tân Phong', 'Phường Trảng Dài', 'Phường Long Bình'] },
    ],
  },
  {
    province: 'Khánh Hòa',
    districts: [
      { district: 'TP. Nha Trang', wards: ['Phường Lộc Thọ', 'Phường Vĩnh Hải', 'Phường Phước Long'] },
    ],
  },
  {
    province: 'Thừa Thiên Huế',
    districts: [
      { district: 'TP. Huế', wards: ['Phường Vĩnh Ninh', 'Phường Phú Hội', 'Phường An Cựu'] },
    ],
  },
  {
    province: 'An Giang',
    districts: [
      { district: 'TP. Long Xuyên', wards: ['Phường Mỹ Bình', 'Phường Mỹ Long'] },
    ],
  },
];

export function randomVnAddress(): {
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
} {
  const provinceEntry = VN_PROVINCES[Math.floor(Math.random() * VN_PROVINCES.length)];
  const districtEntry =
    provinceEntry.districts[Math.floor(Math.random() * provinceEntry.districts.length)];
  const ward = districtEntry.wards[Math.floor(Math.random() * districtEntry.wards.length)];
  const houseNumber = Math.floor(Math.random() * 400) + 1;
  const streetNames = [
    'Nguyễn Trãi', 'Lê Lợi', 'Trần Hưng Đạo', 'Hai Bà Trưng', 'Nguyễn Huệ',
    'Điện Biên Phủ', 'Cách Mạng Tháng Tám', 'Phan Đình Phùng', 'Lý Thường Kiệt',
    'Nguyễn Văn Cừ', 'Võ Văn Tần', 'Pasteur', 'Hoàng Diệu', 'Trường Chinh',
  ];
  const street = streetNames[Math.floor(Math.random() * streetNames.length)];
  return {
    province: provinceEntry.province,
    district: districtEntry.district,
    ward,
    detailAddress: `${houseNumber} ${street}`,
  };
}
