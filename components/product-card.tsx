'use client'

import Image from 'next/image'
import { NairaPrice } from '@/components/naira-price'
import { formatInteger } from '@/lib/format-numbers'
import type { Product } from '@/types/database'

export function ProductCard({
  product,
  isAdmin,
  onEdit,
  onDelete,
  onManageUnits,
}: {
  product: Product
  isAdmin: boolean
  onEdit?: () => void
  onDelete?: () => void
  /** Serialized (unit) products: register IMEI / serial */
  onManageUnits?: () => void
}) {
  return (
    <article className="product-card">
      <div className="product-card-media">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt=""
            fill
            sizes="72px"
            className="product-card-img"
          />
        ) : (
          <span className="product-card-placeholder" aria-hidden>
            📦
          </span>
        )}
      </div>
      <div className="product-card-content">
        <div className="product-card-header">
          <div className="product-card-title-row">
            <h3 className="product-card-name">{product.name}</h3>
          </div>
          <span className="product-card-type">{product.type}</span>
        </div>

        <div className="product-card-details">
          <div className="product-card-price-row">
            <span className="product-card-price">
              <NairaPrice value={Number(product.price)} />
            </span>
          </div>

          <div className="product-card-stock-row">
            <span className="product-card-stock-label">Stock</span>
            <span className="product-card-stock-val">{formatInteger(product.stock_quantity)}</span>
          </div>
        </div>

        {isAdmin && (
          <div className="product-card-actions">
            {product.tracking_mode === 'unit' && onManageUnits && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={onManageUnits}>
                Units
              </button>
            )}
            <button type="button" className="btn btn-secondary btn-sm" onClick={onEdit}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
            <button type="button" className="btn btn-destructive btn-sm" onClick={onDelete}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
