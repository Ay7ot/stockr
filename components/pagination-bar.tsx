'use client'

import { formatInteger } from '@/lib/format-numbers'

export function PaginationBar({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (p: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1
  const to = Math.min(safePage * pageSize, total)
  const canPrev = safePage > 1
  const canNext = safePage < totalPages

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-5"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <p className="text-xs uppercase m-0" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.6px' }}>
        Showing{' '}
        <span className="font-mono" style={{ color: 'var(--text-primary)', letterSpacing: 0 }}>
          {formatInteger(from)}–{formatInteger(to)}
        </span>{' '}
        of{' '}
        <span className="font-mono" style={{ color: 'var(--text-primary)', letterSpacing: 0 }}>
          {formatInteger(total)}
        </span>
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={!canPrev}
          onClick={() => onPageChange(safePage - 1)}
          aria-label="Previous page"
        >
          Previous
        </button>
        <span
          className="text-xs font-mono px-1"
          style={{ color: 'var(--text-secondary)' }}
          aria-live="polite"
        >
          {safePage} / {totalPages}
        </span>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={!canNext}
          onClick={() => onPageChange(safePage + 1)}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  )
}
