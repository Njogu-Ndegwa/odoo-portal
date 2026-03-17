'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import Table from '@/components/table/table'
import DateSelect from '@/components/date-select'
import DropdownSelect from '@/components/dropdown-select'
import FilterButton from '@/components/dropdown-filter'
import type { FilterDefinition } from '@/components/dropdown-filter'
import SearchForm from '@/components/search-form'
import PaginationClassic from '@/components/pagination-classic'
import PageSizeSelect from '@/components/page-size-select'
import { SelectedItemsProvider, useSelectedItems } from '@/app/selected-items-context'
import { useOrderColumns } from './tableColumns'
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

export default function OrdersPageWrapper() {
  return (
    <SelectedItemsProvider>
      <OrdersPage />
    </SelectedItemsProvider>
  )
}

function OrdersPage() {
  const t = useTranslations('portal.orders')
  const tp = useTranslations('portal')
  const columns = useOrderColumns()
  const { setSelectedItems } = useSelectedItems()

  const statePills: { key: StateFilter; label: string }[] = [
    { key: 'all', label: t('states.all') },
    { key: 'draft', label: t('states.draft') },
    { key: 'sent', label: t('states.sent') },
    { key: 'sale', label: t('states.confirmed') },
    { key: 'done', label: t('states.done') },
    { key: 'cancel', label: t('states.cancelled') },
  ]

  const sortOptions = [
    { value: '', label: t('sortOptions.default') },
    { value: 'date', label: t('sortOptions.dateNewest') },
    { value: 'date_asc', label: t('sortOptions.dateOldest') },
    { value: 'updated', label: 'Updated (newest)' },
    { value: 'updated_asc', label: 'Updated (oldest)' },
    { value: 'amount', label: 'Amount (high)' },
    { value: 'amount_asc', label: 'Amount (low)' },
    { value: 'name', label: 'Name' },
    { value: 'customer', label: 'Customer' },
  ]

  const approvalOptions = [
    { value: '', label: t('approval.all') },
    { value: 'not_required', label: t('approval.notRequired') },
    { value: 'pending', label: t('approval.pending') },
    { value: 'approved', label: t('approval.approved') },
    { value: 'rejected', label: t('approval.rejected') },
  ]

  const paymentOptions = [
    { value: '', label: t('payment.all') },
    { value: 'paid', label: t('payment.paid') },
    { value: 'unpaid', label: t('payment.unpaid') },
    { value: 'partial', label: t('payment.partial') },
  ]

  const advancedFilterDefs: FilterDefinition[] = [
    { key: 'mine', label: t('myOrdersOnly') },
  ]

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [stateFilter, setStateFilter] = useState<StateFilter>('all')
  const [dateFilterId, setDateFilterId] = useState<number>(4)
  const [customDateRange, setCustomDateRange] = useState<{ from: string; to: string } | null>(null)

  const [sortValue, setSortValue] = useState('')
  const [approvalFilter, setApprovalFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, boolean>>({})
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')

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

    if (customDateRange) {
      p.created_after = customDateRange.from
      p.created_before = customDateRange.to
    } else {
      const createdAfter = getDateOffset(dateFilterId)
      if (createdAfter) p.created_after = createdAfter
    }

    if (sortValue) p.sort = sortValue
    if (approvalFilter) p.approval_status = approvalFilter
    if (paymentFilter) p.payment_status = paymentFilter
    if (advancedFilters.mine) p.mine = true

    const min = Number(amountMin)
    const max = Number(amountMax)
    if (amountMin && !isNaN(min)) p.amount_min = min
    if (amountMax && !isNaN(max)) p.amount_max = max

    return p
  }, [
    stateFilter, dateFilterId, customDateRange, debouncedSearchTerm,
    sortValue, approvalFilter, paymentFilter, advancedFilters,
    amountMin, amountMax, page, itemsPerPage,
  ])

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

  const handleSelectionChange = (selectedIds: any[]) => {
    setSelectedItems(selectedIds)
  }

  const total = pagination?.totalRecords ?? 0
  const hasNextPage = pagination?.hasNextPage ?? false
  const hasPreviousPage = pagination?.hasPreviousPage ?? false

  useEffect(() => {
    setPage(1)
  }, [
    debouncedSearchTerm, stateFilter, dateFilterId, customDateRange,
    sortValue, approvalFilter, paymentFilter, advancedFilters,
    amountMin, amountMax,
  ])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/portal" className="hover:text-violet-500">{tp('portal')}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-100 font-medium">{t('title')}</span>
      </nav>

      {/* Header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-5">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            {t('title')}
          </h1>
        </div>
        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          <SearchForm placeholder={t('searchOrders')} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <DropdownSelect
            options={sortOptions}
            selected={sortValue}
            onChange={setSortValue}
            placeholder={t('sort')}
            align="right"
            icon={
              <svg className="fill-current text-gray-400 dark:text-gray-500" width="16" height="16" viewBox="0 0 16 16">
                <path d="M3.5 3.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L3.5 12.293V3.5zm4 .5a.5.5 0 0 1 0-1h1a.5.5 0 0 1 0 1h-1zm0 3a.5.5 0 0 1 0-1h3a.5.5 0 0 1 0 1h-3zm0 3a.5.5 0 0 1 0-1h5a.5.5 0 0 1 0 1h-5zm0 3a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7z" />
              </svg>
            }
          />
          <Link
            href="/portal/orders/new"
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white flex items-center justify-center"
          >
            <svg className="fill-current shrink-0 xs:hidden" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
            <span className="max-xs:sr-only">{t('createOrder')}</span>
          </Link>
        </div>
      </div>

      {/* State pills */}
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
            onChange={(id: number) => { setDateFilterId(id); if (id !== -1) setCustomDateRange(null) }}
            enableCustomRange
            onCustomRange={(from: string, to: string) => setCustomDateRange({ from, to })}
          />
          <DropdownSelect
            options={approvalOptions}
            selected={approvalFilter}
            onChange={setApprovalFilter}
            placeholder="Approval"
            align="right"
          />
          <DropdownSelect
            options={paymentOptions}
            selected={paymentFilter}
            onChange={setPaymentFilter}
            placeholder="Payment"
            align="right"
          />
          <FilterButton
            align="right"
            filters={advancedFilterDefs}
            values={advancedFilters}
            onChange={setAdvancedFilters}
            renderExtra={() => (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">{t('amountRange')}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder={t('min')}
                      value={amountMin}
                      onChange={(e) => setAmountMin(e.target.value)}
                      className="form-input w-full text-sm py-1"
                    />
                    <span className="text-gray-400">–</span>
                    <input
                      type="number"
                      placeholder={t('max')}
                      value={amountMax}
                      onChange={(e) => setAmountMax(e.target.value)}
                      className="form-input w-full text-sm py-1"
                    />
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
        <Table
          data={orders}
          columns={columns}
          totalCount={orders.length}
          selectable
          actions={(row) => actions({ row, onDelete: () => fetchOrders() })}
          onSelectionChange={handleSelectionChange}
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
