'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useApolloClient } from '@apollo/client'
import {
  getServiceAccount,
  getMembers,
  addMember,
  updateMember,
  removeMember,
} from '@/lib/sa-api'
import { CUSTOMERS_QUERY } from '@/lib/portal/queries'
import type { CustomersListResponse, CustomersFilterInput, CustomerEntity } from '@/lib/portal/types'
import type {
  SADetail,
  SAMember,
  SARoleCode,
  SAMembershipState,
} from '@/lib/sa-types'
import Table, { type TableColumn } from '@/components/table/table'
import ComboboxSearch from '@/components/combobox-search'
import FeedbackModal from '@/components/feedback-modal'
import { useAlert } from '@/app/contexts/alertContext'

interface PersonOption {
  id: number
  name: string
  email: string | null
  phone: string | null
}

function mapCustomerToPerson(c: CustomerEntity): PersonOption {
  return { id: Number(c.id), name: c.name, email: c.email, phone: c.phone }
}

const DROPDOWN_PAGE_SIZE = 20

const roleBadge: Record<string, string> = {
  admin: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  staff: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  agent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
}

const memberStateBadge: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  suspended: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  revoked: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
}

export default function ServiceAccountMembersPage() {
  const params = useParams()
  const apolloClient = useApolloClient()
  const { alert } = useAlert()
  const saId = Number(params.id)

  const t = useTranslations('portal.serviceAccounts.detail')
  const tc = useTranslations('common')
  const tp = useTranslations('portal')
  const tsa = useTranslations('portal.serviceAccounts')

  const [sa, setSA] = useState<SADetail | null>(null)
  const [members, setMembers] = useState<SAMember[]>([])
  const [loading, setLoading] = useState(true)

  // Add member form
  const [selectedPerson, setSelectedPerson] = useState<PersonOption | null>(null)
  const [addRole, setAddRole] = useState<SARoleCode>('agent')
  const [roleSearch, setRoleSearch] = useState('')
  const [addingMember, setAddingMember] = useState(false)

  // Person search combobox state
  const [personSearch, setPersonSearch] = useState('')
  const [debouncedPersonSearch, setDebouncedPersonSearch] = useState('')
  const [personPage, setPersonPage] = useState(1)
  const [accumulatedPersons, setAccumulatedPersons] = useState<PersonOption[]>([])
  const [personsLoading, setPersonsLoading] = useState(false)
  const [personHasMore, setPersonHasMore] = useState(false)
  const [personDropdownOpen, setPersonDropdownOpen] = useState(false)
  const prevPersonSearchRef = useRef(debouncedPersonSearch)

  // Revoke
  const [revokeTarget, setRevokeTarget] = useState<SAMember | null>(null)
  const [revoking, setRevoking] = useState(false)

  const fetchSA = useCallback(async () => {
    try {
      const res = await getServiceAccount(saId)
      setSA(res.service_account)
    } catch {
      alert({ text: t('loadFailed'), type: 'error' })
    }
  }, [saId, alert, t])

  const fetchMembers = useCallback(async () => {
    try {
      const res = await getMembers(saId)
      setMembers(res.members ?? [])
    } catch { /* allow empty */ }
  }, [saId])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchSA(), fetchMembers()]).finally(() => setLoading(false))
  }, [fetchSA, fetchMembers])

  // Person search: debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPersonSearch(personSearch), 300)
    return () => clearTimeout(timer)
  }, [personSearch])

  useEffect(() => {
    if (prevPersonSearchRef.current !== debouncedPersonSearch) {
      setPersonPage(1)
      setAccumulatedPersons([])
      prevPersonSearchRef.current = debouncedPersonSearch
    }
  }, [debouncedPersonSearch])

  const handlePersonOpenChange = useCallback((open: boolean) => {
    setPersonDropdownOpen(open)
    if (!open) {
      setPersonPage(1)
      setAccumulatedPersons([])
    }
  }, [])

  useEffect(() => {
    if (!personDropdownOpen) return
    let cancelled = false
    const fetchData = async () => {
      setPersonsLoading(true)
      try {
        const filters: CustomersFilterInput = {
          page: personPage,
          limit: DROPDOWN_PAGE_SIZE,
        }
        if (debouncedPersonSearch.trim()) {
          filters.search = debouncedPersonSearch.trim()
        }
        const { data } = await apolloClient.query<CustomersListResponse>({
          query: CUSTOMERS_QUERY,
          variables: { filters },
          fetchPolicy: 'network-only',
        })
        if (cancelled) return
        const mapped = data.customers.data.map(mapCustomerToPerson)
        setAccumulatedPersons((prev) => personPage === 1 ? mapped : [...prev, ...mapped])
        setPersonHasMore(data.customers.pagination.hasNextPage)
      } catch {
        if (!cancelled) setPersonHasMore(false)
      } finally {
        if (!cancelled) setPersonsLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [personDropdownOpen, debouncedPersonSearch, personPage, apolloClient])

  const handlePersonLoadMore = useCallback(() => {
    if (!personsLoading && personHasMore) setPersonPage((p) => p + 1)
  }, [personsLoading, personHasMore])

  const personLoadingInitial = personsLoading && personPage === 1
  const personLoadingMore = personsLoading && personPage > 1

  async function handleAddMember() {
    if (!selectedPerson) return
    setAddingMember(true)
    try {
      await addMember(saId, { person_partner_id: selectedPerson.id, role_code: addRole })
      alert({ text: t('memberAdded'), type: 'success' })
      setSelectedPerson(null)
      setAddRole('agent')
      fetchMembers()
    } catch (e: unknown) {
      alert({ text: e instanceof Error ? e.message : t('memberAddFailed'), type: 'error' })
    } finally {
      setAddingMember(false)
    }
  }

  async function handleRevoke() {
    if (!revokeTarget) return
    setRevoking(true)
    try {
      await removeMember(saId, revokeTarget.id)
      alert({ text: t('membershipRevoked'), type: 'success' })
      setRevokeTarget(null)
      fetchMembers()
    } catch (e: unknown) {
      alert({ text: e instanceof Error ? e.message : t('revokeFailed'), type: 'error' })
    } finally {
      setRevoking(false)
    }
  }

  async function handleRoleChange(member: SAMember, newRole: SARoleCode) {
    try {
      await updateMember(saId, member.id, { role_code: newRole })
      fetchMembers()
    } catch (e: unknown) {
      alert({ text: e instanceof Error ? e.message : t('updateRoleFailed'), type: 'error' })
    }
  }

  async function handleStateChange(member: SAMember, newState: SAMembershipState) {
    try {
      await updateMember(saId, member.id, { membership_state: newState })
      fetchMembers()
    } catch (e: unknown) {
      alert({ text: e instanceof Error ? e.message : t('updateStateFailed'), type: 'error' })
    }
  }

  const columns: TableColumn<SAMember>[] = [
    {
      header: t('memberColumns.name'),
      accessor: (m) => m.person.name,
      cellRenderer: (_v: unknown, m: SAMember) => (
        <div className="font-medium text-gray-800 dark:text-gray-100">{m.person.name}</div>
      ),
    },
    {
      header: t('memberColumns.email'),
      accessor: (m) => m.person.email || '—',
      cellRenderer: (_v: unknown, m: SAMember) => (
        <span className="text-gray-500 dark:text-gray-400">{m.person.email || '—'}</span>
      ),
    },
    {
      header: t('memberColumns.phone'),
      accessor: (m) => m.person.phone || '—',
      cellRenderer: (_v: unknown, m: SAMember) => (
        <span className="text-gray-500 dark:text-gray-400">{m.person.phone || '—'}</span>
      ),
    },
    {
      header: t('memberColumns.role'),
      accessor: 'role_code',
      cellRenderer: (_v: unknown, m: SAMember) => (
        <select
          value={m.role_code}
          onChange={(e) => handleRoleChange(m, e.target.value as SARoleCode)}
          className={`text-xs font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer ${roleBadge[m.role_code] ?? roleBadge.agent}`}
        >
          <option value="admin">{tc('admin')}</option>
          <option value="staff">{tc('staff')}</option>
          <option value="agent">{tc('agent')}</option>
        </select>
      ),
    },
    {
      header: t('memberColumns.state'),
      accessor: 'membership_state',
      cellRenderer: (_v: unknown, m: SAMember) => (
        <select
          value={m.membership_state}
          onChange={(e) => handleStateChange(m, e.target.value as SAMembershipState)}
          className={`text-xs font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer ${memberStateBadge[m.membership_state] ?? memberStateBadge.active}`}
        >
          <option value="active">{tc('active')}</option>
          <option value="suspended">{t('suspended')}</option>
          <option value="revoked">{t('revoke')}</option>
        </select>
      ),
    },
  ]

  const memberActions = (m: SAMember) => (
    <button
      onClick={() => setRevokeTarget(m)}
      className="text-red-500 hover:text-red-600 text-xs font-medium"
    >
      {t('revoke')}
    </button>
  )

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        <div className="text-gray-400 py-12 text-center">{tc('loading')}</div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/portal" className="hover:text-violet-500">{tp('portal')}</Link>
        <span className="mx-2">/</span>
        <Link href="/portal/service-accounts" className="hover:text-violet-500">{tsa('title')}</Link>
        <span className="mx-2">/</span>
        <Link href={`/portal/service-accounts/${saId}`} className="hover:text-violet-500">{sa?.name ?? t('serviceAccount')}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-100 font-medium">{t('members')}</span>
      </nav>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          {t('members')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{sa?.name}</p>
      </div>

      {/* Add member form — always visible */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 mb-6">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">{t('addExistingMember')}</h2>
        </header>
        <div className="p-5">
          <div className="grid gap-5 md:grid-cols-3 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">{t('selectPerson')}</label>
              <ComboboxSearch<PersonOption>
                className="w-full"
                triggerLabel={selectedPerson ? selectedPerson.name : t('searchPerson')}
                triggerIcon={<Users className="w-4 h-4 shrink-0 text-gray-400 dark:text-gray-500" />}
                triggerClassName="form-input w-full text-left flex items-center gap-2 cursor-pointer [&>span]:flex-1 [&>span]:truncate [&>span]:min-w-0 [&>svg:last-child]:ml-auto [&>svg:last-child]:shrink-0"
                searchPlaceholder={t('searchPersonPlaceholder')}
                value={personSearch}
                onChange={setPersonSearch}
                items={accumulatedPersons}
                isLoading={personLoadingInitial}
                emptyMessage={t('noPersonsFound')}
                onSelect={(p) => setSelectedPerson(p)}
                onOpenChange={handlePersonOpenChange}
                align="left"
                dropdownClassName="w-full"
                renderItem={(p: PersonOption) => (
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-gray-800 dark:text-gray-100">{p.name}</span>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {p.email || t('noEmail')}
                      </div>
                    </div>
                  </div>
                )}
                onLoadMore={handlePersonLoadMore}
                hasMore={personHasMore}
                isLoadingMore={personLoadingMore}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('role')}</label>
              <ComboboxSearch<{ id: SARoleCode; label: string }>
                className="w-full"
                triggerLabel={addRole === 'admin' ? tc('admin') : addRole === 'staff' ? tc('staff') : tc('agent')}
                triggerClassName="form-input w-full text-left flex items-center gap-2 cursor-pointer [&>span]:flex-1 [&>span]:truncate [&>span]:min-w-0 [&>svg:last-child]:ml-auto [&>svg:last-child]:shrink-0"
                searchPlaceholder={t('role')}
                value={roleSearch}
                onChange={setRoleSearch}
                items={
                  [
                    { id: 'admin' as SARoleCode, label: tc('admin') },
                    { id: 'staff' as SARoleCode, label: tc('staff') },
                    { id: 'agent' as SARoleCode, label: tc('agent') },
                  ].filter((r) => !roleSearch || r.label.toLowerCase().includes(roleSearch.toLowerCase()))
                }
                isLoading={false}
                emptyMessage={tc('noResultsFound')}
                onSelect={(r) => { setAddRole(r.id); setRoleSearch('') }}
                align="left"
                dropdownClassName="w-full"
                renderItem={(r) => (
                  <span className={`font-medium ${r.id === addRole ? 'text-violet-600 dark:text-violet-400' : 'text-gray-800 dark:text-gray-100'}`}>
                    {r.label}
                  </span>
                )}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddMember}
                disabled={addingMember || !selectedPerson}
                className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingMember ? t('adding') : t('addMember')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Members table */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
        <Table
          data={members}
          columns={columns}
          totalCount={members.length}
          actions={memberActions}
          isLoading={loading}
          emptyMessage={t('noMembers')}
        />
      </div>

      <FeedbackModal
        isOpen={!!revokeTarget}
        setIsOpen={(open: boolean) => { if (!open) setRevokeTarget(null) }}
        title={t('revokeMembership')}
        content={t('revokeConfirm', { name: revokeTarget?.person.name ?? '' })}
        variant="danger"
        confirmButtonLabel={revoking ? t('revoking') : t('revoke')}
        onConfirm={handleRevoke}
        onCancel={() => setRevokeTarget(null)}
      />
    </div>
  )
}
