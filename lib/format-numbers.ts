/** Nigerian Naira (₦) — comma grouping for amounts. */

export const FORMAT_LOCALE = 'en-US'

/** Whole numbers: stock, units, counts. */
export function formatInteger(n: number): string {
  return new Intl.NumberFormat(FORMAT_LOCALE, { maximumFractionDigits: 0 }).format(n)
}

/** Currency amounts without symbol (inputs / tables add ₦ separately). */
export function formatNairaAmount(n: number): string {
  return new Intl.NumberFormat(FORMAT_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n)
}

/** Price with ₦ prefix. */
export function formatNairaWithPrefix(n: number): string {
  return `₦${formatNairaAmount(n)}`
}

/** @deprecated Use formatNairaAmount — kept for older imports */
export function formatUsdAmount(n: number): string {
  return formatNairaAmount(n)
}

/** @deprecated Use formatNairaWithPrefix — kept for older imports */
export function formatUsdWithPrefix(n: number): string {
  return formatNairaWithPrefix(n)
}

/** Strip grouping for form submission. */
export function stripNumberGrouping(s: string): string {
  return s.replace(/,/g, '').trim()
}
