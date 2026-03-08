import { TableColumn } from '@/components/table/table'
import { formatCurrency } from '@/lib/portal/mock-orders'
import type { OrderEntity } from '@/lib/portal/types'

const stateLabels: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
  sent: { label: 'Sent', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  sale: { label: 'Confirmed', className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  done: { label: 'Done', className: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300' },
  cancel: { label: 'Cancelled', className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
}

const paymentLabels: Record<string, { label: string; className: string }> = {
  not_paid: { label: 'Not Paid', className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
  partial: { label: 'Partial', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  paid: { label: 'Paid', className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
}

export const columns: TableColumn<OrderEntity>[] = [
  {
    header: 'Order #',
    accessor: 'name' as keyof OrderEntity,
    cellRenderer: (_value: unknown, item: OrderEntity) => (
      <div className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums text-xs">
        {item.name}
      </div>
    ),
  },
  {
    header: 'Customer',
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
    header: 'State',
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
    header: 'Total',
    accessor: 'amountTotal' as keyof OrderEntity,
    cellRenderer: (_value: unknown, item: OrderEntity) => (
      <div className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums text-sm">
        {formatCurrency(item.amountTotal)}
      </div>
    ),
  },
  {
    header: 'Payment',
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
    header: 'Created',
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

export const dropdownOptions = [
  { id: 0, value: 'Delete' },
]
