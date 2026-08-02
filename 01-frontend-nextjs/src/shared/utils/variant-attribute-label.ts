const ATTRIBUTE_LABELS: Record<string, string> = {
  size: "Kích thước",
  color: "Màu sắc",
  material: "Chất liệu",
  style: "Kiểu dáng",
};

export function formatAttributeLabel(key: string): string {
  return ATTRIBUTE_LABELS[key.toLowerCase()] ?? key;
}
