'use client'

interface TopbarProps {
  title: string
  onMenuClick?: () => void
  showAddButton?: boolean
  onAddClick?: () => void
  addButtonLabel?: string
  /** Hide the global search field (e.g. when the page provides its own search). */
  showSearch?: boolean
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
}

export function Topbar({
  title,
  onMenuClick,
  showAddButton,
  onAddClick,
  addButtonLabel = 'Add Product',
  showSearch = true,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search products, SKUs…',
}: TopbarProps) {
  return (
    <header className="topbar">
      <button
        className="topbar-menu-btn"
        onClick={onMenuClick}
        aria-label="Menu"
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
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <span className="topbar-title">{title}</span>
      {showSearch && (
        <div className="search-box">
          <svg
            style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      )}
      <div className="topbar-actions">
        <button className="icon-btn" aria-label="Notifications">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
        {showAddButton && (
          <button
            className="btn btn-primary"
            onClick={onAddClick}
            style={{ display: 'none' }}
            id="desktop-add"
          >
            <svg
              width="13"
              height="13"
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
            {addButtonLabel}
          </button>
        )}
      </div>
    </header>
  )
}
