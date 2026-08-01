const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

/**
 * Money fields come back from the API as strings (Prisma Decimal serializes
 * to a string over JSON), so this accepts either and normalizes first.
 */
export function formatPrice(value: string | number): string {
  const amount = typeof value === "string" ? Number(value) : value;
  return currencyFormatter.format(amount);
}
