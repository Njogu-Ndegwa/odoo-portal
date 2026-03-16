'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSA } from '@/lib/sa-context'
import { createServiceAccount } from '@/lib/sa-api'
import type { SAAccountClass, SAState } from '@/lib/sa-types'
import { useAlert } from '@/app/contexts/alertContext'

export default function ServiceAccountCreatePage() {
  const router = useRouter()
  const { isAdmin, currentSA } = useSA()
  const { alert } = useAlert()

  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    account_class: 'outlet' as SAAccountClass,
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
      alert({ text: 'Name is required.', type: 'error' })
      return
    }
    if (!form.partner_id.trim()) {
      alert({ text: 'Partner ID is required.', type: 'error' })
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

      alert({ text: 'Service account created successfully', type: 'success' })
      router.push('/portal/service-accounts')
    } catch (err: unknown) {
      alert({ text: err instanceof Error ? err.message : 'Failed to create service account', type: 'error' })
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
        <Link href="/portal" className="hover:text-violet-500">Portal</Link>
        <span className="mx-2">/</span>
        <Link href="/portal/service-accounts" className="hover:text-violet-500">Service Accounts</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-100 font-medium">New</span>
      </nav>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          Create a Service Account
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Account Details</h2>
          </header>
          <div className="p-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">
                  Name <span className="text-red-500">*</span>
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
                  Account Class
                </label>
                <select
                  id="account_class"
                  name="account_class"
                  className="form-select w-full"
                  value={form.account_class}
                  onChange={handleChange}
                >
                  <option value="outlet">Outlet</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="partner_id">
                  Partner ID <span className="text-red-500">*</span>
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
                  Parent ID
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
                  Account Code
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
                  State
                </label>
                <select
                  id="state"
                  name="state"
                  className="form-select w-full"
                  value={form.state}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white ml-3"
              >
                {saving ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </footer>
        </div>
      </form>
    </div>
  )
}
