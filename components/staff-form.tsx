'use client'

import { useActionState, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createStaff } from '@/app/actions/staff'
import { Select } from '@/components/select'

const ROLE_OPTIONS = [
  { value: 'staff', label: 'Staff' },
  { value: 'admin', label: 'Admin' },
]

export function StaffFormDialog({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [state, formAction, isPending] = useActionState(createStaff, undefined)
  const [role, setRole] = useState('staff')
  const [showPassword, setShowPassword] = useState(false)

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
    queryClient.invalidateQueries({ queryKey: ['staff'] })
    onClose()
  }, [state?.success, queryClient, onClose])

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
          <h2 className="product-dialog-title">Add Staff Member</h2>
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

        <form action={formAction} className="product-dialog-form">
          {state?.error && (
            <div className="rounded-md p-3 text-sm" style={{ background: 'var(--red-light)', color: 'var(--red)' }} role="alert">
              {state.error}
            </div>
          )}

          <div className="input-field">
            <label htmlFor="staff-name" className="input-label">
              Name
            </label>
            <input
              type="text"
              id="staff-name"
              name="name"
              className="input w-full"
              placeholder="Enter staff member name"
              required
              disabled={isPending}
              autoFocus
              autoComplete="off"
            />
          </div>

          <div className="input-field">
            <label htmlFor="staff-email" className="input-label">
              Email
            </label>
            <input
              type="email"
              id="staff-email"
              name="email"
              className="input w-full"
              placeholder="staff@example.com"
              required
              disabled={isPending}
              autoComplete="off"
            />
          </div>

          <div className="input-field">
            <label className="input-label">Role</label>
            <Select
              name="role"
              options={ROLE_OPTIONS}
              value={role}
              onChange={setRole}
              disabled={isPending}
              searchable={false}
            />
          </div>

          <div className="input-field">
            <label htmlFor="staff-password" className="input-label">
              Temporary Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="staff-password"
                name="password"
                className="input w-full"
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                disabled={isPending}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                disabled={isPending}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Staff member will use this password to log in for the first time
            </p>
          </div>

          <div className="product-dialog-actions">
            <button
              type="button"
              onClick={handleDialogClose}
              className="btn btn-secondary"
              disabled={isPending}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
