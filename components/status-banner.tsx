'use client'

import type { ReactNode } from 'react'
import { CheckCircle2, Info, AlertTriangle, XCircle } from 'lucide-react'

type BannerVariant = 'success' | 'info' | 'warning' | 'danger'

interface StatusBannerProps {
  variant: BannerVariant
  title: string
  description: string
  icon?: ReactNode
}

const config: Record<
  BannerVariant,
  { bg: string; border: string; titleColor: string; iconBg: string; DefaultIcon: typeof CheckCircle2 }
> = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    titleColor: 'text-green-800 dark:text-green-300',
    iconBg: 'bg-green-600 dark:bg-green-500',
    DefaultIcon: CheckCircle2,
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    titleColor: 'text-blue-800 dark:text-blue-300',
    iconBg: 'bg-blue-600 dark:bg-blue-500',
    DefaultIcon: Info,
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    titleColor: 'text-amber-800 dark:text-amber-300',
    iconBg: 'bg-amber-600 dark:bg-amber-500',
    DefaultIcon: AlertTriangle,
  },
  danger: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    titleColor: 'text-red-800 dark:text-red-300',
    iconBg: 'bg-red-600 dark:bg-red-500',
    DefaultIcon: XCircle,
  },
}

export default function StatusBanner({ variant, title, description, icon }: StatusBannerProps) {
  const c = config[variant]
  const IconComponent = c.DefaultIcon

  return (
    <div
      className={`flex items-center gap-3.5 px-5 py-4 rounded-xl border mb-4 ${c.bg} ${c.border}`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${c.iconBg}`}
      >
        {icon ?? <IconComponent className="w-5 h-5 text-white" />}
      </div>
      <div>
        <h3 className={`text-sm font-bold ${c.titleColor}`}>{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </div>
  )
}
