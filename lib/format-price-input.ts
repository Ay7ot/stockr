import { formatNairaAmount, stripNumberGrouping } from '@/lib/format-numbers'

/** Comma-grouped amount for price text fields (e.g. 1,234.56). */
export const formatPriceInputDisplay = formatNairaAmount

/** Raw numeric string for form submission (no commas). */
export function priceInputToSubmitValue(display: string): string {
  return stripNumberGrouping(display)
}
