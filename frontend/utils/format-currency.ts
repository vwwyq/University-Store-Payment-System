/**
 * Formats a number as Indian Rupees (₹)
 * @param amount The amount to format
 * @param options Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  options: {
    decimals?: number
    showSymbol?: boolean
  } = {},
): string {
  const { decimals = 0, showSymbol = true } = options

  // Format with Indian numbering system (lakhs, crores)
  const formatter = new Intl.NumberFormat("en-IN", {
    style: showSymbol ? "currency" : "decimal",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return formatter.format(amount)
}

