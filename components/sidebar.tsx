'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  user: {
    email: string
    profile?: {
      name?: string
      role?: string
    }
  }
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const handleNavClick = () => {
    if (onClose) {
      setTimeout(() => onClose(), 100)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
          <div>
            <div className="brand-name">Stockr</div>
            <div className="brand-sub">Inventory</div>
          </div>
        </div>

        <nav className="nav-section">
          <div className="nav-label">Overview</div>
          <Link
            href="/dashboard"
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={handleNavClick}
            prefetch={true}
          >
            <svg
              className="ni"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Dashboard
          </Link>
          <Link
            href="/analytics"
            className={`nav-item ${isActive('/analytics') ? 'active' : ''}`}
            onClick={handleNavClick}
            prefetch={true}
          >
            <svg
              className="ni"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Analytics
          </Link>
        </nav>

        <nav className="nav-section">
          <div className="nav-label">Inventory</div>
          <Link
            href="/products"
            className={`nav-item ${isActive('/products') ? 'active' : ''}`}
            onClick={onClose}
          >
            <svg
              className="ni"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            Products
          </Link>
          <Link
            href="/sales"
            className={`nav-item ${isActive('/sales') ? 'active' : ''}`}
            onClick={handleNavClick}
            prefetch={true}
          >
            <svg
              className="ni"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Sales Orders
          </Link>
        </nav>

        <nav className="nav-section">
          <div className="nav-label">Reports</div>
          <Link
            href="/reports"
            className={`nav-item ${isActive('/reports') ? 'active' : ''}`}
            onClick={handleNavClick}
            prefetch={true}
          >
            <svg
              className="ni"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Daily Reports
          </Link>
        </nav>

        <nav className="nav-section">
          <div className="nav-label">Account</div>
          <Link
            href="/profile"
            className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
            onClick={handleNavClick}
            prefetch={true}
          >
            <svg
              className="ni"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profile
          </Link>
          {user.profile?.role === 'admin' && (
            <Link
              href="/staff"
              className={`nav-item ${isActive('/staff') ? 'active' : ''}`}
              onClick={handleNavClick}
              prefetch={true}
            >
              <svg
                className="ni"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Staff
            </Link>
          )}
          <button
            type="button"
            className="nav-item nav-item-logout"
            onClick={async () => {
              handleNavClick()
              const supabase = await import('@/lib/supabase/client').then(m => m.createClient())
              await supabase.auth.signOut()
              window.location.href = '/login'
            }}
          >
            <svg
              className="ni"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div
              className="avatar"
              style={{
                background: 'linear-gradient(135deg, #0071e3, #bf5af2)',
              }}
            >
              {(user.profile?.name || user.email)
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name">
                {user.profile?.name || user.email.split('@')[0]}
              </div>
              <div className="user-role">
                {user.profile?.role === 'admin' ? 'Administrator' : 'Staff'}
              </div>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </div>
        </div>
      </aside>
    </>
  )
}
