'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { TableColumn } from '@/components/table/table'
import { formatCurrency } from '@/lib/portal/mock-orders'
import type { OrderEntity } from '@/lib/portal/types'

const stateLabelKeys: Record<string, string> = {
  draft: 'draft',
  sent: 'sent',
  sale: 'confirmed',
  done: 'done',
  cancel: 'cancelled',
}

const stateClassNames: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  sale: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  done: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  cancel: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

const approvalLabelKeys: Record<string, string> = {
  approved: 'approved',
  pending: 'pending',
  rejected: 'rejected',
  not_required: 'na',
  none: 'na',
}

const approvalClassNames: Record<string, string> = {
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  not_required: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  none: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
}

const paymentLabelKeys: Record<string, string> = {
  not_paid: 'notPaid',
  partial: 'partial',
  paid: 'paid',
}

const paymentClassNames: Record<string, string> = {
  not_paid: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  partial: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
}

export function useOrderColumns(): TableColumn<OrderEntity>[] {
  const t = useTranslations('portal.orders.columns')
  const ts = useTranslations('portal.orders.states')
  const ta = useTranslations('portal.orders.approval')
  const tpay = useTranslations('portal.orders.payment')

  const stateLabels: Record<string, { label: string; className: string }> = {}
  for (const [key, transKey] of Object.entries(stateLabelKeys)) {
    stateLabels[key] = { label: ts(transKey as any), className: stateClassNames[key] }
  }

  const approvalLabels: Record<string, { label: string; className: string }> = {}
  for (const [key, transKey] of Object.entries(approvalLabelKeys)) {
    approvalLabels[key] = { label: ta(transKey as any), className: approvalClassNames[key] }
  }

  const paymentLabels: Record<string, { label: string; className: string }> = {}
  for (const [key, transKey] of Object.entries(paymentLabelKeys)) {
    paymentLabels[key] = { label: tpay(transKey as any), className: paymentClassNames[key] }
  }

  return [
    {
      header: t('orderNumber'),
      accessor: 'name' as keyof OrderEntity,
      cellRenderer: (_value: unknown, item: OrderEntity) => (
        <Link
          href={`/portal/orders/${item.id}`}
          className="font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 tabular-nums text-xs"
        >
          {item.name}
        </Link>
      ),
    },
    {
      header: t('customer'),
      accessor: 'partnerName' as keyof OrderEntity,
      cellRenderer: (_value: unknown, item: OrderEntity) => (
        <div>
          <div className="font-medium text-gray-800 dark:text-gray-100">{item.partnerName}</div>
          {item.contactPerson && (
            <div className="text-xs text-gray-500 dark:text-gray-400">{item.contactPerson}</div>
          )}
        </div>
      ),
    },
    {
      header: t('state'),
      accessor: 'state' as keyof OrderEntity,
      cellRenderer: (_value: unknown, item: OrderEntity) => {
        const s = stateLabels[item.state] ?? stateLabels.draft
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${s.className}`}>
            {s.label}
          </span>
        )
      },
    },
    {
      header: t('approval'),
      accessor: 'approvalStatus' as keyof OrderEntity,
      cellRenderer: (_value: unknown, item: OrderEntity) => {
        const a = approvalLabels[item.approvalStatus] ?? approvalLabels.none
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${a.className}`}>
            {a.label}
          </span>
        )
      },
    },
    {
      header: t('total'),
      accessor: 'amountTotal' as keyof OrderEntity,
      cellRenderer: (_value: unknown, item: OrderEntity) => (
        <div className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums text-sm">
          {formatCurrency(item.amountTotal)}
        </div>
      ),
    },
    {
      header: t('payment'),
      accessor: 'paymentStatus' as keyof OrderEntity,
      cellRenderer: (_value: unknown, item: OrderEntity) => {
        const p = paymentLabels[item.paymentStatus] ?? paymentLabels.not_paid
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${p.className}`}>
            {p.label}
          </span>
        )
      },
    },
    {
      header: t('created'),
      accessor: 'createdAt' as keyof OrderEntity,
      cellRenderer: (_value: unknown, item: OrderEntity) => {
        if (!item.createdAt) return <div>-</div>
        try {
          const d = new Date(item.createdAt)
          return (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
            </div>
          )
        } catch {
          return <div>-</div>
        }
      },
    },
  ]
}

export const dropdownOptions = [
  { id: 0, value: 'Delete' },
]
