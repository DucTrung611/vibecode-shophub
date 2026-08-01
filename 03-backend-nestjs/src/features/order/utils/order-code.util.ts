export function generateOrderCode(
  orderId: number,
  date: Date = new Date(),
): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `SH-${yyyy}${mm}${dd}-${orderId}`;
}
