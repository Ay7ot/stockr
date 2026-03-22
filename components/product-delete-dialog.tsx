'use client'

import { useLayoutEffect, useRef, useState, useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { deleteProduct } from '@/app/actions/products'
import type { Product } from '@/types/database'

export function ProductDeleteDialog({
  product,
  onClose,
}: {
  product: Product
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useLayoutEffect(() => {
    const d = dialogRef.current
    if (!d) return
    d.showModal()
    return () => {
      d.close()
    }
  }, [])

  const handleConfirm = () => {
    if (!product) return
    setError(null)
    startTransition(async () => {
      const result = await deleteProduct(product.id)
      if (result?.success && result.deletedId) {
        // Invalidate all product queries to refresh the current page
        queryClient.invalidateQueries({ queryKey: ['products'] })
        onClose()
      } else if (result?.error) {
        setError(result.error)
      }
    })
  }

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
          <h2 className="product-dialog-title">Delete product?</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <p className="product-delete-copy">
          <strong>{product.name}</strong> will be removed from inventory. This cannot be undone if
          the product has no sales history.
        </p>
        {error && (
          <div className="rounded-md p-3 text-sm" style={{ background: 'var(--red-light)', color: 'var(--red)' }} role="alert">
            {error}
          </div>
        )}
        <div className="product-dialog-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </dialog>
  )
}
