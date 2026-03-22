'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { BottomNav } from './bottom-nav'

interface DashboardLayoutProps {
  user: {
    email: string
    profile?: {
      name?: string
      role?: string
    }
  }
  title: string
  children: React.ReactNode
  showAddButton?: boolean
  onAddClick?: () => void
  addButtonLabel?: string
  alertCount?: number
  topbarShowSearch?: boolean
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
}

export function DashboardLayout({
  user,
  title,
  children,
  showAddButton,
  onAddClick,
  addButtonLabel = 'Add Product',
  alertCount,
  topbarShowSearch = true,
  searchValue,
  onSearchChange,
  searchPlaceholder,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const checkDesktop = () => {
      const isDesktop = window.matchMedia('(min-width: 768px)').matches
      const addBtn = document.getElementById('desktop-add')
      if (addBtn) {
        addBtn.style.display = isDesktop ? 'inline-flex' : 'none'
      }
      if (isDesktop) {
        setSidebarOpen(false)
        document.body.style.overflow = ''
      }
    }

    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  return (
    <div className="shell">
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main">
        <Topbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
          showAddButton={showAddButton}
          onAddClick={onAddClick}
          addButtonLabel={addButtonLabel}
          showSearch={topbarShowSearch}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
        />
        <div className="content">{children}</div>
      </div>
      <BottomNav alertCount={alertCount} />
      {showAddButton && (
        <button className="fab" onClick={onAddClick} aria-label={addButtonLabel}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}
    </div>
  )
}
