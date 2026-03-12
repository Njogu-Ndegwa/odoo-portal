'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@apollo/client'
import Link from 'next/link'
import Table from '@/components/table/table'
import DynamicDropdown from '@/components/dropdown-dynamic'
import DateSelect from '@/components/date-select'
import DropdownSelect from '@/components/dropdown-select'
import FilterButton from '@/components/dropdown-filter'
import type { FilterDefinition } from '@/components/dropdown-filter'
import SearchForm from '@/components/search-form'
import PaginationClassic from '@/components/pagination-classic'
import PageSizeSelect from '@/components/page-size-select'
import { SelectedItemsProvider, useSelectedItems } from '@/app/selected-items-context'
import { columns, dropdownOptions } from './tableColumns'
import { actions } from './tableActions'
import { getSalesUser } from '@/lib/odoo-auth'
import { PRODUCT_UNITS_QUERY } from '@/lib/portal/queries'
import type { ProductUnitsListResponse, ProductUnitsFilterInput } from '@/lib/portal/types'

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
    case 4: return undefined
    default: return undefined
  }
}

const advancedFilterDefs: FilterDefinition[] = [
  { key: 'service_access', label: 'Service: Access type' },
  { key: 'service_gage', label: 'Service: Gage type' },
  { key: 'contract_privilege', label: 'Contract: Privilege' },
  { key: 'contract_warranty', label: 'Contract: Warranty' },
  { key: 'contract_rental', label: 'Contract: Rental' },
  { key: 'contract_maintenance', label: 'Contract: Maintenance' },
  { key: 'contract_asset_assignment', label: 'Contract: Asset Assignment' },
  { key: 'active_only', label: 'Active only' },
  { key: 'show_inactive', label: 'Show inactive' },
  { key: 'recently_updated', label: 'Recently updated only' },
]

const sortOptions = [
  { value: '', label: 'Default' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'date', label: 'Date (newest)' },
  { value: 'updated', label: 'Updated (newest)' },
  { value: 'price', label: 'Price (high-low)' },
]

const metricOptions = [
  { value: '', label: 'All Metrics' },
  { value: 'piece', label: 'Piece' },
  { value: 'duration', label: 'Duration' },
  { value: 'count', label: 'Count' },
  { value: 'energy', label: 'Energy' },
  { value: 'distance', label: 'Distance' },
]

type CategoryFilter = 'all' | 'physical' | 'service' | 'contract' | 'digital'

export default function PortalProductsPageWrapper() {
  return (
    <SelectedItemsProvider>
      <PortalProductsPage />
    </SelectedItemsProvider>
  )
}

function PortalProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [dateFilterId, setDateFilterId] = useState<number>(4)
  const [customDateRange, setCustomDateRange] = useState<{ from: string; to: string } | null>(null)
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, boolean>>({})
  const [sortValue, setSortValue] = useState('')
  const [metricFilter, setMetricFilter] = useState('')

  const { setSelectedItems } = useSelectedItems()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const filters = useMemo<ProductUnitsFilterInput>(() => {
    const f: ProductUnitsFilterInput = { page, limit: itemsPerPage }
    const user = getSalesUser()
    if (user?.companyId) f.companyId = user.companyId
    if (categoryFilter !== 'all') f.puCategory = categoryFilter
    if (debouncedSearchTerm.trim()) f.search = debouncedSearchTerm.trim()

    if (customDateRange) {
      f.createdAfter = customDateRange.from
      f.createdBefore = customDateRange.to
    } else {
      const createdAfter = getDateOffset(dateFilterId)
      if (createdAfter) f.createdAfter = createdAfter
    }

    if (advancedFilters.service_access) f.serviceType = 'access'
    else if (advancedFilters.service_gage) f.serviceType = 'gage'

    const contractKey = Object.keys(advancedFilters).find(
      (k) => k.startsWith('contract_') && advancedFilters[k]
    )
    if (contractKey) f.contractType = contractKey.replace('contract_', '')

    if (advancedFilters.active_only) f.active = true
    else if (advancedFilters.show_inactive) f.active = false

    if (advancedFilters.recently_updated) {
      const d = new Date()
      d.setDate(d.getDate() - 7)
      f.updatedAfter = d.toISOString().split('T')[0]
    }

    if (sortValue) f.sort = sortValue
    if (metricFilter) f.puMetric = metricFilter

    return f
  }, [
    categoryFilter, debouncedSearchTerm, dateFilterId, customDateRange,
    advancedFilters, sortValue, metricFilter, page, itemsPerPage,
  ])

  const { data, loading, refetch } = useQuery<ProductUnitsListResponse>(PRODUCT_UNITS_QUERY, {
    variables: { filters },
    fetchPolicy: 'cache-and-network',
  })

  const products = data?.productUnits.data ?? []
  const pagination = data?.productUnits.pagination
  const total = pagination?.totalRecords ?? 0
  const hasNextPage = pagination?.hasNextPage ?? false
  const hasPreviousPage = pagination?.hasPreviousPage ?? false

  useEffect(() => {
    setPage(1)
  }, [debouncedSearchTerm, categoryFilter, dateFilterId, customDateRange, advancedFilters, sortValue, metricFilter])

  const handleNextPage = () => {
    if (hasNextPage) setPage((p) => p + 1)
  }

  const handlePreviousPage = () => {
    if (hasPreviousPage) setPage((p) => Math.max(1, p - 1))
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setPage(1)
  }

  const handleSelectionChange = (ids: any[]) => {
    setSelectedItems(ids)
  }

  const loadData = () => {
    refetch()
    setSelectedItems([])
  }

  const categoryPills: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'physical', label: 'Physical' },
    { key: 'service', label: 'Service' },
    { key: 'contract', label: 'Contract' },
    { key: 'digital', label: 'Digital' },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/portal" className="hover:text-violet-500">Portal</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-100 font-medium">Products</span>
      </nav>

      {/* Header section */}
      <div className="sm:flex sm:justify-between sm:items-center mb-5">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            Products
          </h1>
        </div>

        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          <SearchForm
            placeholder="Search"
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          <DropdownSelect
            options={sortOptions}
            selected={sortValue}
            onChange={setSortValue}
            placeholder="Sort"
            align="right"
            icon={
              <svg className="fill-current text-gray-400 dark:text-gray-500" width="16" height="16" viewBox="0 0 16 16">
                <path d="M3.5 3.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L3.5 12.293V3.5zm4 .5a.5.5 0 0 1 0-1h1a.5.5 0 0 1 0 1h-1zm0 3a.5.5 0 0 1 0-1h3a.5.5 0 0 1 0 1h-3zm0 3a.5.5 0 0 1 0-1h5a.5.5 0 0 1 0 1h-5zm0 3a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7z" />
              </svg>
            }
          />
          <Link
            href="/portal/products/new"
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white flex items-center justify-center"
          >
            <svg className="fill-current shrink-0 xs:hidden" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
            <span className="max-xs:sr-only">Add</span>
          </Link>
        </div>
      </div>

      <div className="sm:flex sm:justify-between sm:items-center mb-5">
        {/* Left side -- category pills */}
        <div className="mb-4 sm:mb-0">
          <ul className="flex flex-wrap -m-1">
            {categoryPills.map((pill) => (
              <li key={pill.key} className="m-1">
                <button
                  className={`inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border shadow-sm transition ${
                    categoryFilter === pill.key
                      ? 'border-transparent bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-800'
                      : 'border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setCategoryFilter(pill.key)}
                >
                  {pill.label}
                  {pill.key === 'all' && <span className="ml-1 text-gray-400 dark:text-gray-500">{total}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right side */}
        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          <DynamicDropdown options={dropdownOptions} onDropdownItemSelect={() => {}} />
          <DropdownSelect
            options={metricOptions}
            selected={metricFilter}
            onChange={setMetricFilter}
            placeholder="Metric"
            align="right"
          />
          <DateSelect
            options={dateOptions}
            selected={dateFilterId}
            onChange={(optionId: number) => { setDateFilterId(optionId); if (optionId !== -1) setCustomDateRange(null) }}
            enableCustomRange
            onCustomRange={(from: string, to: string) => setCustomDateRange({ from, to })}
          />
          <FilterButton
            align="right"
            filters={advancedFilterDefs}
            values={advancedFilters}
            onChange={setAdvancedFilters}
          />
        </div>
      </div>

      {/* Table section */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
        <Table
          data={products}
          columns={columns}
          totalCount={products.length}
          selectable
          actions={(row) => actions({ row, onDelete: loadData })}
          onSelectionChange={handleSelectionChange}
          isLoading={loading}
        />
      </div>

      <div className="mt-8 sm:flex sm:items-center sm:justify-between">
        <PageSizeSelect value={itemsPerPage} onChange={handleItemsPerPageChange} />
        <div className="mt-4 sm:mt-0">
          <PaginationClassic
            currentPage={page}
            totalItems={total}
            itemsPerPage={itemsPerPage}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
          />
        </div>
      </div>
    </div>
  )
}
