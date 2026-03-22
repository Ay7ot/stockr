'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { NairaPrice } from '@/components/naira-price'
import { SaleLineDetailDialog } from '@/components/sale-line-detail-dialog'
import { Select } from '@/components/select'
import { useUser } from '@/hooks/use-user'
import { useProductsForSale } from '@/hooks/use-products-for-sale'
import { useRecentSales } from '@/hooks/use-recent-sales'
import { useInventoryUnits } from '@/hooks/use-inventory-units'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { recordSale } from '@/app/actions/sales'
import {
  formatInteger,
  formatNairaAmount,
  stripNumberGrouping,
} from '@/lib/format-numbers'
import type { RecentSaleRow } from '@/lib/sales'
import type { Product } from '@/types/database'

type SaleLine = {
  id: string
  productId: string
  unitPrice: string
  quantity: number
  inventoryUnitId: string | null
}

function newLine(): SaleLine {
  return {
    id: crypto.randomUUID(),
    productId: '',
    unitPrice: '',
    quantity: 1,
    inventoryUnitId: null,
  }
}

function SaleLineEditor({
  line,
  products,
  onChange,
  onRemove,
  canRemove,
}: {
  line: SaleLine
  products: Product[]
  onChange: (id: string, patch: Partial<SaleLine>) => void
  onRemove: () => void
  canRemove: boolean
}) {
  const product = products.find((p) => p.id === line.productId)
  const isUnit = product?.tracking_mode === 'unit'
  const unitPriceRef = useRef(line.unitPrice)
  unitPriceRef.current = line.unitPrice

  const { data: units = [], isLoading: unitsLoading } = useInventoryUnits(
    isUnit && line.productId ? line.productId : null,
    { status: 'in_stock' }
  )

  const productOptions = useMemo(
    () => [
      { value: '', label: 'Select product' },
      ...products.map((p) => ({ value: p.id, label: p.name })),
    ],
    [products]
  )

  const unitOptions = useMemo(
    () => [
      {
        value: '',
        label: unitsLoading ? 'Loading…' : 'Select unit',
      },
      ...units.map((u) => ({
        value: u.id,
        label: `${u.identifier} (${u.identifier_kind})`,
      })),
    ],
    [units, unitsLoading]
  )

  /** Match product form: comma grouping after typing pauses */
  useEffect(() => {
    const v = line.unitPrice
    if (v === '' || v.includes(',') || v.endsWith('.')) return
    const t = setTimeout(() => {
      const current = unitPriceRef.current
      if (current.includes(',')) return
      const raw = stripNumberGrouping(current)
      if (raw === '' || raw.endsWith('.')) return
      const n = parseFloat(raw)
      if (Number.isNaN(n) || n < 0) return
      onChange(line.id, { unitPrice: formatNairaAmount(n) })
    }, 550)
    return () => clearTimeout(t)
  }, [line.unitPrice, line.id, onChange])

  const handleProductChange = (productId: string) => {
    const p = products.find((x) => x.id === productId)
    onChange(line.id, {
      productId,
      inventoryUnitId: null,
      quantity: p?.tracking_mode === 'unit' ? 1 : line.quantity,
      unitPrice:
        p != null ? formatNairaAmount(Number(p.price)) : '',
    })
  }

  return (
    <div
      className="rounded-lg border p-3 mb-3"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}
    >
      <div className="flex flex-wrap gap-3 items-end">
        <div className="input-field" style={{ flex: '1 1 200px' }}>
          <label className="input-label">Product</label>
          <Select
            name={`sale_product_${line.id}`}
            value={line.productId}
            options={productOptions}
            onChange={handleProductChange}
            placeholder="Select product"
          />
        </div>

        <div className="input-field" style={{ flex: '0 1 160px' }}>
          <label className="input-label">Unit price (₦)</label>
          <input
            className="input w-full"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={line.unitPrice}
            onChange={(e) => {
              const raw = e.target.value.replace(/,/g, '')
              if (raw === '' || /^\d*\.?\d{0,2}$/.test(raw)) {
                onChange(line.id, { unitPrice: raw })
              }
            }}
            onFocus={() => {
              onChange(line.id, {
                unitPrice: line.unitPrice.replace(/,/g, ''),
              })
            }}
            onBlur={() => {
              const raw = stripNumberGrouping(line.unitPrice).trim()
              if (raw === '') return
              const n = parseFloat(raw)
              if (!Number.isNaN(n) && n >= 0) {
                onChange(line.id, { unitPrice: formatNairaAmount(n) })
              }
            }}
            placeholder="0"
          />
        </div>

        {!isUnit && (
          <div className="input-field" style={{ flex: '0 1 100px' }}>
            <label className="input-label">Qty</label>
            <input
              className="input w-full"
              type="number"
              min={1}
              step={1}
              value={line.quantity}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10)
                onChange(line.id, {
                  quantity: Number.isFinite(n) && n >= 1 ? n : 1,
                })
              }}
            />
          </div>
        )}

        {isUnit && (
          <div className="input-field" style={{ flex: '1 1 220px' }}>
            <label className="input-label">Device (IMEI / serial)</label>
            <Select
              name={`sale_unit_${line.id}`}
              value={line.inventoryUnitId ?? ''}
              options={unitOptions}
              onChange={(v) =>
                onChange(line.id, {
                  inventoryUnitId: v || null,
                })
              }
              placeholder={unitsLoading ? 'Loading…' : 'Select unit'}
              disabled={!line.productId || unitsLoading}
            />
          </div>
        )}

        {canRemove && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onRemove}
            aria-label="Remove line"
          >
            Remove
          </button>
        )}
      </div>
      {product && (
        <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
          Stock: {formatInteger(product.stock_quantity)} · Default price{' '}
          <NairaPrice value={Number(product.price)} />
          {isUnit ? ' · Serialized' : ''}
        </p>
      )}
    </div>
  )
}

