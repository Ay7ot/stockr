'use client'

import { useLayoutEffect, useRef, useState, useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toggleStaffAccess } from '@/app/actions/staff'
import type { StaffWithActivity } from '@/app/actions/staff'

export function StaffAccessDialog({
  staff,
  shouldDisable,
  onClose,
}: {
  staff: StaffWithActivity
  shouldDisable: boolean
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
    setError(null)
    startTransition(async () => {
      const result = await toggleStaffAccess(staff.id, shouldDisable)
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: ['staff'] })
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
          <h2 className="product-dialog-title">
            {shouldDisable ? 'Disable access?' : 'Enable access?'}
          </h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
            disabled={isPending}
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
          {shouldDisable ? (
            <>
              <strong>{staff.name}</strong> will not be able to log in to the system. Their sales
              history will be preserved.
            </>
          ) : (
            <>
              <strong>{staff.name}</strong> will be able to log in and access the system again.
            </>
          )}
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
            className={`btn ${shouldDisable ? 'btn-destructive' : 'btn-primary'}`}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending
              ? 'Processing...'
              : shouldDisable
                ? 'Disable Access'
                : 'Enable Access'}
          </button>
        </div>
      </div>
    </dialog>
  )
}
