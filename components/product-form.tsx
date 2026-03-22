'use client'

import Image from 'next/image'
import { useActionState, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { formatInteger, stripNumberGrouping } from '@/lib/format-numbers'
import { saveProduct } from '@/app/actions/products'
import { Select } from '@/components/select'
import type { Product, TrackingMode } from '@/types/database'

const PRODUCT_TYPES = [
  { value: 'General', label: 'General' },
  { value: 'Phone', label: 'Phone' },
  { value: 'Laptop', label: 'Laptop' },
  { value: 'Tablet', label: 'Tablet' },
  { value: 'Accessory', label: 'Accessory' },
  { value: 'Audio', label: 'Audio' },
  { value: 'Wearable', label: 'Wearable' },
  { value: 'Gaming', label: 'Gaming' },
  { value: 'Camera', label: 'Camera' },
  { value: 'Other', label: 'Other' },
]

export function ProductFormDialog({
  onClose,
  product,
}: {
  onClose: () => void
  product: Product | null
}) {
  const queryClient = useQueryClient()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [state, formAction, isPending] = useActionState(saveProduct, undefined)
  const [preview, setPreview] = useState<string | null>(() => product?.image_url ?? null)
  const [priceInput, setPriceInput] = useState(() =>
    product != null ? formatPrice(Number(product.price)) : ''
  )
  const [stockInput, setStockInput] = useState(() =>
    product != null ? formatInteger(product.stock_quantity) : ''
  )
  const [productType, setProductType] = useState(product?.type ?? 'General')
  const [trackingMode, setTrackingMode] = useState<TrackingMode>(
    product?.tracking_mode ?? 'quantity'
  )
  const isUnitTracking = (product?.tracking_mode ?? trackingMode) === 'unit'
  const isNew = product == null

  /** After typing pauses, add comma grouping (price). */
  useEffect(() => {
    if (priceInput === '' || priceInput.includes(',') || priceInput.endsWith('.')) return
    const t = setTimeout(() => {
      setPriceInput((current) => {
        if (current.includes(',')) return current
        const raw = stripNumberGrouping(current)
        if (raw === '' || raw.endsWith('.')) return current
        const n = parseFloat(raw)
        if (Number.isNaN(n) || n < 0) return current
        return formatPrice(n)
      })
    }, 550)
    return () => clearTimeout(t)
  }, [priceInput])

  /** After typing pauses, add comma grouping (stock). */
  useEffect(() => {
    if (stockInput === '' || stockInput.includes(',')) return
    const t = setTimeout(() => {
      setStockInput((current) => {
        if (current.includes(',')) return current
        const raw = stripNumberGrouping(current)
        if (raw === '' || !/^\d+$/.test(raw)) return current
        const n = parseInt(raw, 10)
        if (Number.isNaN(n) || n < 0) return current
        return formatInteger(n)
      })
    }, 550)
    return () => clearTimeout(t)
  }, [stockInput])

  useLayoutEffect(() => {
    const d = dialogRef.current
    if (!d) return
    d.showModal()
    return () => {
      d.close()
    }
  }, [])

  useEffect(() => {
    if (!state?.success) return
    // Invalidate all product queries to refresh the current page
    queryClient.invalidateQueries({ queryKey: ['products'] })
    onClose()
  }, [state?.success, queryClient, onClose])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (preview?.startsWith('blob:')) {
      URL.revokeObjectURL(preview)
    }
    setPreview(f ? URL.createObjectURL(f) : product?.image_url ?? null)
  }

  const handleDialogClose = () => {
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className="product-dialog"
      onCancel={(e) => {
        e.preventDefault()
        handleDialogClose()
      }}
    >
      <div className="product-dialog-inner">
        <div className="product-dialog-hd">
          <h2 className="product-dialog-title">
            {product ? 'Edit product' : 'Add product'}
          </h2>
          <button
            type="button"
            className="icon-btn"
            onClick={handleDialogClose}
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

        <form
          key={product?.id ?? 'new'}
          action={formAction}
          className="product-dialog-form"
        >
          {product && <input type="hidden" name="product_id" value={product.id} />}

          {state?.error && (
            <div className="rounded-md p-3 text-sm" style={{ background: 'var(--red-light)', color: 'var(--red)' }} role="alert">
              {state.error}
            </div>
          )}

          <div className="input-field">
            <label htmlFor="product-name" className="input-label">
              Name
            </label>
            <input
              id="product-name"
              className="input w-full"
              name="name"
              required
              autoComplete="off"
              defaultValue={product?.name ?? ''}
              placeholder="e.g. iPhone 16 Pro"
            />
          </div>

          <div className="input-field">
            <label className="input-label">Type</label>
            <Select
              name="type"
              value={productType}
              options={PRODUCT_TYPES}
              onChange={setProductType}
              placeholder="Select product type"
            />
          </div>

          {isNew ? (
            <div className="input-field">
              <span className="input-label">Stock tracking</span>
              <div className="flex flex-col gap-2" style={{ marginTop: 6 }}>
                <label className="flex items-center gap-2 text-sm" style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="tracking_mode"
                    value="quantity"
                    checked={trackingMode === 'quantity'}
                    onChange={() => setTrackingMode('quantity')}
                  />
                  Quantity (bulk count)
                </label>
                <label className="flex items-center gap-2 text-sm" style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="tracking_mode"
                    value="unit"
                    checked={trackingMode === 'unit'}
                    onChange={() => setTrackingMode('unit')}
                  />
                  Serialized (IMEI / serial per device)
                </label>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Serialized products get stock from individual units you register.
              </p>
            </div>
          ) : (
            <input
              type="hidden"
              name="tracking_mode"
              value={product.tracking_mode ?? 'quantity'}
            />
          )}

          {!isNew && (
            <div className="input-field">
              <span className="input-label">Tracking</span>
              <div className="text-sm" style={{ marginTop: 6 }}>
                {product.tracking_mode === 'unit' ? 'Serialized (per device)' : 'Quantity'}
              </div>
            </div>
          )}

          <div className="product-form-row">
            <div className="input-field">
              <label htmlFor="product-price" className="input-label">
                Price
              </label>
              <input type="hidden" name="price" value={priceInput.replace(/,/g, '')} />
              <input
                id="product-price"
                className="input w-full"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                required
                placeholder="0"
                value={priceInput}
                onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, '')
                  if (raw === '' || /^\d*\.?\d{0,2}$/.test(raw)) {
                    setPriceInput(raw)
                  }
                }}
                onFocus={() => {
                  setPriceInput((s) => s.replace(/,/g, ''))
                }}
                onBlur={() => {
                  const raw = priceInput.replace(/,/g, '').trim()
                  if (raw === '') return
                  const n = parseFloat(raw)
                  if (!Number.isNaN(n) && n >= 0) {
                    setPriceInput(formatPrice(n))
                  }
                }}
              />
            </div>
            <div className="input-field">
              <label htmlFor="product-stock" className="input-label">
                Stock
              </label>
              {isUnitTracking ? (
                <>
                  <input
                    type="hidden"
                    name="stock_quantity"
                    value={String(product?.stock_quantity ?? 0)}
                  />
                  <div
                    id="product-stock"
                    className="input w-full"
                    style={{
                      background: 'var(--bg-muted)',
                      color: 'var(--text-secondary)',
                      cursor: 'not-allowed',
                    }}
                  >
                    {formatInteger(product?.stock_quantity ?? 0)} (from registered units)
                  </div>
                </>
              ) : (
                <>
                  <input type="hidden" name="stock_quantity" value={stripNumberGrouping(stockInput)} />
                  <input
                    id="product-stock"
                    className="input w-full"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    required
                    placeholder="0"
                    value={stockInput}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/,/g, '')
                      if (raw === '' || /^\d+$/.test(raw)) {
                        setStockInput(raw)
                      }
                    }}
                    onFocus={() => {
                      setStockInput((s) => s.replace(/,/g, ''))
                    }}
                    onBlur={() => {
                      const raw = stripNumberGrouping(stockInput)
                      if (raw === '') return
                      const n = parseInt(raw, 10)
                      if (!Number.isNaN(n) && n >= 0) {
                        setStockInput(formatInteger(n))
                      }
                    }}
                  />
                </>
              )}
            </div>
          </div>

          <div className="input-field">
            <label htmlFor="product-image" className="input-label">
              Image {product ? '(optional — leave empty to keep current)' : '(optional)'}
            </label>
            <input
              id="product-image"
              className="input w-full"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
            />
          </div>

          {preview && (
            <div className="product-preview">
              <Image
                src={preview}
                alt=""
                width={800}
                height={400}
                unoptimized={preview.startsWith('blob:')}
                className="product-preview-img"
              />
            </div>
          )}

          <div className="product-dialog-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDialogClose}
              disabled={isPending}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? 'Saving…' : product ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}

/** Format price with comma grouping */
function formatPrice(n: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n)
}
