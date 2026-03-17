'use client'

import { formatCurrency } from '@/lib/portal/mock-orders'
import type { OrderLineEntity } from '@/lib/portal/types'

export interface CustomerInfoRowProps {
  name: string
  email?: string | null
  phone?: string | null
  isCompany?: boolean
}

export function CustomerInfoRow({ name, email, phone, isCompany }: CustomerInfoRowProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
      <div>
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Name</div>
        <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{name}</div>
      </div>
      <div>
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Email</div>
        <div className="text-sm text-gray-800 dark:text-gray-100">{email || '—'}</div>
      </div>
      <div>
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Phone</div>
        <div className="text-sm text-gray-800 dark:text-gray-100">{phone || '—'}</div>
      </div>
      <div>
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Type</div>
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
          isCompany
            ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
        }`}>
          {isCompany ? 'Company' : 'Individual'}
        </span>
      </div>
    </div>
  )
}

export function CustomerInfoRowSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
      <div>
        <div className="h-3 w-12 rounded bg-gray-100 dark:bg-gray-700/50 mb-2" />
        <div className="h-4 w-36 rounded bg-gray-100 dark:bg-gray-700/50" />
      </div>
      <div>
        <div className="h-3 w-10 rounded bg-gray-100 dark:bg-gray-700/50 mb-2" />
        <div className="h-4 w-40 rounded bg-gray-100 dark:bg-gray-700/50" />
      </div>
      <div>
        <div className="h-3 w-12 rounded bg-gray-100 dark:bg-gray-700/50 mb-2" />
        <div className="h-4 w-28 rounded bg-gray-100 dark:bg-gray-700/50" />
      </div>
      <div>
        <div className="h-3 w-8 rounded bg-gray-100 dark:bg-gray-700/50 mb-2" />
        <div className="h-5 w-20 rounded bg-gray-100 dark:bg-gray-700/50" />
      </div>
    </div>
  )
}

export function CategoryBadge({ category }: { category: string | null | false }) {
  const isPhysical = (typeof category === 'string' ? category.toLowerCase() : '') === 'physical'
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
        isPhysical
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
      }`}
    >
      {isPhysical ? 'Physical' : 'Contract'}
    </span>
  )
}

export function OrderSummary({ lines }: { lines: OrderLineEntity[] }) {
  const physicalSub = lines
    .filter((l) => l.puCategory === 'physical')
    .reduce((s, l) => s + l.priceSubtotal, 0)
  const contractSub = lines
    .filter((l) => l.puCategory !== 'physical')
    .reduce((s, l) => s + l.priceSubtotal, 0)
  const subtotal = physicalSub + contractSub
  const total = subtotal

  return (
    <div className="max-w-xs ml-auto space-y-1.5">
      {physicalSub > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <CategoryBadge category="physical" /> Physical
          </span>
          <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
            {formatCurrency(physicalSub)}
          </span>
        </div>
      )}
      {contractSub > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <CategoryBadge category="contract" /> Contract
          </span>
          <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
            {formatCurrency(contractSub)}
          </span>
        </div>
      )}
      <div className="flex justify-between text-sm border-t border-gray-100 dark:border-gray-700/60 pt-1.5">
        <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
        <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
          {formatCurrency(subtotal)}
        </span>
      </div>
      <div className="flex justify-between text-base border-t-2 border-gray-800 dark:border-gray-200 pt-2 mt-1.5">
        <span className="font-bold text-gray-800 dark:text-gray-100">Total</span>
        <span className="font-extrabold text-green-600 dark:text-green-400 tabular-nums">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  )
}

