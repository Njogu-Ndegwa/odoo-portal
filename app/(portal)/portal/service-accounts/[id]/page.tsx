'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useSA } from '@/lib/sa-context'
import { getServiceAccount, updateServiceAccount } from '@/lib/sa-api'
import type { SADetail } from '@/lib/sa-types'
import { useAlert } from '@/app/contexts/alertContext'

export default function ServiceAccountDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAdmin } = useSA()
  const { alert } = useAlert()
  const saId = Number(params.id)

  const t = useTranslations('portal.serviceAccounts.detail')
  const tc = useTranslations('common')
  const tp = useTranslations('portal')
  const tsa = useTranslations('portal.serviceAccounts')

  const [sa, setSA] = useState<SADetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [editName, setEditName] = useState('')
  const [editState, setEditState] = useState<'active' | 'inactive'>('active')
  const [editNote, setEditNote] = useState('')

  const fetchSA = useCallback(async () => {
    try {
      const res = await getServiceAccount(saId)
      setSA(res.service_account)
      setEditName(res.service_account.name)
      setEditState(res.service_account.state)
      setEditNote(res.service_account.note ?? '')
    } catch {
      alert({ text: t('loadFailed'), type: 'error' })
    }
  }, [saId, alert, t])

  useEffect(() => {
    setLoading(true)
    fetchSA().finally(() => setLoading(false))
  }, [fetchSA])

  useEffect(() => {
    if (!isAdmin) router.push('/portal')
  }, [isAdmin, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editName.trim()) return
    setSaving(true)
    try {
      await updateServiceAccount(saId, { name: editName, state: editState, note: editNote || undefined })
      alert({ text: t('accountUpdated'), type: 'success' })
      fetchSA()
    } catch (e: unknown) {
      alert({ text: e instanceof Error ? e.message : t('updateFailed'), type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (!isAdmin) return null

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
        <span className="text-gray-800 dark:text-gray-100 font-medium">{sa?.name ?? t('serviceAccount')}</span>
      </nav>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          {sa?.name ?? t('serviceAccount')}
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
                <label className="block text-sm font-medium mb-1" htmlFor="edit-name">
                  {t('nameRequired')}
                </label>
                <input
                  id="edit-name"
                  className="form-input w-full"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="edit-class">
                  {t('class')}
                </label>
                <input
                  id="edit-class"
                  className="form-input w-full"
                  type="text"
                  value={sa?.account_class || ''}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="edit-code">
                  {t('code')}
                </label>
                <input
                  id="edit-code"
                  className="form-input w-full"
                  type="text"
                  value={sa?.account_code || ''}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="edit-state">
                  {t('state')}
                </label>
                <select
                  id="edit-state"
                  className="form-select w-full"
                  value={editState}
                  onChange={(e) => setEditState(e.target.value as 'active' | 'inactive')}
                >
                  <option value="active">{tc('active')}</option>
                  <option value="inactive">{tc('inactive')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="edit-parent">
                  {t('parent')}
                </label>
                <input
                  id="edit-parent"
                  className="form-input w-full"
                  type="text"
                  value={sa?.parent_name || '—'}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="edit-partner">
                  {t('partner')}
                </label>
                <input
                  id="edit-partner"
                  className="form-input w-full"
                  type="text"
                  value={sa?.partner_name || '—'}
                  disabled
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" htmlFor="edit-note">
                  {t('note')}
                </label>
                <textarea
                  id="edit-note"
                  className="form-textarea w-full"
                  rows={3}
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                />
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
                {saving ? tc('saving') : t('saveChanges')}
              </button>
            </div>
          </footer>
        </div>
      </form>
    </div>
  )
}
