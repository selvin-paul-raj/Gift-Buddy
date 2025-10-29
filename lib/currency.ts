/**
 * Format currency based on team currency.
 */
export function formatCurrency(amount: number, currency: string = "IDR") {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "id-ID", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
}
