'use client'

import type { ReactNode } from 'react'

export interface InfoItem {
  label: string
  value: string | ReactNode
}

interface InfoBarProps {
  items: InfoItem[]
}

export default function InfoBar({ items }: InfoBarProps) {
  return (
    <div className="flex gap-7 flex-wrap px-5 py-3.5 bg-gray-50 dark:bg-gray-700/40 border-b border-gray-100 dark:border-gray-700/60">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
            {item.label}
          </span>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}
