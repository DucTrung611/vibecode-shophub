/** Curated real Vietnamese name components — surnames are weighted by their actual
 * population frequency (Nguyễn/Trần/Lê dominate), not picked uniformly. */

export const VN_SURNAMES_WEIGHTED: { name: string; weight: number }[] = [
  { name: 'Nguyễn', weight: 38 },
  { name: 'Trần', weight: 11 },
  { name: 'Lê', weight: 9.5 },
  { name: 'Phạm', weight: 7.1 },
  { name: 'Hoàng', weight: 5.1 },
  { name: 'Huỳnh', weight: 5.0 },
  { name: 'Phan', weight: 4.5 },
  { name: 'Vũ', weight: 3.9 },
  { name: 'Võ', weight: 3.9 },
  { name: 'Đặng', weight: 2.1 },
  { name: 'Bùi', weight: 2.0 },
  { name: 'Đỗ', weight: 1.4 },
  { name: 'Hồ', weight: 1.3 },
  { name: 'Ngô', weight: 1.3 },
  { name: 'Dương', weight: 1.0 },
  { name: 'Lý', weight: 0.5 },
];

export const VN_MALE_MIDDLE_NAMES = ['Văn', 'Hữu', 'Đức', 'Minh', 'Thành', 'Quang', 'Anh', 'Công'];
export const VN_FEMALE_MIDDLE_NAMES = ['Thị', 'Ngọc', 'Thu', 'Kim', 'Hồng', 'Diệu', 'Bảo', 'Thanh'];

export const VN_MALE_GIVEN_NAMES = [
  'An', 'Bảo', 'Cường', 'Dũng', 'Đạt', 'Đức', 'Duy', 'Hải', 'Hào', 'Hiếu',
  'Hoàng', 'Huy', 'Khang', 'Khánh', 'Kiên', 'Lâm', 'Long', 'Minh', 'Nam',
  'Nghĩa', 'Phát', 'Phong', 'Phúc', 'Quân', 'Quang', 'Sơn', 'Thắng', 'Thành',
  'Thịnh', 'Tiến', 'Tùng', 'Việt', 'Vinh',
];

export const VN_FEMALE_GIVEN_NAMES = [
  'An', 'Anh', 'Chi', 'Diệp', 'Dung', 'Duyên', 'Giang', 'Hà', 'Hạnh', 'Hoa',
  'Huệ', 'Huyền', 'Lan', 'Linh', 'Mai', 'My', 'Ngân', 'Nga', 'Ngọc', 'Nhi',
  'Nhung', 'Oanh', 'Phương', 'Quỳnh', 'Thảo', 'Thu', 'Thúy', 'Trang', 'Trâm',
  'Uyên', 'Vân', 'Yến',
];

export function weightedSurname(): string {
  const total = VN_SURNAMES_WEIGHTED.reduce((sum, s) => sum + s.weight, 0);
  let threshold = Math.random() * total;
  for (const entry of VN_SURNAMES_WEIGHTED) {
    threshold -= entry.weight;
    if (threshold <= 0) return entry.name;
  }
  return VN_SURNAMES_WEIGHTED[0].name;
}

export function randomVnFullName(): { fullName: string; gender: 'male' | 'female' } {
  const gender: 'male' | 'female' = Math.random() < 0.5 ? 'male' : 'female';
  const surname = weightedSurname();
  const middle =
    gender === 'male'
      ? VN_MALE_MIDDLE_NAMES[Math.floor(Math.random() * VN_MALE_MIDDLE_NAMES.length)]
      : VN_FEMALE_MIDDLE_NAMES[Math.floor(Math.random() * VN_FEMALE_MIDDLE_NAMES.length)];
  const given =
    gender === 'male'
      ? VN_MALE_GIVEN_NAMES[Math.floor(Math.random() * VN_MALE_GIVEN_NAMES.length)]
      : VN_FEMALE_GIVEN_NAMES[Math.floor(Math.random() * VN_FEMALE_GIVEN_NAMES.length)];
  return { fullName: `${surname} ${middle} ${given}`, gender };
}

const EMAIL_PROVIDERS = ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com'];

export function emailFromName(fullName: string, disambiguator: number): string {
  const parts = fullName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .split(' ');
  const given = parts[parts.length - 1];
  const initials = parts.slice(0, -1).map((p) => p[0]).join('');
  const provider = EMAIL_PROVIDERS[Math.floor(Math.random() * EMAIL_PROVIDERS.length)];
  return `${given}${initials}${disambiguator}@${provider}`;
}

export function randomVnPhone(): string {
  const prefixes = ['090', '091', '093', '094', '096', '097', '098', '032', '033', '034', '035', '070', '079', '081', '083'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const rest = String(Math.floor(Math.random() * 10_000_000)).padStart(7, '0');
  return `${prefix}${rest}`;
}
