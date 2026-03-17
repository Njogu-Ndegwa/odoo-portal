'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { getSalesUser } from '@/lib/odoo-auth'
import { CREATE_CUSTOMER } from '@/lib/portal/mutations'
import type { CreateCustomerData } from '@/lib/portal/types'
import { useAlert } from '@/app/contexts/alertContext'

export default function CustomerCreatePage() {
  const router = useRouter()
  const { alert } = useAlert()

  const t = useTranslations('portal.customers.new')
  const tc = useTranslations('common')
  const tp = useTranslations('portal')
  const tpc = useTranslations('portal.customers')

  const [isCompany, setIsCompany] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    mobile: '',
    street: '',
    city: '',
    zip: '',
  })

  const [createCustomer, { loading: saving }] = useMutation<CreateCustomerData>(CREATE_CUSTOMER)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name.trim()) {
      alert({ text: t('nameRequired'), type: 'error' })
      return
    }
    if (!form.email.trim() && !form.phone.trim()) {
      alert({ text: t('emailOrPhoneRequired'), type: 'error' })
      return
    }

    const user = getSalesUser()

    try {
      const { data } = await createCustomer({
        variables: {
          input: {
            name: form.name.trim(),
            email: form.email.trim() || undefined,
            phone: form.phone.trim() || undefined,
            mobile: form.mobile.trim() || undefined,
            street: form.street.trim() || undefined,
            city: form.city.trim() || undefined,
            zip: form.zip.trim() || undefined,
            isCompany,
            companyId: user?.companyId,
          },
        },
      })

      if (data?.createCustomer.success) {
        alert({ text: t('createdSuccess'), type: 'success' })
        router.push('/portal/customers')
      } else {
        alert({ text: data?.createCustomer.message || t('createFailed'), type: 'error' })
      }
    } catch (err: unknown) {
      alert({ text: err instanceof Error ? err.message : t('createFailed'), type: 'error' })
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/portal" className="hover:text-violet-500">{tp('portal')}</Link>
        <span className="mx-2">/</span>
        <Link href="/portal/customers" className="hover:text-violet-500">{tpc('title')}</Link>
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
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">{tc('customerDetails')}</h2>
          </header>
          <div className="p-5">
            {/* Customer type toggle */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">{tc('customerType')}</label>
              <div className="flex">
                <button
                  type="button"
                  className={`btn rounded-r-none border ${!isCompany
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-800 border-transparent'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setIsCompany(false)}
                >
                  {tc('individual')}
                </button>
                <button
                  type="button"
                  className={`btn rounded-l-none border -ml-px ${isCompany
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-800 border-transparent'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setIsCompany(true)}
                >
                  {tc('company')}
                </button>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">
                  {isCompany ? tc('companyName') : tc('fullName')} <span className="text-red-500">*</span>
                </label>
                <input id="name" name="name" className="form-input w-full" type="text" value={form.name} onChange={handleChange} required placeholder={isCompany ? 'e.g. Acme Solar Ltd' : 'e.g. John Doe'} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">
                  {tc('email')}
                </label>
                <input id="email" name="email" className="form-input w-full" type="email" value={form.email} onChange={handleChange} placeholder={isCompany ? 'e.g. info@company.com' : 'e.g. john@example.com'} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="phone">
                  {tc('phone')}
                </label>
                <input id="phone" name="phone" className="form-input w-full" type="text" value={form.phone} onChange={handleChange} placeholder="e.g. +254 700 000 000" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="mobile">
                  {tc('mobile')}
                </label>
                <input id="mobile" name="mobile" className="form-input w-full" type="text" value={form.mobile} onChange={handleChange} placeholder="e.g. +254 700 000 001" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="street">
                  {tc('street')}
                </label>
                <input id="street" name="street" className="form-input w-full" type="text" value={form.street} onChange={handleChange} placeholder="e.g. 123 Main Street" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="city">
                  {tc('city')}
                </label>
                <input id="city" name="city" className="form-input w-full" type="text" value={form.city} onChange={handleChange} placeholder="e.g. Nairobi" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="zip">
                  {tc('zipCode')}
                </label>
                <input id="zip" name="zip" className="form-input w-full" type="text" value={form.zip} onChange={handleChange} placeholder="e.g. 00100" />
              </div>
            </div>
          </div>
          <footer className="px-5 py-4 border-t border-gray-100 dark:border-gray-700/60">
            <div className="flex items-center justify-between">
              <Link
                href="/portal/customers"
                className="btn border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
              >
                {tc('cancel')}
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white ml-3"
              >
                {saving ? tc('creating') : t('createCustomer')}
              </button>
            </div>
          </footer>
        </div>
      </form>
    </div>
  )
}
