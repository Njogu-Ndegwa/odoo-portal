'use client'

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
} from 'react'
import { Search, Loader2, ChevronDown } from 'lucide-react'

interface ComboboxSearchProps<T> {
  triggerLabel: string
  triggerIcon?: ReactNode
  triggerClassName?: string
  searchPlaceholder?: string
  value: string
  onChange: (value: string) => void
  items: T[]
  renderItem: (item: T) => ReactNode
  onSelect: (item: T) => void
  isLoading?: boolean
  emptyMessage?: string
  className?: string
  dropdownClassName?: string
  keepOpenOnSelect?: boolean
  onOpenChange?: (isOpen: boolean) => void
  align?: 'left' | 'right'
}

const DEFAULT_TRIGGER =
  'btn text-sm border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300'

export default function ComboboxSearch<T extends { id: any }>({
  triggerLabel,
  triggerIcon,
  triggerClassName,
  searchPlaceholder = 'Search…',
  value,
  onChange,
  items,
  renderItem,
  onSelect,
  isLoading = false,
  emptyMessage = 'No results found',
  className = '',
  dropdownClassName = '',
  keepOpenOnSelect = false,
  onOpenChange,
  align = 'left',
}: ComboboxSearchProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const updateOpen = useCallback(
    (open: boolean) => {
      setIsOpen(open)
      onOpenChange?.(open)
      if (!open) {
        onChange('')
        setHighlightIndex(-1)
      }
    },
    [onOpenChange, onChange]
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        updateOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, updateOpen])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 0)
    }
  }, [isOpen])

  useEffect(() => {
    setHighlightIndex(-1)
  }, [items, value])

  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightIndex] as HTMLElement | undefined
      el?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightIndex])

  const handleSelect = useCallback(
    (item: T) => {
      onSelect(item)
      if (!keepOpenOnSelect) {
        updateOpen(false)
      } else {
        onChange('')
        setHighlightIndex(-1)
        setTimeout(() => searchInputRef.current?.focus(), 0)
      }
    },
    [onSelect, keepOpenOnSelect, updateOpen, onChange]
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (items.length > 0)
          setHighlightIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        if (items.length > 0)
          setHighlightIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightIndex >= 0 && highlightIndex < items.length)
          handleSelect(items[highlightIndex])
        break
      case 'Escape':
        e.preventDefault()
        updateOpen(false)
        break
    }
  }

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => updateOpen(!isOpen)}
        className={triggerClassName || DEFAULT_TRIGGER}
      >
        {triggerIcon}
        <span>{triggerLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${dropdownClassName || 'w-80'}`}
        >
          {/* Search */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-700/60">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-gray-400 dark:text-gray-500 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                )}
              </div>
              <input
                ref={searchInputRef}
                type="text"
                className="form-input w-full pl-8 text-sm py-1.5"
                placeholder={searchPlaceholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Items */}
          <div className="max-h-64 overflow-y-auto">
            {items.length > 0 ? (
              <ul ref={listRef} className="py-1">
                {items.map((item, i) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`flex items-center w-full text-left px-3 py-2 text-sm transition-colors ${
                        i === highlightIndex
                          ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300'
                          : 'text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/40'
                      }`}
                      onMouseEnter={() => setHighlightIndex(i)}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleSelect(item)
                      }}
                    >
                      {renderItem(item)}
                    </button>
                  </li>
                ))}
              </ul>
            ) : isLoading ? (
              <div className="px-3 py-6 text-sm text-center text-gray-400 dark:text-gray-500">
                Loading…
              </div>
            ) : (
              <div className="px-3 py-6 text-sm text-center text-gray-500 dark:text-gray-400">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
