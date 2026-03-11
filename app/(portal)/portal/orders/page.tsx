'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Table from '@/components/table/table'
import DateSelect from '@/components/date-select'
import SearchForm from '@/components/search-form'
import PaginationClassic from '@/components/pagination-classic'
import PageSizeSelect from '@/components/page-size-select'
import { SelectedItemsProvider } from '@/app/selected-items-context'
import { columns } from './tableColumns'
import { actions } from './tableActions'
import { getOrders, type GetOrdersParams } from '@/lib/portal/order-api'
import type { OrderState, OrderEntity, PaginationMeta } from '@/lib/portal/types'

const dateOptions = [
  { id: 0, period: 'Today' },
  { id: 1, period: 'Last 7 Days' },
  { id: 2, period: 'Last 30 Days' },
  { id: 3, period: 'Last 12 Months' },
  { id: 4, period: 'All Time' },
]

function getDateOffset(optionId: number): string | undefined {
  const now = new Date()
  switch (optionId) {
    case 0: return now.toISOString().split('T')[0]
    case 1: { const d = new Date(now); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0] }
    case 2: { const d = new Date(now); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0] }
    case 3: { const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d.toISOString().split('T')[0] }
    default: return undefined
  }
}

type StateFilter = 'all' | OrderState

const statePills: { key: StateFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'sent', label: 'Sent' },
  { key: 'sale', label: 'Confirmed' },
  { key: 'done', label: 'Done' },
]

export default function OrdersPageWrapper() {
  return (
    <SelectedItemsProvider>
      <OrdersPage />
    </SelectedItemsProvider>
  )
}

function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [stateFilter, setStateFilter] = useState<StateFilter>('all')
  const [dateFilterId, setDateFilterId] = useState<number>(4)

  const [orders, setOrders] = useState<OrderEntity[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const params = useMemo<GetOrdersParams>(() => {
    const p: GetOrdersParams = { page, limit: itemsPerPage }
    if (stateFilter !== 'all') p.state = stateFilter
    if (debouncedSearchTerm.trim()) p.search = debouncedSearchTerm.trim()
    const createdAfter = getDateOffset(dateFilterId)
    if (createdAfter) p.created_after = createdAfter
    return p
  }, [stateFilter, dateFilterId, debouncedSearchTerm, page, itemsPerPage])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getOrders(params)
      setOrders(result.data)
      setPagination(result.pagination)
    } catch {
      setOrders([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const total = pagination?.totalRecords ?? 0
  const hasNextPage = pagination?.hasNextPage ?? false
  const hasPreviousPage = pagination?.hasPreviousPage ?? false

  useEffect(() => {
    setPage(1)
  }, [debouncedSearchTerm, stateFilter, dateFilterId])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/portal" className="hover:text-violet-500">Portal</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-100 font-medium">Orders</span>
      </nav>

      {/* Header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-5">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            Orders
          </h1>
        </div>
        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          <SearchForm placeholder="Search orders…" searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <Link
            href="/portal/orders/new"
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white flex items-center justify-center"
          >
            <svg className="fill-current shrink-0 xs:hidden" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
            <span className="max-xs:sr-only">Create Order</span>
          </Link>
        </div>
      </div>

      {/* Filters row */}
      <div className="sm:flex sm:justify-between sm:items-center mb-5">
        <div className="mb-4 sm:mb-0">
          <ul className="flex flex-wrap -m-1">
            {statePills.map((pill) => (
              <li key={pill.key} className="m-1">
                <button
                  className={`inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border shadow-sm transition ${
                    stateFilter === pill.key
                      ? 'border-transparent bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-800'
                      : 'border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setStateFilter(pill.key)}
                >
                  {pill.label}
                  {pill.key === 'all' && (
                    <span className="ml-1 text-gray-400 dark:text-gray-500">{total}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          <DateSelect
            options={dateOptions}
            selected={dateFilterId}
            onChange={(id: number) => setDateFilterId(id)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
        <Table
          data={orders}
          columns={columns}
          totalCount={orders.length}
          actions={(row) => actions({ row, onDelete: () => fetchOrders() })}
          isLoading={loading}
        />
      </div>

      {/* Pagination */}
      <div className="mt-8 sm:flex sm:items-center sm:justify-between">
        <PageSizeSelect value={itemsPerPage} onChange={(v: number) => { setItemsPerPage(v); setPage(1) }} />
        <div className="mt-4 sm:mt-0">
          <PaginationClassic
            currentPage={page}
            totalItems={total}
            itemsPerPage={itemsPerPage}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onNextPage={() => hasNextPage && setPage((p) => p + 1)}
            onPreviousPage={() => hasPreviousPage && setPage((p) => Math.max(1, p - 1))}
          />
        </div>
      </div>
    </div>
  )
}
