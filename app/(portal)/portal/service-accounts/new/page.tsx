'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useSA } from '@/lib/sa-context'
import { createServiceAccount } from '@/lib/sa-api'
import type { SAAccountClass, SAState } from '@/lib/sa-types'
import { useAlert } from '@/app/contexts/alertContext'

export default function ServiceAccountCreatePage() {
  const router = useRouter()
  const { isAdmin, currentSA } = useSA()
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
    partner_id: '',
    state: 'active' as SAState,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name.trim()) {
      alert({ text: t('nameValidation'), type: 'error' })
      return
    }
    if (!form.partner_id.trim()) {
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
        partner_id: Number(form.partner_id),
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

  if (!isAdmin) {
    router.push('/portal')
    return null
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
                <label className="block text-sm font-medium mb-1" htmlFor="partner_id">
                  {t('partnerIdRequired')}
                </label>
                <input
                  id="partner_id"
                  name="partner_id"
                  className="form-input w-full"
                  type="number"
                  value={form.partner_id}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 11360"
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
