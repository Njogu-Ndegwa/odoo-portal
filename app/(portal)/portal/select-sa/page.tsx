'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/lib/auth-context'
import { useSA } from '@/lib/sa-context'
import { fetchMyServiceAccounts } from '@/lib/sa-api'
import { getSalesToken, getSelectedSAId } from '@/lib/odoo-auth'
import type { ServiceAccount } from '@/lib/sa-types'
import Logo from '@/components/ui/logo'

const classBadge: Record<string, string> = {
  outlet: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
}

type ErrorKind = 'noAccounts' | 'loadFailed' | null

export default function SelectSAPage() {
  const router = useRouter()
  const t = useTranslations('portal.selectAccount')
  const tc = useTranslations('common')
  const { user, pendingSAs, signOut } = useAuth()
  const { selectSA, setServiceAccounts } = useSA()
  const [accounts, setAccounts] = useState<ServiceAccount[]>(pendingSAs)
  const [loading, setLoading] = useState(pendingSAs.length === 0)
  const [errorKind, setErrorKind] = useState<ErrorKind>(null)

  const roleBadge: Record<string, { label: string; color: string }> = {
    admin: { label: tc('admin'), color: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300' },
    staff: { label: tc('staff'), color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' },
    agent: { label: tc('agent'), color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' },
  }

  const lastSAId = getSelectedSAId()

  function loadAccounts() {
    const token = getSalesToken()
    if (!token) {
      router.push('/signin')
      return
    }

    setLoading(true)
    setErrorKind(null)
    fetchMyServiceAccounts(token)
      .then((res) => {
        const sas = res.service_accounts ?? []
        setAccounts(sas)
        setServiceAccounts(sas)
        if (sas.length === 0) setErrorKind('noAccounts')
        if (sas.length === 1 && res.auto_selected) {
          handleSelect(sas[0])
        }
      })
      .catch(() => setErrorKind('loadFailed'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (pendingSAs.length > 0) {
      setAccounts(pendingSAs)
      setServiceAccounts(pendingSAs)
      setLoading(false)
      return
    }
    loadAccounts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSelect(sa: ServiceAccount) {
    selectSA(sa)
    router.push('/portal')
  }

  const hasError = errorKind !== null

  return (
    <div className="flex items-center justify-center min-h-full px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        {/* Header — only show when there are accounts to pick */}
        {!hasError && !loading && (
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {t('title')}
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t('welcome', { name: user?.name ?? '' })}
            </p>
          </div>
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-violet-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error / No-access state */}
        {hasError && !loading && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800 shadow-sm p-8 sm:p-10 text-center max-w-md mx-auto">
            {/* Icon */}
            <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 mb-5">
              <svg className="w-8 h-8 text-red-500 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0 0 12 3.714Zm0 10.036h.008v.008H12v-.008Z" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {t('noAccessTitle')}
            </h2>

            {/* Description */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {t('noAccessDescription')}
            </p>

            {/* Hint */}
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
              {t('noAccessHint')}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => loadAccounts()}
                className="btn w-full sm:w-auto border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300"
              >
                <svg className="w-4 h-4 shrink-0 mr-2 opacity-70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
                {t('tryAgain')}
              </button>
              <button
                onClick={signOut}
                className="btn w-full sm:w-auto bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
              >
                <svg className="w-4 h-4 shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
                {t('signOut')}
              </button>
            </div>
          </div>
        )}

        {/* Account cards */}
        {!loading && !hasError && (
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
