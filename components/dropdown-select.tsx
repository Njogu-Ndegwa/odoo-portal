'use client'

import { useState, type ReactNode } from 'react'
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'

export interface SelectOption {
  value: string
  label: string
}

interface DropdownSelectProps {
  options: SelectOption[]
  selected?: string
  onChange?: (value: string) => void
  placeholder?: string
  icon?: ReactNode
  align?: 'left' | 'right'
}

export default function DropdownSelect({
  options,
  selected: controlledSelected,
  onChange,
  placeholder = 'Select',
  icon,
  align = 'right',
}: DropdownSelectProps) {
  const [internalSelected, setInternalSelected] = useState<string>(options[0]?.value ?? '')
  const selected = controlledSelected !== undefined ? controlledSelected : internalSelected

  const displayLabel = options.find((o) => o.value === selected)?.label ?? placeholder

  const handleSelect = (option: SelectOption, close: () => void) => {
    if (controlledSelected === undefined) {
      setInternalSelected(option.value)
    }
    onChange?.(option.value)
    close()
  }

  return (
    <Popover className="relative inline-flex">
      {({ close }) => (
        <>
          <PopoverButton className="btn justify-between min-w-[11rem] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100">
            <span className="flex items-center">
              {icon && <span className="shrink-0 mr-2">{icon}</span>}
              <span className="truncate">{displayLabel}</span>
            </span>
            <svg className="shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500" width="11" height="7" viewBox="0 0 11 7">
              <path d="M5.4 6.8L0 1.4 1.4 0l4 4 4-4 1.4 1.4z" />
            </svg>
          </PopoverButton>
          <Transition
            as="div"
            className={`z-50 absolute top-full min-w-[11rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1 ${align === 'right' ? 'right-0' : 'left-0'}`}
            enter="transition ease-out duration-100 transform"
            enterFrom="opacity-0 -translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-out duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <PopoverPanel className="font-medium text-sm text-gray-600 dark:text-gray-300 focus:outline-hidden">
              {options.map((option) => (
                <button
                  key={option.value}
                  className={`flex items-center w-full py-1 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/20 ${option.value === selected ? 'text-violet-500' : ''}`}
                  onClick={() => handleSelect(option, close)}
                >
                  <svg
                    className={`shrink-0 mr-2 fill-current text-violet-500 ${option.value !== selected ? 'invisible' : ''}`}
                    width="12"
                    height="9"
                    viewBox="0 0 12 9"
                  >
                    <path d="M10.28.28L3.989 6.575 1.695 4.28A1 1 0 00.28 5.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28.28z" />
                  </svg>
                  <span>{option.label}</span>
                </button>
              ))}
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
