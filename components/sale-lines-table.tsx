'use client'

import { NairaPrice } from '@/components/naira-price'
import type { RecentSaleRow } from '@/lib/sales'
import { formatInteger } from '@/lib/format-numbers'

export function SaleLinesTable({
  rows,
  loading,
  emptyMessage,
  onRowClick,
}: {
  rows: RecentSaleRow[]
  loading: boolean
  emptyMessage: string
  onRowClick: (row: RecentSaleRow) => void
}) {
  if (loading) {
    return (
      <div className="p-6" style={{ minHeight: '240px' }}>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-md"
              style={{
                background: 'var(--ink-100)',
                animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>
      </div>
    )
  }
  if (rows.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 px-4"
        style={{ minHeight: '280px' }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--ink-300)', marginBottom: '16px' }}
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        <p className="text-sm m-0" style={{ color: 'var(--text-secondary)' }}>
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Customer</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Total</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.saleItemId}
              tabIndex={0}
              onClick={() => onRowClick(r)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onRowClick(r)
                }
              }}
              aria-label={`View details for ${r.productName}`}
            >
              <td style={{ fontWeight: 500 }}>{r.productName}</td>
              <td>{r.customerName || '—'}</td>
              <td className="text-right">{formatInteger(r.quantity)}</td>
              <td className="text-right">
                <NairaPrice value={r.lineTotal} />
              </td>
              <td className="whitespace-nowrap" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
