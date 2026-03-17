'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation } from '@apollo/client'
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
import { SearchableListModal } from '@/components/seachable-list-modal'
import { SelectedItemsProvider, useSelectedItems } from '@/app/selected-items-context'
import { useAlert } from '@/app/contexts/alertContext'
import { useTranslations } from 'next-intl'
import { usePortalCustomerColumns, dropdownOptions } from './tableColumns'
import { actions } from './tableActions'
import { getSalesToken, getSalesUser } from '@/lib/odoo-auth'
import { fetchEmployees, type Employee } from '@/lib/services/customer-service'
import { CUSTOMERS_QUERY } from '@/lib/portal/queries'
import { ASSIGN_CUSTOMER_TO_EMPLOYEE } from '@/lib/portal/mutations'
import type { CustomersListResponse, CustomersFilterInput, ContactType } from '@/lib/portal/types'

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
  { key: 'all_company', label: 'Show all company contacts' },
  { key: 'recently_updated', label: 'Recently updated only' },
  { key: 'strict', label: 'Strict company match' },
]

const sortOptions = [
  { value: '', label: 'Default' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'date', label: 'Date (newest)' },
  { value: 'date_asc', label: 'Date (oldest)' },
  { value: 'updated', label: 'Updated (newest)' },
  { value: 'updated_asc', label: 'Updated (oldest)' },
]

type TypeFilter = 'all' | 'individual' | 'company'

const typeFilterMap: Record<TypeFilter, ContactType | undefined> = {
  all: undefined,
  individual: 'INDIVIDUAL',
  company: 'COMPANY',
}

export default function PortalCustomersPageWrapper() {
  return (
    <SelectedItemsProvider>
      <PortalCustomersPage />
    </SelectedItemsProvider>
  )
}

function PortalCustomersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [dateFilterId, setDateFilterId] = useState<number>(4)
  const [customDateRange, setCustomDateRange] = useState<{ from: string; to: string } | null>(null)
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, boolean>>({})
  const [sortValue, setSortValue] = useState('')

  const [fieldName, setFieldName] = useState('')
  const [fieldEmail, setFieldEmail] = useState('')
  const [fieldPhone, setFieldPhone] = useState('')
  const [fieldLogic, setFieldLogic] = useState<'AND' | 'OR'>('AND')

  const [employees, setEmployees] = useState<Employee[]>([])
  const [agentSearchQuery, setAgentSearchQuery] = useState('')
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null)
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false)

  const { selectedItems, setSelectedItems } = useSelectedItems()
  const { alert } = useAlert()

  const t = useTranslations('portal.customers')
  const tp = useTranslations('portal')
  const tc = useTranslations('common')
  const columns = usePortalCustomerColumns()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const filters = useMemo<CustomersFilterInput>(() => {
    const f: CustomersFilterInput = { page, limit: itemsPerPage }

    const gqlType = typeFilterMap[typeFilter]
    if (gqlType) f.type = gqlType

    if (debouncedSearchTerm.trim()) f.search = debouncedSearchTerm.trim()

    if (customDateRange) {
      f.createdAfter = customDateRange.from
      f.createdBefore = customDateRange.to
    } else {
      const createdAfter = getDateOffset(dateFilterId)
      if (createdAfter) f.createdAfter = createdAfter
    }

    if (advancedFilters.all_company) f.allCompany = true
    if (advancedFilters.strict) f.strict = true
    if (advancedFilters.recently_updated) {
      const d = new Date()
      d.setDate(d.getDate() - 7)
      f.updatedAfter = d.toISOString().split('T')[0]
    }

    if (sortValue) f.sort = sortValue

    if (fieldName.trim()) f.name = fieldName.trim()
    if (fieldEmail.trim()) f.email = fieldEmail.trim()
    if (fieldPhone.trim()) f.phone = fieldPhone.trim()
    if (fieldName.trim() || fieldEmail.trim() || fieldPhone.trim()) {
      f.logic = fieldLogic
    }

    return f
  }, [
    typeFilter, dateFilterId, customDateRange, advancedFilters,
    debouncedSearchTerm, sortValue, fieldName, fieldEmail, fieldPhone, fieldLogic,
    page, itemsPerPage,
  ])

  const { data, loading, refetch } = useQuery<CustomersListResponse>(CUSTOMERS_QUERY, {
    variables: { filters },
    fetchPolicy: 'cache-and-network',
  })

  const customers = data?.customers.data ?? []
  const pagination = data?.customers.pagination
  const total = pagination?.totalRecords ?? 0
  const hasNextPage = pagination?.hasNextPage ?? false
  const hasPreviousPage = pagination?.hasPreviousPage ?? false

  const [assignCustomer] = useMutation(ASSIGN_CUSTOMER_TO_EMPLOYEE)

  useEffect(() => {
    setPage(1)
  }, [
    debouncedSearchTerm, typeFilter, dateFilterId, customDateRange,
    advancedFilters, sortValue, fieldName, fieldEmail, fieldPhone, fieldLogic,
  ])

  useEffect(() => {
    if (!isAgentModalOpen) return
    const token = getSalesToken()
    const user = getSalesUser()
    fetchEmployees(
      { companyId: user?.companyId, search: agentSearchQuery || undefined },
      token || undefined
    )
      .then((result) => setEmployees(result.employees))
      .catch((err) => console.error('Failed to load employees:', err))
  }, [isAgentModalOpen, agentSearchQuery])

  const handleDropdownItemSelect = () => {
    setIsAgentModalOpen(true)
  }

  const handleAgentSelect = (agent: Employee) => {
    setSelectedAgentId(agent.id)
  }

  const handleAssignAction = async () => {
    if (!selectedAgentId) {
      alert({ text: 'Select an agent first', type: 'error' })
      return
    }
    if (selectedItems.length === 0) {
      alert({ text: 'Select at least one customer first', type: 'error' })
      return
    }

    try {
      for (const customerId of selectedItems) {
        await assignCustomer({
          variables: { input: { customerId: Number(customerId), employeeId: selectedAgentId } },
        })
      }
      alert({ text: `${selectedItems.length} customer(s) assigned successfully`, type: 'success' })
      setSelectedItems([])
      setSelectedAgentId(null)
      refetch()
    } catch (err: unknown) {
      alert({ text: err instanceof Error ? err.message : 'Assignment failed', type: 'error' })
    }
  }

  const handleSelectionChange = (ids: any[]) => {
    setSelectedItems(ids)
  }

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

  const loadData = () => {
    refetch()
    setSelectedItems([])
  }

  const filteredEmployees = employees.filter((e) =>
    e.name.toLowerCase().includes(agentSearchQuery.toLowerCase()) ||
    e.email.toLowerCase().includes(agentSearchQuery.toLowerCase())
  )

  const typePills: { key: TypeFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'individual', label: 'Individual' },
    { key: 'company', label: 'Company' },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      <SearchableListModal
        isOpen={isAgentModalOpen}
        setIsOpen={setIsAgentModalOpen}
        title="Select an Agent"
        items={filteredEmployees}
        searchPlaceholder="Search for an agent..."
        searchValue={agentSearchQuery}
        onSearch={setAgentSearchQuery}
        renderItem={(agent) => (
          <div className="flex flex-col">
            <span className="font-medium">{agent.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{agent.email}</span>
          </div>
        )}
        onSelect={handleAgentSelect}
        selectedItemId={selectedAgentId}
        actionLabel="Assign Customer"
        onAction={handleAssignAction}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/portal" className="hover:text-violet-500">Portal</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-100 font-medium">Customers</span>
      </nav>

      {/* Header section */}
      <div className="sm:flex sm:justify-between sm:items-center mb-5">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            Customers
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
            href="/portal/customers/new"
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
            <span className="max-xs:sr-only">Add</span>
          </Link>
        </div>
      </div>

      <div className="sm:flex sm:justify-between sm:items-center mb-5">
        {/* Left side -- type pills */}
        <div className="mb-4 sm:mb-0">
          <ul className="flex flex-wrap -m-1">
            {typePills.map((pill) => (
              <li key={pill.key} className="m-1">
                <button
                  className={`inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border shadow-sm transition ${
                    typeFilter === pill.key
                      ? 'border-transparent bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-800'
                      : 'border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setTypeFilter(pill.key)}
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
          <DynamicDropdown options={dropdownOptions} onDropdownItemSelect={handleDropdownItemSelect} />
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
            renderExtra={() => (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Field Search</label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    className="form-input w-full text-sm py-1 mb-1.5"
                  />
                  <input
                    type="text"
                    placeholder="Email"
                    value={fieldEmail}
                    onChange={(e) => setFieldEmail(e.target.value)}
                    className="form-input w-full text-sm py-1 mb-1.5"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={fieldPhone}
                    onChange={(e) => setFieldPhone(e.target.value)}
                    className="form-input w-full text-sm py-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Match Logic</label>
                  <div className="flex gap-2">
                    {(['AND', 'OR'] as const).map((logic) => (
                      <button
                        key={logic}
                        className={`text-xs font-medium px-3 py-1 rounded-full border transition ${
                          fieldLogic === logic
                            ? 'border-transparent bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-800'
                            : 'border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}
                        onClick={() => setFieldLogic(logic)}
                      >
                        {logic}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </div>

      {/* Table section */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
        <Table
          data={customers}
          columns={columns}
          totalCount={customers.length}
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
