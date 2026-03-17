'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Table from '@/components/table/table'
import DynamicDropdown from '@/components/dropdown-dynamic'
import DateSelect from '@/components/date-select'
import FilterButton from '@/components/dropdown-filter'
import type { FilterDefinition } from '@/components/dropdown-filter'
import SearchForm from '@/components/search-form'
import PaginationClassic from '@/components/pagination-classic'
import PageSizeSelect from '@/components/page-size-select'
import { useTranslations } from 'next-intl'
import { SelectedItemsProvider, useSelectedItems } from '@/app/selected-items-context'
import { useAlert } from '@/app/contexts/alertContext'
import { getServiceAccounts, deleteServiceAccount } from '@/lib/sa-api'
import type { SADetail, GetServiceAccountsParams, SAState } from '@/lib/sa-types'
import { useServiceAccountColumns } from './tableColumns'
import { actions } from './tableActions'

type StateFilter = 'all' | 'active' | 'inactive'

export default function ServiceAccountsPageWrapper() {
  return (
    <SelectedItemsProvider>
      <ServiceAccountsPage />
    </SelectedItemsProvider>
  )
}

function ServiceAccountsPage() {
  const { alert } = useAlert()
  const { selectedItems, setSelectedItems } = useSelectedItems()
  const t = useTranslations('portal.serviceAccounts')
  const tc = useTranslations('common')
  const tp = useTranslations('portal')
  const tds = useTranslations('dateSelect')
  const columns = useServiceAccountColumns()

  const dateOptions = [
    { id: 0, period: tds('today') },
    { id: 1, period: tds('last7Days') },
    { id: 2, period: tds('last30Days') },
    { id: 3, period: tds('last12Months') },
    { id: 4, period: tds('allTime') },
  ]

  const advancedFilterDefs: FilterDefinition[] = [
    { key: 'is_root', label: t('rootOnly') },
  ]

  const [accounts, setAccounts] = useState<SADetail[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [stateFilter, setStateFilter] = useState<StateFilter>('all')
  const [dateFilterId, setDateFilterId] = useState<number>(4)
  const [customDateRange, setCustomDateRange] = useState<{ from: string; to: string } | null>(null)
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, boolean>>({})
  const [sortValue, setSortValue] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearchTerm, stateFilter, dateFilterId, customDateRange, advancedFilters, sortValue])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params: GetServiceAccountsParams = {}
      if (debouncedSearchTerm.trim()) params.search = debouncedSearchTerm.trim()
      if (stateFilter !== 'all') params.state = stateFilter as SAState
      if (advancedFilters.is_root) params.is_root = true
      const res = await getServiceAccounts(params)
      setAccounts(res.service_accounts ?? [])
    } catch {
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchTerm, stateFilter, advancedFilters])

  useEffect(() => { fetchData() }, [fetchData])

  const sortedAccounts = useMemo(() => {
    const sorted = [...accounts]
    if (sortValue === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
    else if (sortValue === 'name_desc') sorted.sort((a, b) => b.name.localeCompare(a.name))
    return sorted
  }, [accounts, sortValue])

  const total = sortedAccounts.length
  const totalPages = Math.ceil(total / itemsPerPage)
  const paged = sortedAccounts.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  const hasNextPage = page < totalPages
  const hasPreviousPage = page > 1

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
    fetchData()
    setSelectedItems([])
  }

  const handleDropdownItemSelect = async () => {
    if (selectedItems.length === 0) {
      alert({ text: t('selectAccountFirst'), type: 'error' })
      return
    }
    try {
      for (const id of selectedItems) {
        await deleteServiceAccount(Number(id))
      }
      alert({ text: t('deletedSuccess', { count: selectedItems.length }), type: 'success' })
      loadData()
    } catch (err: unknown) {
      alert({ text: err instanceof Error ? err.message : t('deleteFailed'), type: 'error' })
    }
  }

  const typePills: { key: StateFilter; label: string }[] = [
    { key: 'all', label: t('states.all') },
    { key: 'active', label: t('states.active') },
    { key: 'inactive', label: t('states.inactive') },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/portal" className="hover:text-violet-500">{tp('portal')}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-100 font-medium">{t('title')}</span>
      </nav>

      {/* Header section */}
      <div className="sm:flex sm:justify-between sm:items-center mb-5">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            {t('title')}
          </h1>
        </div>

        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          <SearchForm
            placeholder={tc('search')}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          <Link
            href="/portal/service-accounts/new"
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white flex items-center justify-center"
          >
            <svg
              className="fill-current shrink-0 xs:hidden"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
            <span className="max-xs:sr-only">{tc('add')}</span>
          </Link>
        </div>
      </div>

      {/* Filter row */}
      <div className="sm:flex sm:justify-between sm:items-center mb-5">
        <div className="mb-4 sm:mb-0">
          <ul className="flex flex-wrap -m-1">
            {typePills.map((pill) => (
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
                  {pill.key === 'all' && <span className="ml-1 text-gray-400 dark:text-gray-500">{total}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          <DynamicDropdown options={[{ id: 0, value: t('deleteSelected') }]} onDropdownItemSelect={handleDropdownItemSelect} />
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
          data={paged}
          columns={columns}
          totalCount={paged.length}
          selectable
          actions={(row) => actions({ row, onDelete: loadData })}
          onSelectionChange={handleSelectionChange}
          isLoading={loading}
        />
      </div>

      {/* Pagination */}
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
