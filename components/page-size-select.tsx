'use client'

import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react'

interface PageSizeSelectProps {
  value: number;
  onChange: (size: number) => void;
  options?: number[];
}

export default function PageSizeSelect({
  value,
  onChange,
  options = [10, 20, 50, 100],
}: PageSizeSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
        Show
      </span>
      <Menu as="div" className="relative inline-flex">
        <MenuButton className="btn justify-between min-w-[5rem] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100">
          <span>{value}</span>
          <svg className="shrink-0 ml-2 fill-current text-gray-400 dark:text-gray-500" width="11" height="7" viewBox="0 0 11 7">
            <path d="M5.4 6.8L0 1.4 1.4 0l4 4 4-4 1.4 1.4z" />
          </svg>
        </MenuButton>
        <Transition
          as="div"
          className="z-50 absolute bottom-full left-0 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mb-1"
          enter="transition ease-out duration-100 transform"
          enterFrom="opacity-0 translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-out duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <MenuItems className="font-medium text-sm text-gray-600 dark:text-gray-300 focus:outline-hidden">
            {options.map((size) => (
              <MenuItem key={size}>
                {({ active }) => (
                  <button
                    className={`flex items-center w-full py-1 px-3 cursor-pointer ${active ? 'bg-gray-50 dark:bg-gray-700/20' : ''} ${size === value ? 'text-violet-500' : ''}`}
                    onClick={() => onChange(size)}
                  >
                    <svg className={`shrink-0 mr-2 fill-current text-violet-500 ${size !== value ? 'invisible' : ''}`} width="12" height="9" viewBox="0 0 12 9">
                      <path d="M10.28.28L3.989 6.575 1.695 4.28A1 1 0 00.28 5.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28.28z" />
                    </svg>
                    <span>{size}</span>
                  </button>
                )}
              </MenuItem>
            ))}
          </MenuItems>
        </Transition>
      </Menu>
      <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
        entries
      </span>
    </div>
  );
}
