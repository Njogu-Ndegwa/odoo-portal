'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/lib/auth-context'
import { useSA } from '@/lib/sa-context'
import { fetchMyServiceAccounts } from '@/lib/sa-api'
import { getSalesToken, getSelectedSAId } from '@/lib/odoo-auth'
import type { ServiceAccount } from '@/lib/sa-types'

const classBadge: Record<string, string> = {
  outlet: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
}

export default function SelectSAPage() {
  const router = useRouter()
  const t = useTranslations('portal.selectAccount')
  const tc = useTranslations('common')
  const { user, pendingSAs } = useAuth()
  const { selectSA, setServiceAccounts } = useSA()
  const [accounts, setAccounts] = useState<ServiceAccount[]>(pendingSAs)
  const [loading, setLoading] = useState(pendingSAs.length === 0)
  const [error, setError] = useState<string | null>(null)

  const roleBadge: Record<string, { label: string; color: string }> = {
    admin: { label: tc('admin'), color: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300' },
    staff: { label: tc('staff'), color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' },
    agent: { label: tc('agent'), color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' },
  }

  const lastSAId = getSelectedSAId()

  useEffect(() => {
    if (pendingSAs.length > 0) {
      setAccounts(pendingSAs)
      setServiceAccounts(pendingSAs)
      setLoading(false)
      return
    }

    const token = getSalesToken()
    if (!token) {
      router.push('/signin')
      return
    }

    setLoading(true)
    fetchMyServiceAccounts(token)
      .then((res) => {
        const sas = res.service_accounts ?? []
        setAccounts(sas)
        setServiceAccounts(sas)
        if (sas.length === 0) setError(t('noAccounts'))
        if (sas.length === 1 && res.auto_selected) {
          handleSelect(sas[0])
        }
      })
      .catch(() => setError(t('loadFailed')))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSelect(sa: ServiceAccount) {
    selectSA(sa)
    router.push('/portal')
  }

  return (
    <div className="flex items-center justify-center min-h-full px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {t('title')}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t('welcome', { name: user?.name ?? '' })}
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-violet-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-4 sm:grid-cols-2">
            {accounts.map((sa) => {
              const isLast = lastSAId === sa.id
              const role = roleBadge[sa.my_role] ?? roleBadge.agent
              const cls = classBadge[sa.account_class] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'

              return (
                <button
                  key={sa.id}
                  onClick={() => handleSelect(sa)}
                  className={`group relative w-full text-left rounded-xl border p-5 transition-all duration-150
                    ${isLast
                      ? 'border-violet-400 dark:border-violet-500 ring-2 ring-violet-200 dark:ring-violet-500/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600'}
                    bg-white dark:bg-gray-800 hover:shadow-md`}
                >
                  {isLast && (
                    <span className="absolute -top-2.5 right-3 text-[11px] font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
                      {t('lastUsed')}
                    </span>
                  )}
                  <div className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {sa.name}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${role.color}`}>
                      {role.label}
                    </span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${cls}`}>
                      {sa.account_class}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
