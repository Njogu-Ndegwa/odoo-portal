'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSalesToken } from '@/lib/odoo-auth'
import { getCustomerById, updateCustomer } from '@/lib/services/customer-service'

export default function CustomerEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    zip: '',
  })

  useEffect(() => {
    async function load() {
      const token = getSalesToken()
      if (!token || !id) return
      try {
        const result = await getCustomerById(id, token)
        const c = result.customer
        setCustomerName(c.name)
        setForm({
          name: c.name,
          email: c.email,
          phone: c.phone,
          street: c.street,
          city: c.city,
          zip: c.zip,
        })
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load customer')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

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

    const token = getSalesToken()
    if (!token) {
      setError('Session expired. Please log in again.')
      return
    }

    setSaving(true)
    try {
      await updateCustomer(
        id,
        {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          street: form.street.trim(),
          city: form.city.trim(),
          zip: form.zip.trim(),
        },
        token
      )
      router.push('/portal/customers')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update customer')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        <div className="text-gray-400 py-12 text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/portal" className="hover:text-violet-500">Portal</Link>
        <span className="mx-2">/</span>
        <Link href="/portal/customers" className="hover:text-violet-500">Customers</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-100 font-medium">Edit</span>
      </nav>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          Edit Customer
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
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </label>
                <input id="name" name="name" className="form-input w-full" type="text" value={form.name} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">
                  Email
                </label>
                <input id="email" name="email" className="form-input w-full" type="email" value={form.email} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="phone">
                  Phone
                </label>
                <input id="phone" name="phone" className="form-input w-full" type="text" value={form.phone} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="street">
                  Street
                </label>
                <input id="street" name="street" className="form-input w-full" type="text" value={form.street} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="city">
                  City
                </label>
                <input id="city" name="city" className="form-input w-full" type="text" value={form.city} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="zip">
                  ZIP Code
                </label>
                <input id="zip" name="zip" className="form-input w-full" type="text" value={form.zip} onChange={handleChange} />
              </div>
            </div>
          </div>
          <footer className="px-5 py-4 border-t border-gray-100 dark:border-gray-700/60">
            <div className="flex items-center justify-between">
              <Link
                href={`/portal/customers/${id}`}
                className="btn border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white ml-3"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </footer>
        </div>
      </form>
    </div>
  )
}
