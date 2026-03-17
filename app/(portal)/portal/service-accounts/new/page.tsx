'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useApolloClient } from '@apollo/client'
import { useSA } from '@/lib/sa-context'
import { createServiceAccount } from '@/lib/sa-api'
import { CUSTOMERS_QUERY } from '@/lib/portal/queries'
import type { CustomersListResponse, CustomersFilterInput, CustomerEntity } from '@/lib/portal/types'
import type { SAAccountClass, SAState } from '@/lib/sa-types'
import ComboboxSearch from '@/components/combobox-search'
import { useAlert } from '@/app/contexts/alertContext'

interface PartnerOption {
  id: number
  name: string
  email: string | null
  phone: string | null
}

function mapCustomerToPartner(c: CustomerEntity): PartnerOption {
  return { id: Number(c.id), name: c.name, email: c.email, phone: c.phone }
}

const DROPDOWN_PAGE_SIZE = 20

export default function ServiceAccountCreatePage() {
  const router = useRouter()
  const apolloClient = useApolloClient()
  const { currentSA } = useSA()
  const { alert } = useAlert()

  const t = useTranslations('portal.serviceAccounts.new')
  const tc = useTranslations('common')
  const tp = useTranslations('portal')
  const tsa = useTranslations('portal.serviceAccounts')

  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    account_class: 'EXTC' as SAAccountClass,
    account_code: '',
    parent_id: '',
    state: 'active' as SAState,
  })

  // Partner (customer) search state
  const [selectedPartner, setSelectedPartner] = useState<PartnerOption | null>(null)
  const [partnerSearch, setPartnerSearch] = useState('')
  const [debouncedPartnerSearch, setDebouncedPartnerSearch] = useState('')
  const [partnerPage, setPartnerPage] = useState(1)
  const [accumulatedPartners, setAccumulatedPartners] = useState<PartnerOption[]>([])
  const [partnersLoading, setPartnersLoading] = useState(false)
  const [partnerHasMore, setPartnerHasMore] = useState(false)
  const [partnerDropdownOpen, setPartnerDropdownOpen] = useState(false)
  const prevPartnerSearchRef = useRef(debouncedPartnerSearch)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Partner search: debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPartnerSearch(partnerSearch), 300)
    return () => clearTimeout(timer)
  }, [partnerSearch])

  useEffect(() => {
    if (prevPartnerSearchRef.current !== debouncedPartnerSearch) {
      setPartnerPage(1)
      setAccumulatedPartners([])
      prevPartnerSearchRef.current = debouncedPartnerSearch
    }
  }, [debouncedPartnerSearch])

  const handlePartnerOpenChange = useCallback((open: boolean) => {
    setPartnerDropdownOpen(open)
    if (!open) {
      setPartnerPage(1)
      setAccumulatedPartners([])
    }
  }, [])

  useEffect(() => {
    if (!partnerDropdownOpen) return
    let cancelled = false
    const fetchData = async () => {
      setPartnersLoading(true)
      try {
        const filters: CustomersFilterInput = {
          page: partnerPage,
          limit: DROPDOWN_PAGE_SIZE,
        }
        if (debouncedPartnerSearch.trim()) {
          filters.search = debouncedPartnerSearch.trim()
        }
        const { data } = await apolloClient.query<CustomersListResponse>({
          query: CUSTOMERS_QUERY,
          variables: { filters },
          fetchPolicy: 'network-only',
        })
        if (cancelled) return
        const mapped = data.customers.data.map(mapCustomerToPartner)
        setAccumulatedPartners((prev) => partnerPage === 1 ? mapped : [...prev, ...mapped])
        setPartnerHasMore(data.customers.pagination.hasNextPage)
      } catch {
        if (!cancelled) setPartnerHasMore(false)
      } finally {
        if (!cancelled) setPartnersLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [partnerDropdownOpen, debouncedPartnerSearch, partnerPage, apolloClient])

  const handlePartnerLoadMore = useCallback(() => {
    if (!partnersLoading && partnerHasMore) setPartnerPage((p) => p + 1)
  }, [partnersLoading, partnerHasMore])

  const partnerLoadingInitial = partnersLoading && partnerPage === 1
  const partnerLoadingMore = partnersLoading && partnerPage > 1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name.trim()) {
      alert({ text: t('nameValidation'), type: 'error' })
      return
    }
    if (!selectedPartner) {
      alert({ text: t('partnerValidation'), type: 'error' })
      return
    }

    setSaving(true)
    try {
      const parentId = form.parent_id.trim()
        ? Number(form.parent_id)
        : currentSA?.id ?? 0

      await createServiceAccount({
        name: form.name.trim(),
        account_class: form.account_class,
        account_code: form.account_code.trim() || undefined,
        parent_id: parentId,
        partner_id: selectedPartner.id,
        state: form.state,
      })

      alert({ text: t('createdSuccess'), type: 'success' })
      router.push('/portal/service-accounts')
    } catch (err: unknown) {
      alert({ text: err instanceof Error ? err.message : t('createFailed'), type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/portal" className="hover:text-violet-500">{tp('portal')}</Link>
        <span className="mx-2">/</span>
        <Link href="/portal/service-accounts" className="hover:text-violet-500">{tsa('title')}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-100 font-medium">{tc('new')}</span>
      </nav>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          {t('title')}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">{t('accountDetails')}</h2>
          </header>
          <div className="p-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">
                  {t('nameRequired')}
                </label>
                <input
                  id="name"
                  name="name"
                  className="form-input w-full"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Nairobi Branch"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="account_class">
                  {t('class')}
                </label>
                <select
                  id="account_class"
                  name="account_class"
                  className="form-select w-full"
                  value={form.account_class}
                  onChange={handleChange}
                >
                  <option value="OVAC">{t('ovac')}</option>
                  <option value="EXTC">{t('extc')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('partnerIdRequired')}
                </label>
                <ComboboxSearch<PartnerOption>
                  className="w-full"
                  triggerLabel={selectedPartner ? selectedPartner.name : t('selectPartner')}
                  triggerIcon={<Users className="w-4 h-4 shrink-0 text-gray-400 dark:text-gray-500" />}
                  triggerClassName="form-input w-full text-left flex items-center gap-2 cursor-pointer [&>span]:flex-1 [&>span]:truncate [&>span]:min-w-0 [&>svg:last-child]:ml-auto [&>svg:last-child]:shrink-0"
                  searchPlaceholder={t('searchPartnerPlaceholder')}
                  value={partnerSearch}
                  onChange={setPartnerSearch}
                  items={accumulatedPartners}
                  isLoading={partnerLoadingInitial}
                  emptyMessage={tc('noResultsFound')}
                  onSelect={(p) => setSelectedPartner(p)}
                  onOpenChange={handlePartnerOpenChange}
                  align="left"
                  dropdownClassName="w-full"
                  renderItem={(p: PartnerOption) => (
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-800 dark:text-gray-100">{p.name}</span>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {p.email || t('noEmail')}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                        ID: {p.id}
                      </span>
                    </div>
                  )}
                  onLoadMore={handlePartnerLoadMore}
                  hasMore={partnerHasMore}
                  isLoadingMore={partnerLoadingMore}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="parent_id">
                  {t('parentId')}
                </label>
                <input
                  id="parent_id"
                  name="parent_id"
                  className="form-input w-full"
                  type="number"
                  value={form.parent_id}
                  onChange={handleChange}
                  placeholder={currentSA ? `Default: ${currentSA.id} (${currentSA.name})` : 'e.g. 1'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="account_code">
                  {t('accountCode')}
                </label>
                <input
                  id="account_code"
                  name="account_code"
                  className="form-input w-full"
                  type="text"
                  value={form.account_code}
                  onChange={handleChange}
                  placeholder="e.g. NBO-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="state">
                  {t('state')}
                </label>
                <select
                  id="state"
                  name="state"
                  className="form-select w-full"
                  value={form.state}
                  onChange={handleChange}
                >
                  <option value="active">{tc('active')}</option>
                  <option value="inactive">{tc('inactive')}</option>
                </select>
              </div>
            </div>
          </div>
          <footer className="px-5 py-4 border-t border-gray-100 dark:border-gray-700/60">
            <div className="flex items-center justify-between">
              <Link
                href="/portal/service-accounts"
                className="btn border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
              >
                {tc('cancel')}
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white ml-3"
              >
                {saving ? tc('creating') : t('createAccount')}
              </button>
            </div>
          </footer>
        </div>
      </form>
    </div>
  )
}