export function SalesClient() {
  const { data: user, isLoading } = useUser()
  const router = useRouter()
  const { data: products = [], isLoading: productsLoading } = useProductsForSale()
  const { data: recent = [], isLoading: recentLoading, refetch: refetchRecent } =
    useRecentSales(40)

  const [lines, setLines] = useState<SaleLine[]>(() => [newLine()])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [detailRow, setDetailRow] = useState<RecentSaleRow | null>(null)

  const updateLine = useCallback((id: string, patch: Partial<SaleLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }, [])

  const addLine = useCallback(() => {
    setLines((prev) => [...prev, newLine()])
  }, [])

  const removeLine = useCallback((id: string) => {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.id !== id)))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    const nameTrim = customerName.trim()
    const phoneTrim = customerPhone.trim()
    if (!nameTrim) {
      setSubmitError('Enter the customer’s name.')
      return
    }
    if (!phoneTrim) {
      setSubmitError('Enter the customer’s phone number.')
      return
    }

    const payload: Parameters<typeof recordSale>[0] = []

    for (const line of lines) {
      if (!line.productId) continue
      const product = products.find((p) => p.id === line.productId)
      if (!product) {
        setSubmitError('Invalid product selection.')
        return
      }
      const unitPrice = parseFloat(stripNumberGrouping(line.unitPrice))
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        setSubmitError('Enter a valid price for each line.')
        return
      }
      if (product.tracking_mode === 'unit') {
        if (!line.inventoryUnitId) {
          setSubmitError(`Select a device for ${product.name}.`)
          return
        }
        payload.push({
          product_id: line.productId,
          unit_price: unitPrice,
          quantity_sold: 1,
          inventory_unit_id: line.inventoryUnitId,
        })
      } else {
        const q = Math.floor(line.quantity)
        if (q < 1) {
          setSubmitError('Quantity must be at least 1.')
          return
        }
        if (q > product.stock_quantity) {
          setSubmitError(`Not enough stock for ${product.name}.`)
          return
        }
        payload.push({
          product_id: line.productId,
          unit_price: unitPrice,
          quantity_sold: q,
          inventory_unit_id: null,
        })
      }
    }

    if (payload.length === 0) {
      setSubmitError('Add at least one line with a product.')
      return
    }

    setSubmitting(true)
    const res = await recordSale(payload, { name: nameTrim, phone: phoneTrim })
    setSubmitting(false)

    if (!res.ok) {
      setSubmitError(res.error)
      return
    }

    setLines([newLine()])
    setCustomerName('')
    setCustomerPhone('')
    refetchRecent()
  }

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  const layoutUser = useMemo(
    () => ({
      email: user?.email ?? '',
      profile: user?.profile
        ? { name: user.profile.name, role: user.profile.role }
        : undefined,
    }),
    [user]
  )

  if (isLoading || !user) {
    return null
  }

  return (
    <DashboardLayout user={layoutUser} title="Sales Orders">
      <div className="page-header">
        <div>
          <div className="page-heading">Record sale</div>
          <div className="page-sub">Customer, then line items (price and serialized devices when applicable)</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="section-title mb-2">Customer</div>
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="input-field" style={{ flex: '1 1 220px' }}>
            <label className="input-label" htmlFor="sale-customer-name">
              Full name
            </label>
            <input
              id="sale-customer-name"
              name="customer_name"
              className="input w-full"
              type="text"
              autoComplete="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
              required
            />
          </div>
          <div className="input-field" style={{ flex: '1 1 200px' }}>
            <label className="input-label" htmlFor="sale-customer-phone">
              Phone number
            </label>
            <input
              id="sale-customer-phone"
              name="customer_phone"
              className="input w-full"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="e.g. 0803…"
              required
            />
          </div>
        </div>

        <div className="section-title mb-2">Line items</div>
        {productsLoading ? (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Loading products…
          </p>
        ) : products.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            No products in catalog. Add products first.
          </p>
        ) : (
          <>
            {lines.map((line) => (
              <SaleLineEditor
                key={line.id}
                line={line}
                products={products}
                onChange={updateLine}
                onRemove={() => removeLine(line.id)}
                canRemove={lines.length > 1}
              />
            ))}
            <div className="flex flex-wrap gap-2 items-center">
              <button type="button" className="btn btn-secondary btn-sm" onClick={addLine}>
                Add line
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submitting || productsLoading}
              >
                {submitting ? 'Recording…' : 'Record sale'}
              </button>
            </div>
            {submitError && (
              <div
                className="rounded-md p-3 text-sm mt-3"
                style={{ background: 'var(--red-light)', color: 'var(--red)' }}
                role="alert"
              >
                {submitError}
              </div>
            )}
          </>
        )}
      </form>

      <div className="section-hd">
        <div>
          <div className="section-title">Recent activity</div>
          <div className="section-sub">Latest line items recorded — click a row for details</div>
        </div>
      </div>

      <div className="table-card">
        {recentLoading ? (
          <p className="p-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Loading…
          </p>
        ) : recent.length === 0 ? (
          <p className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            No sales yet.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Time</th>
                  <th className="text-left">Customer</th>
                  <th className="text-left">Phone</th>
                  <th className="text-left">Product</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Line total</th>
                  <th className="text-left">Seller</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr
                    key={r.saleItemId}
                    tabIndex={0}
                    onClick={() => setDetailRow(r)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setDetailRow(r)
                      }
                    }}
                    aria-label={`View details for ${r.productName}`}
                  >
                    <td className="whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td>{r.customerName || '—'}</td>
                    <td className="whitespace-nowrap">{r.customerPhone || '—'}</td>
                    <td>{r.productName}</td>
                    <td className="text-right">{formatInteger(r.quantity)}</td>
                    <td className="text-right">
                      <NairaPrice value={r.lineTotal} />
                    </td>
                    <td>{r.soldBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detailRow && (
        <SaleLineDetailDialog
          key={detailRow.saleItemId}
          row={detailRow}
          onClose={() => setDetailRow(null)}
        />
      )}
    </DashboardLayout>
  )
}
