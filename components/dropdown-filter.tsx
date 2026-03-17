'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'

export interface FilterDefinition {
  key: string;
  label: string;
}

interface DropdownFilterProps {
  align?: 'left' | 'right';
  filters?: FilterDefinition[];
  values?: Record<string, boolean>;
  onChange?: (values: Record<string, boolean>) => void;
  renderExtra?: (draftValues: Record<string, boolean>) => ReactNode;
}

function useDefaultFilters(): FilterDefinition[] {
  const t = useTranslations('filters')
  return [
    { key: 'direct_vs_indirect', label: t('directVsIndirect') },
    { key: 'real_time_value', label: t('realTimeValue') },
    { key: 'top_channels', label: t('topChannels') },
    { key: 'sales_vs_refunds', label: t('salesVsRefunds') },
    { key: 'last_order', label: t('lastOrder') },
    { key: 'total_spent', label: t('totalSpent') },
  ]
}

export default function DropdownFilter({
  align,
  filters,
  values: controlledValues,
  onChange,
  renderExtra,
}: DropdownFilterProps) {

  const t = useTranslations('filters')
  const defaultFilterItems = useDefaultFilters()
  const filterItems = filters || defaultFilterItems
  const isControlled = controlledValues !== undefined && onChange !== undefined

  const [internalValues, setInternalValues] = useState<Record<string, boolean>>({})
  const [draftValues, setDraftValues] = useState<Record<string, boolean>>({})
  const prevOpenRef = useRef(false)

  const currentValues = isControlled ? controlledValues : internalValues
  const activeCount = Object.values(currentValues).filter(Boolean).length

  const handleToggle = (key: string) => {
    setDraftValues(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleClear = () => {
    setDraftValues({})
  }

  const handleApply = (close: () => void) => {
    if (isControlled) {
      onChange(draftValues)
    } else {
      setInternalValues(draftValues)
    }
    close()
  }

  return (
    <Popover className="relative inline-flex">
      {({ open }) => {
        if (open && !prevOpenRef.current) {
          setTimeout(() => setDraftValues({ ...currentValues }), 0)
        }
        prevOpenRef.current = open

        return (
          <>
            <PopoverButton className="btn px-2.5 bg-white dark:bg-gray-800 border-gray-200 hover:border-gray-300 dark:border-gray-700/60 dark:hover:border-gray-600 text-gray-400 dark:text-gray-500">
              <span className="sr-only">{t('filter')}</span><wbr />
              <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16">
                <path d="M0 3a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1ZM3 8a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1ZM7 12a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H7Z" />
              </svg>
              {activeCount > 0 && (
                <span className="ml-1.5 text-xs font-semibold text-violet-500">{activeCount}</span>
              )}
            </PopoverButton>
            <Transition
              as="div"
              className={`origin-top-right z-50 absolute top-full left-0 right-auto min-w-[14rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 pt-1.5 rounded-lg shadow-lg overflow-hidden mt-1 ${align === 'right' ? 'md:left-auto md:right-0' : 'md:left-0 md:right-auto'
                }`}
              enter="transition ease-out duration-200 transform"
              enterFrom="opacity-0 -translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-out duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <PopoverPanel>
                {({ close }) => (
                  <>
                    <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase pt-1.5 pb-2 px-3">{t('filters')}</div>
                    <ul className="mb-4">
                      {filterItems.map((filter) => (
                        <li key={filter.key} className="py-1 px-3">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="form-checkbox"
                              checked={!!draftValues[filter.key]}
                              onChange={() => handleToggle(filter.key)}
                            />
                            <span className="text-sm font-medium ml-2">{filter.label}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                    {renderExtra && (
                      <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-700/60 pt-3">
                        {renderExtra(draftValues)}
                      </div>
                    )}
                    <div className="py-2 px-3 border-t border-gray-200 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-700/20">
                      <ul className="flex items-center justify-between">
                        <li>
                          <button
                            className="btn-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-red-500"
                            onClick={handleClear}
                          >
                            {t('clear')}
                          </button>
                        </li>
                        <li>
                          <button
                            className="btn-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
                            onClick={() => handleApply(close)}
                          >
                            {t('apply')}
                          </button>
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </PopoverPanel>
            </Transition>
          </>
        )
      }}
    </Popover>
  )
}