export function StepContentSkeleton({ rowCount = 3 }: { rowCount?: number }) {
  return (
    <>
      {/* Tip banner skeleton */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl mb-4">
        <div className="w-5 h-5 rounded bg-violet-200 dark:bg-violet-700 animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-3/4 rounded bg-violet-200 dark:bg-violet-700 animate-pulse" />
          <div className="h-3 w-1/2 rounded bg-violet-200 dark:bg-violet-700 animate-pulse" />
        </div>
      </div>

      {/* Table card skeleton */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
          <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </header>
        <div className="overflow-x-auto">
          <table className="table-auto w-full dark:text-gray-300">
            <thead className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-t border-b border-gray-100 dark:border-gray-700/60">
              <tr>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px"><div className="font-semibold text-left">#</div></th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap"><div className="font-semibold text-left">Product-Unit</div></th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap"><div className="font-semibold text-left">Category</div></th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap"><div className="font-semibold text-left">Metric</div></th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap"><div className="font-semibold text-right">Unit Price</div></th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap"><div className="font-semibold text-right">Qty</div></th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap"><div className="font-semibold text-right">Subtotal</div></th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
              {Array.from({ length: rowCount }).map((_, i) => (
                <tr key={i}>
                  <td className="px-2 first:pl-5 last:pr-5 py-3"><div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" /></td>
                  <td className="px-2 first:pl-5 last:pr-5 py-3">
                    <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700 animate-pulse mb-1.5" />
                    <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-700/50 animate-pulse" />
                  </td>
                  <td className="px-2 first:pl-5 last:pr-5 py-3"><div className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" /></td>
                  <td className="px-2 first:pl-5 last:pr-5 py-3"><div className="h-4 w-14 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" /></td>
                  <td className="px-2 first:pl-5 last:pr-5 py-3"><div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse ml-auto" /></td>
                  <td className="px-2 first:pl-5 last:pr-5 py-3"><div className="h-4 w-10 rounded bg-gray-200 dark:bg-gray-700 animate-pulse ml-auto" /></td>
                  <td className="px-2 first:pl-5 last:pr-5 py-3"><div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse ml-auto" /></td>
                  <td className="px-2 first:pl-5 last:pr-5 py-3"><div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary skeleton */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700/60">
          <div className="max-w-xs ml-auto space-y-2">
            <div className="flex justify-between">
              <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>
            <div className="flex justify-between pt-1.5 border-t border-gray-100 dark:border-gray-700/60">
              <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>
            <div className="flex justify-between pt-2 mt-1.5 border-t-2 border-gray-800 dark:border-gray-200">
              <div className="h-5 w-12 rounded bg-gray-300 dark:bg-gray-600 animate-pulse" />
              <div className="h-5 w-28 rounded bg-green-200 dark:bg-green-900/40 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function LinesTable({ lines }: { lines: OrderLineEntity[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full dark:text-gray-300">
        <thead className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-t border-b border-gray-100 dark:border-gray-700/60">
          <tr>
            <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
              <div className="font-semibold text-left">#</div>
            </th>
            <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
              <div className="font-semibold text-left">Product-Unit</div>
            </th>
            <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
              <div className="font-semibold text-left">Category</div>
            </th>
            <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
              <div className="font-semibold text-left">Metric</div>
            </th>
            <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
              <div className="font-semibold text-right">Unit Price</div>
            </th>
            <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
              <div className="font-semibold text-right">Qty</div>
            </th>
            <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
              <div className="font-semibold text-right">Subtotal</div>
            </th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
          {lines.map((line, idx) => (
            <tr key={line.id} className="border-b border-gray-100 dark:border-gray-700/60">
              <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-sm text-gray-400">
                {idx + 1}
              </td>
              <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div className="font-medium text-sm text-gray-800 dark:text-gray-100">
                  {line.productName}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {line.sku}
                </div>
              </td>
              <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <CategoryBadge category={line.puCategory} />
              </td>
              <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-sm tabular-nums text-gray-600 dark:text-gray-300">
                {line.puMetric}
                {line.durationMonths && (
                  <div className="text-xs text-gray-400">{line.durationMonths} Months</div>
                )}
              </td>
              <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-right text-sm tabular-nums text-gray-700 dark:text-gray-200">
                {formatCurrency(line.priceUnit)}
              </td>
              <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-right text-sm tabular-nums text-gray-700 dark:text-gray-200">
                {line.quantity}
              </td>
              <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-right font-semibold text-sm tabular-nums text-gray-800 dark:text-gray-100">
                {formatCurrency(line.priceSubtotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
