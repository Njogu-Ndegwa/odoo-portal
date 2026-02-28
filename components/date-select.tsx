'use client'

import { useState } from 'react'
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'

export interface DateSelectOption {
  id: number;
  period: string;
}

const defaultOptions: DateSelectOption[] = [
  { id: 0, period: 'Today' },
  { id: 1, period: 'Last 7 Days' },
  { id: 2, period: 'Last Month' },
  { id: 3, period: 'Last 12 Months' },
  { id: 4, period: 'All Time' },
]

const CUSTOM_ID = -1

interface DateSelectProps {
  options?: DateSelectOption[];
  selected?: number;
  onChange?: (optionId: number, period: string) => void;
  onCustomRange?: (from: string, to: string) => void;
  enableCustomRange?: boolean;
}

export default function DateSelect({
  options = defaultOptions,
  selected: controlledSelected,
  onChange,
  onCustomRange,
  enableCustomRange = false,
}: DateSelectProps = {}) {

  const [internalSelected, setInternalSelected] = useState<number>(options.length > 2 ? 2 : 0)
  const selected = controlledSelected !== undefined ? controlledSelected : internalSelected

  const [showCalendar, setShowCalendar] = useState(false)
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined)
  const [customLabel, setCustomLabel] = useState<string | null>(null)

  const handlePresetSelect = (option: DateSelectOption, close: () => void) => {
    setShowCalendar(false)
    setCustomLabel(null)
    if (controlledSelected === undefined) {
      setInternalSelected(option.id)
    }
    onChange?.(option.id, option.period)
    close()
  }

  const handleCustomClick = () => {
    setShowCalendar(true)
  }

  const handleRangeApply = (close: () => void) => {
    if (customRange?.from) {
      const fromStr = format(customRange.from, 'yyyy-MM-dd')
      const toStr = customRange.to ? format(customRange.to, 'yyyy-MM-dd') : fromStr
      const label = customRange.to
        ? `${format(customRange.from, 'MMM dd')} - ${format(customRange.to, 'MMM dd')}`
        : format(customRange.from, 'MMM dd, yyyy')

      setCustomLabel(label)
      if (controlledSelected === undefined) {
        setInternalSelected(CUSTOM_ID)
      }
      onChange?.(CUSTOM_ID, label)
      onCustomRange?.(fromStr, toStr)
    }
    setShowCalendar(false)
    close()
  }

  const displayLabel = (() => {
    if (selected === CUSTOM_ID && customLabel) return customLabel
    const opt = options.find(o => o.id === selected)
    return opt?.period || options[0]?.period || 'Select'
  })()

  return (
    <Popover className="relative inline-flex">
      {({ open, close }) => (
        <>
          <PopoverButton className="btn justify-between min-w-[11rem] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100" aria-label="Select date range">
            <span className="flex items-center">
              <svg className="fill-current text-gray-400 dark:text-gray-500 shrink-0 mr-2" width="16" height="16" viewBox="0 0 16 16">
                <path d="M5 4a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H5Z" />
                <path d="M4 0a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4H4ZM2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Z" />
              </svg>
              <span className="truncate">{displayLabel}</span>
            </span>
            <svg className="shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500" width="11" height="7" viewBox="0 0 11 7">
              <path d="M5.4 6.8L0 1.4 1.4 0l4 4 4-4 1.4 1.4z" />
            </svg>
          </PopoverButton>
          <Transition
            as="div"
            className="z-50 absolute top-full right-0 min-w-[11rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1"
            enter="transition ease-out duration-100 transform"
            enterFrom="opacity-0 -translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-out duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <PopoverPanel className="font-medium text-sm text-gray-600 dark:text-gray-300 focus:outline-hidden">
              {!showCalendar ? (
                <>
                  {options.map((option) => (
                    <button
                      key={option.id}
                      className={`flex items-center w-full py-1 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/20 ${option.id === selected && selected !== CUSTOM_ID ? 'text-violet-500' : ''}`}
                      onClick={() => handlePresetSelect(option, close)}
                    >
                      <svg className={`shrink-0 mr-2 fill-current text-violet-500 ${option.id !== selected || selected === CUSTOM_ID ? 'invisible' : ''}`} width="12" height="9" viewBox="0 0 12 9">
                        <path d="M10.28.28L3.989 6.575 1.695 4.28A1 1 0 00.28 5.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28.28z" />
                      </svg>
                      <span>{option.period}</span>
                    </button>
                  ))}
                  {enableCustomRange && (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700/60 my-1.5" />
                      <button
                        className={`flex items-center w-full py-1 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/20 ${selected === CUSTOM_ID ? 'text-violet-500' : ''}`}
                        onClick={handleCustomClick}
                      >
                        <svg className={`shrink-0 mr-2 fill-current text-violet-500 ${selected !== CUSTOM_ID ? 'invisible' : ''}`} width="12" height="9" viewBox="0 0 12 9">
                          <path d="M10.28.28L3.989 6.575 1.695 4.28A1 1 0 00.28 5.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28.28z" />
                        </svg>
                        <span>Custom Range...</span>
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="p-2">
                  <Calendar
                    mode="range"
                    selected={customRange}
                    onSelect={setCustomRange}
                    numberOfMonths={1}
                  />
                  <div className="flex items-center justify-between pt-2 px-1 border-t border-gray-200 dark:border-gray-700/60 mt-2">
                    <button
                      className="btn-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300"
                      onClick={() => setShowCalendar(false)}
                    >
                      Back
                    </button>
                    <button
                      className="btn-xs bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-800 hover:bg-gray-800 dark:hover:bg-white disabled:opacity-50"
                      disabled={!customRange?.from}
                      onClick={() => handleRangeApply(close)}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
