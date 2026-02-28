'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSalesToken, getSalesUser } from '@/lib/odoo-auth'
import { createCustomer } from '@/lib/services/customer-service'

export default function CustomerCreatePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.name.trim()) {
      setError('Name is required.')
      return
    }
    if (!form.email.trim() && !form.phone.trim()) {
      setError('At least one of email or phone is required.')
      return
    }

    const token = getSalesToken()
    if (!token) {
      setError('Session expired. Please log in again.')
      return
    }

    const user = getSalesUser()
    const companyId = user?.companyId

    setSaving(true)
    try {
      await createCustomer(
        {
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          mobile: form.mobile.trim() || undefined,
          street: form.street.trim() || undefined,
          city: form.city.trim() || undefined,
          zip: form.zip.trim() || undefined,
          is_company: isCompany,
          company_id: companyId,
        },
        token
      )
      router.push('/portal/customers')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create customer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/portal" className="hover:text-violet-500">Portal</Link>
        <span className="mx-2">/</span>
        <Link href="/portal/customers" className="hover:text-violet-500">Customers</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-100 font-medium">New</span>
      </nav>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          Create a Customer
        </h1>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Customer Details</h2>
          </header>
          <div className="p-5">
            {/* Customer type toggle */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Customer Type</label>
              <div className="flex">
                <button
                  type="button"
                  className={`btn rounded-r-none border ${!isCompany
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-800 border-transparent'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setIsCompany(false)}
                >
                  Individual
                </button>
                <button
                  type="button"
                  className={`btn rounded-l-none border -ml-px ${isCompany
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-800 border-transparent'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setIsCompany(true)}
                >
                  Company
                </button>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">
                  {isCompany ? 'Company Name' : 'Full Name'} <span className="text-red-500">*</span>
                </label>
                <input id="name" name="name" className="form-input w-full" type="text" value={form.name} onChange={handleChange} required placeholder={isCompany ? 'e.g. Acme Solar Ltd' : 'e.g. John Doe'} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">
                  Email
                </label>
                <input id="email" name="email" className="form-input w-full" type="email" value={form.email} onChange={handleChange} placeholder={isCompany ? 'e.g. info@company.com' : 'e.g. john@example.com'} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="phone">
                  Phone
                </label>
                <input id="phone" name="phone" className="form-input w-full" type="text" value={form.phone} onChange={handleChange} placeholder="e.g. +254 700 000 000" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="mobile">
                  Mobile
                </label>
                <input id="mobile" name="mobile" className="form-input w-full" type="text" value={form.mobile} onChange={handleChange} placeholder="e.g. +254 700 000 001" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="street">
                  Street
                </label>
                <input id="street" name="street" className="form-input w-full" type="text" value={form.street} onChange={handleChange} placeholder="e.g. 123 Main Street" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="city">
                  City
                </label>
                <input id="city" name="city" className="form-input w-full" type="text" value={form.city} onChange={handleChange} placeholder="e.g. Nairobi" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="zip">
                  ZIP Code
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
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white ml-3"
              >
                {saving ? 'Creating...' : 'Create Customer'}
              </button>
            </div>
          </footer>
        </div>
      </form>
    </div>
  )
}
