'use client'

import { useLayoutEffect, useRef, useState, useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { updateStaffRole } from '@/app/actions/staff'
import { Select } from '@/components/select'
import type { StaffWithActivity } from '@/app/actions/staff'

const ROLE_OPTIONS = [
  { value: 'staff', label: 'Staff' },
  { value: 'admin', label: 'Admin' },
]

export function StaffRoleDialog({
  staff,
  onClose,
}: {
  staff: StaffWithActivity
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [newRole, setNewRole] = useState<'admin' | 'staff'>(staff.role)

  useLayoutEffect(() => {
    const d = dialogRef.current
    if (!d) return
    d.showModal()
    return () => {
      d.close()
    }
  }, [])

  const handleConfirm = () => {
    if (newRole === staff.role) {
      onClose()
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await updateStaffRole(staff.id, newRole)
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
          <h2 className="product-dialog-title">Change Role</h2>
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

        <div className="product-dialog-form">
          <p className="text-sm" style={{ color: 'var(--ink-600)', lineHeight: 1.5, margin: 0 }}>
            Update the role for <strong>{staff.name}</strong>
          </p>

          <div className="input-field">
            <label className="input-label">New Role</label>
            <Select
              name="role"
              options={ROLE_OPTIONS}
              value={newRole}
              onChange={(val) => setNewRole(val as 'admin' | 'staff')}
              disabled={isPending}
              searchable={false}
            />
          </div>

          <div className="text-xs" style={{ color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
            <strong>Admin</strong> can manage products, view all reports, and manage staff.
            <br />
            <strong>Staff</strong> can record sales and view inventory.
          </div>

          {error && (
            <div className="rounded-md p-3 text-sm" style={{ background: 'var(--red-light)', color: 'var(--red)' }} role="alert">
              {error}
            </div>
          )}
        </div>

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
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={isPending || newRole === staff.role}
          >
            {isPending ? 'Updating...' : 'Update Role'}
          </button>
        </div>
      </div>
    </dialog>
  )
}
