'use client'

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useId,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  name: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  /** When true, shows a search field and filters options by label. Default: true */
  searchable?: boolean
  searchPlaceholder?: string
}

export function Select({
  label,
  name,
  value,
  options,
  onChange,
  placeholder = 'Select...',
  required = false,
  disabled = false,
  searchable = true,
  searchPlaceholder = 'Search…',
}: SelectProps) {
  const id = useId()
  const listboxId = `${id}-listbox`
  const searchId = `${id}-search`

  const [isOpen, setIsOpen] = useState(false)
  const [filterQuery, setFilterQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const prevOpenRef = useRef(false)

  const filteredOptions = useMemo(() => {
    if (!searchable) return options
    const q = filterQuery.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, filterQuery, searchable])

  const selectedOption = options.find((o) => o.value === value)

  const handleSelect = useCallback((option: SelectOption) => {
    onChange(option.value)
    setIsOpen(false)
    setFilterQuery('')
  }, [onChange])

  const toggleOpen = useCallback(() => {
    if (disabled) return
    setIsOpen((prev) => !prev)
  }, [disabled])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (disabled) setIsOpen(false)
  }, [disabled])

  // Reset filter and highlight only when the menu opens (not on every options re-render)
  useEffect(() => {
    const justOpened = isOpen && !prevOpenRef.current
    prevOpenRef.current = isOpen
    if (!isOpen) return
    if (justOpened) {
      setFilterQuery('')
      const selectedIndex = options.findIndex((o) => o.value === value)
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0)
    }
  }, [isOpen, value, options])

  useEffect(() => {
    if (isOpen && searchable) {
      searchInputRef.current?.focus()
    }
  }, [isOpen, searchable])

  const handleFilterChange = useCallback((next: string) => {
    setFilterQuery(next)
    setHighlightedIndex(0)
  }, [])

  const handleSearchKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLInputElement>) => {
      const len = filteredOptions.length
      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(false)
          break
        case 'ArrowDown':
          e.preventDefault()
          e.stopPropagation()
          if (len === 0) return
          setHighlightedIndex((prev) => (prev < len - 1 ? prev + 1 : prev))
          break
        case 'ArrowUp':
          e.preventDefault()
          e.stopPropagation()
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev))
          break
        case 'Enter':
          e.preventDefault()
          e.stopPropagation()
          if (len > 0 && filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex])
          }
          break
        default:
          break
      }
    },
    [filteredOptions, highlightedIndex, handleSelect]
  )

  // Keyboard navigation (focus on options / trigger, not search input)
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as Node | null
      if (searchInputRef.current && target === searchInputRef.current) {
        return
      }

      const len = filteredOptions.length
      switch (e.key) {
        case 'Escape':
          setIsOpen(false)
          break
        case 'ArrowDown':
          e.preventDefault()
          if (len === 0) return
          setHighlightedIndex((prev) => (prev < len - 1 ? prev + 1 : prev))
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev))
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (len > 0 && filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex])
          }
          break
        default:
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, highlightedIndex, filteredOptions, handleSelect])

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [isOpen, highlightedIndex, filteredOptions.length])

  return (
    <div className="select-wrapper" ref={containerRef}>
      <input type="hidden" name={name} value={value} required={required} />

      <button
        type="button"
        className={`select-trigger ${isOpen ? 'open' : ''}`}
        onClick={toggleOpen}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
        aria-label={label ? `${label}: ${selectedOption?.label || placeholder}` : undefined}
      >
        <span className={`select-value ${!selectedOption ? 'placeholder' : ''}`}>
          {selectedOption?.label || placeholder}
        </span>
        <span className="select-arrow" aria-hidden="true">
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }}
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className={`select-dropdown ${searchable ? 'select-dropdown-searchable' : ''}`}>
          {searchable && (
            <div className="select-search-wrap">
              <input
                ref={searchInputRef}
                id={searchId}
                type="text"
                className="select-search-input"
                value={filterQuery}
                onChange={(e) => handleFilterChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={searchPlaceholder}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                aria-autocomplete="list"
                aria-controls={listboxId}
                aria-expanded={isOpen}
                role="combobox"
              />
            </div>
          )}
          <div id={listboxId} className="select-options-scroll" ref={listRef} role="listbox">
            {filteredOptions.length === 0 ? (
              <div className="select-empty" role="presentation">
                No matches
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value === '' ? '__empty__' : option.value}
                  type="button"
                  className={`select-option ${option.value === value ? 'selected' : ''} ${
                    index === highlightedIndex ? 'highlighted' : ''
                  }`}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  role="option"
                  aria-selected={option.value === value}
                >
                  <span className="select-option-label">{option.label}</span>
                  {option.value === value && (
                    <span className="select-option-check" aria-hidden="true">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
