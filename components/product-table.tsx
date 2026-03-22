'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { NairaPrice } from '@/components/naira-price'
import { formatInteger } from '@/lib/format-numbers'
import type { Product } from '@/types/database'
import { ProductCard } from '@/components/product-card'

interface ProductTableProps {
  products: Product[]
  isAdmin: boolean
  isLoading?: boolean
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onManageUnits?: (product: Product) => void
  page?: number
  totalPages?: number
  totalCount?: number
  onPageChange?: (page: number) => void
  hideSearch?: boolean
}

export function ProductTable({
  products,
  isAdmin,
  isLoading,
  onEdit,
  onDelete,
  onManageUnits,
  page = 1,
  totalPages = 1,
  totalCount = 0,
  onPageChange,
  hideSearch = false,
}: ProductTableProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (hideSearch) return products
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => p.name.toLowerCase().includes(q))
  }, [products, search, hideSearch])

  return (
    <div>
      <div className="section-hd">
        <div>
          <div className="section-title">Inventory</div>
          <div className="section-sub">
            {isLoading
              ? 'Loading…'
              : `${formatInteger(filtered.length)} shown · ${formatInteger(products.length)} total`}
          </div>
        </div>
      </div>

      <div className="table-card">
        {!hideSearch && (
          <div className="table-toolbar">
            <label className="product-search-wrap">
              <span className="sr-only">Search products</span>
              <svg
                style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                className="product-search-input"
                placeholder="Search by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
              />
            </label>
          </div>
        )}

        {!isLoading && products.length === 0 && (
          <div className="product-empty">
            <div className="product-empty-title">No products yet</div>
            <p className="product-empty-sub">
              {isAdmin
                ? 'Add your first product to start tracking inventory.'
                : 'Products will appear here once an administrator adds them.'}
            </p>
          </div>
        )}

        {!isLoading && products.length > 0 && filtered.length === 0 && (
          <div className="product-empty">
            <div className="product-empty-title">No matches</div>
            <p className="product-empty-sub">Try a different search.</p>
          </div>
        )}

        {!isLoading && totalPages > 1 && onPageChange && (
          <div className="pagination">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Previous
            </button>
            <span className="pagination-info">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}

        {isLoading && (
          <div className="product-skeleton" aria-busy="true">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="product-skeleton-row" />
            ))}
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <>
            <div className="product-grid">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAdmin={isAdmin}
                  onEdit={isAdmin ? () => onEdit?.(product) : undefined}
                  onDelete={isAdmin ? () => onDelete?.(product) : undefined}
                  onManageUnits={
                    isAdmin && product.tracking_mode === 'unit'
                      ? () => onManageUnits?.(product)
                      : undefined
                  }
                />
              ))}
            </div>

            <div className="products-table-desktop">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th className="sorted" style={{ minWidth: '200px' }}>
                        Product
                      </th>
                      <th className="col-xs">Stock</th>
                      <th>Price</th>
                      {isAdmin && <th style={{ minWidth: '120px' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="product-cell">
                            <div className="product-thumb product-thumb-img">
                              {product.image_url ? (
                                <Image
                                  src={product.image_url}
                                  alt=""
                                  width={34}
                                  height={34}
                                  className="product-table-thumb-img"
                                />
                              ) : (
                                <span aria-hidden>📦</span>
                              )}
                            </div>
                            <div>
                              <div className="product-name">{product.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="col-xs">
                          <span className="stock-num">{formatInteger(product.stock_quantity)}</span>
                        </td>
                        <td className="price">
                          <NairaPrice value={Number(product.price)} />
                        </td>
                        {isAdmin && (
                          <td>
                            <div className="act-cell">
                              {product.tracking_mode === 'unit' && onManageUnits && (
                                <button
                                  type="button"
                                  className="act-btn"
                                  onClick={() => onManageUnits(product)}
                                  aria-label="Manage units"
                                  title="Units"
                                >
                                  <svg
                                    width="11"
                                    height="11"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden
                                  >
                                    <line x1="8" y1="6" x2="21" y2="6" />
                                    <line x1="8" y1="12" x2="21" y2="12" />
                                    <line x1="8" y1="18" x2="21" y2="18" />
                                    <line x1="3" y1="6" x2="3.01" y2="6" />
                                    <line x1="3" y1="12" x2="3.01" y2="12" />
                                    <line x1="3" y1="18" x2="3.01" y2="18" />
                                  </svg>
                                </button>
                              )}
                              <button
                                type="button"
                                className="act-btn"
                                onClick={() => onEdit?.(product)}
                                aria-label="Edit"
                              >
                                <svg
                                  width="11"
                                  height="11"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                className="act-btn"
                                onClick={() => onDelete?.(product)}
                                aria-label="Delete"
                              >
                                <svg
                                  width="11"
                                  height="11"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
