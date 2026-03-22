'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'
import type { RecentSaleRow } from '@/lib/sales'
import { NairaPrice } from '@/components/naira-price'
import { formatInteger } from '@/lib/format-numbers'

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      className="flex flex-wrap gap-2 justify-between py-2 border-b"
      style={{ borderColor: 'var(--border)' }}
    >
      <dt className="text-sm shrink-0" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </dt>
      <dd className="text-sm text-right min-w-0 wrap-break-word m-0">{children}</dd>
    </div>
  )
}

export function SaleLineDetailDialog({
  row,
  onClose,
}: {
  row: RecentSaleRow
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useLayoutEffect(() => {
    const d = dialogRef.current
    if (!d) return
    d.showModal()
    return () => {
      d.close()
    }
  }, [row])

  const hasDevice = Boolean(row.unitIdentifier)

  return (
    <dialog
      ref={dialogRef}
      className="product-dialog product-dialog-sm"
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
    >
      <div className="product-dialog-inner">
        <div className="product-dialog-hd">
          <h2 className="product-dialog-title">{row.productName}</h2>
          <p className="text-sm mt-1 mb-0" style={{ color: 'var(--text-secondary)' }}>
            {new Date(row.createdAt).toLocaleString()}
          </p>
        </div>

        <dl className="m-0">
          <DetailRow label="Customer">
            {row.customerName}
            <br />
            <span className="font-mono text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {row.customerPhone}
            </span>
          </DetailRow>
          <DetailRow label="Quantity">{formatInteger(row.quantity)}</DetailRow>
          <DetailRow label="Price">
            <NairaPrice value={row.unitPrice} />
          </DetailRow>
          <DetailRow label="Line total">
            <NairaPrice value={row.lineTotal} />
          </DetailRow>
          {hasDevice && (
            <DetailRow label="Device">
              {row.unitIdentifier}
              {row.unitIdentifierKind && (
                <>
                  {' '}
                  <span style={{ color: 'var(--text-tertiary)' }}>({row.unitIdentifierKind})</span>
                </>
              )}
            </DetailRow>
          )}
          <DetailRow label="Seller">{row.soldBy}</DetailRow>
        </dl>

        <div className="product-dialog-actions">
          <button type="button" className="btn btn-primary w-full" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  )
}
