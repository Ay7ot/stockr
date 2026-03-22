'use client'

import { formatNairaAmount } from '@/lib/format-numbers'

/**
 * Renders ₦ + amount with the symbol sized to match tabular digits (₦ often renders oversized in system fonts).
 */
export function NairaPrice({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  return (
    <span className={className ? `currency-naira ${className}` : 'currency-naira'}>
      <span className="currency-naira__symbol" aria-hidden>
        ₦
      </span>
      <span className="currency-naira__amount">{formatNairaAmount(value)}</span>
    </span>
  )
}
