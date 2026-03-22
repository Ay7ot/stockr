'use client'

import { useActionState, useLayoutEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Select } from '@/components/select'
import { addInventoryUnit, deleteInventoryUnit } from '@/app/actions/inventory-units'
import { useInventoryUnits } from '@/hooks/use-inventory-units'
import type { IdentifierKind, Product } from '@/types/database'

const KIND_OPTIONS = [
  { value: 'imei', label: 'IMEI' },
  { value: 'serial', label: 'Serial' },
  { value: 'other', label: 'Other' },
]

export function InventoryUnitsDialog({
  product,
  onClose,
}: {
  product: Product
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()
  const { data: units = [], isLoading, isFetching } = useInventoryUnits(product.id)
  const [kind, setKind] = useState<IdentifierKind>('imei')
  const [identifier, setIdentifier] = useState('')
  /** Hide stale error banner after user edits the field */
  const [errorDismissed, setErrorDismissed] = useState(false)

  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | undefined, formData: FormData) => {
      setErrorDismissed(false)
      const raw = String(formData.get('identifier') ?? '').trim()
      const k = String(formData.get('identifier_kind') ?? 'imei') as IdentifierKind
      const res = await addInventoryUnit(product.id, raw, k)
      if (!res.ok) return { error: res.error }
      setIdentifier('')
      await queryClient.refetchQueries({
        queryKey: ['inventory_units', product.id],
      })
      await queryClient.refetchQueries({ queryKey: ['products'] })
      return { success: true }
    },
    undefined
  )

  useLayoutEffect(() => {
    const d = dialogRef.current
    if (!d) return
    d.showModal()
    return () => d.close()
  }, [])

  const handleDialogClose = () => onClose()

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
          <h2 className="product-dialog-title">Units · {product.name}</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={handleDialogClose}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
          Register each physical device. Identifiers must be unique across the store.
        </p>

        <form action={formAction} className="product-dialog-form mb-4">
          <div className="input-field">
            <label className="input-label">Identifier type</label>
            <Select
              name="identifier_kind"
              value={kind}
              options={KIND_OPTIONS}
              onChange={(v) => setKind(v as IdentifierKind)}
              placeholder="Type"
            />
          </div>
          <div className="input-field">
            <label htmlFor="inv-id" className="input-label">
              Identifier
            </label>
            <input
              id="inv-id"
              name="identifier"
              className="input w-full"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value)
                if (state?.error) setErrorDismissed(true)
              }}
              autoComplete="off"
              placeholder={kind === 'imei' ? '15-digit IMEI' : 'Serial or reference'}
            />
          </div>
          {state?.error && !errorDismissed && (
            <div className="rounded-md p-3 text-sm" style={{ background: 'var(--red-light)', color: 'var(--red)' }} role="alert">
              {state.error}
            </div>
          )}
          <div className="product-dialog-actions" style={{ paddingTop: 8 }}>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isPending}>
              {isPending ? 'Adding…' : 'Add unit'}
            </button>
          </div>
        </form>

        <div className="section-title text-sm mb-2 flex items-center gap-2">
          Registered units
          {isFetching && !isLoading && (
            <span className="text-xs font-normal" style={{ color: 'var(--text-tertiary)' }}>
              Updating…
            </span>
          )}
        </div>
        {isLoading ? (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Loading…
          </p>
        ) : units.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            No units yet. Add one above.
          </p>
        ) : (
          <div className="table-wrap" style={{ maxHeight: 240, overflow: 'auto' }}>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Identifier</th>
                  <th className="text-left">Kind</th>
                  <th className="text-left">Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {units.map((u) => (
                  <tr key={u.id}>
                    <td className="font-mono text-xs">{u.identifier}</td>
                    <td>{u.identifier_kind}</td>
                    <td>
                      <span className={u.status === 'in_stock' ? 'badge b-green' : 'badge b-amber'}>
                        {u.status === 'in_stock' ? 'In stock' : 'Sold'}
                      </span>
                    </td>
                    <td className="text-right">
                      {u.status === 'in_stock' && (
                        <button
                          type="button"
                          className="btn btn-destructive btn-sm"
                          onClick={async () => {
                            const res = await deleteInventoryUnit(u.id)
                            if (!res.ok) {
                              alert(res.error)
                              return
                            }
                            await queryClient.refetchQueries({
                              queryKey: ['inventory_units', product.id],
                            })
                            await queryClient.refetchQueries({ queryKey: ['products'] })
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="product-dialog-actions mt-4">
          <button type="button" className="btn btn-secondary" onClick={handleDialogClose}>
            Done
          </button>
        </div>
      </div>
    </dialog>
  )
}
