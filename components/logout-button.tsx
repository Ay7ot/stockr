'use client'

import { logout } from '@/app/actions/auth'
import { useAuth } from './auth-provider'

export function LogoutButton() {
  const { user, isLoading } = useAuth()

  if (isLoading || !user) {
    return null
  }

  return (
    <form action={logout}>
      <button
        type="submit"
        className="btn btn-sm"
        style={{
          background: 'var(--ink-100)',
          color: 'var(--ink-600)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--ink-200)'
          e.currentTarget.style.color = 'var(--ink-800)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--ink-100)'
          e.currentTarget.style.color = 'var(--ink-600)'
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sign out
      </button>
    </form>
  )
}
