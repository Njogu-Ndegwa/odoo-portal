'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { getSalesToken } from '@/lib/odoo-auth'
import { getCustomerById, type ExistingCustomer } from '@/lib/services/customer-service'

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)
  const [customer, setCustomer] = useState<ExistingCustomer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const token = getSalesToken()
      if (!token || !id) return
      setLoading(true)
      try {
        const result = await getCustomerById(id, token)
        setCustomer(result.customer)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load customer')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        <div className="text-gray-400 py-12 text-center">Loading...</div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/portal" className="hover:text-violet-500">Portal</Link>
          <span className="mx-2">/</span>
          <Link href="/portal/customers" className="hover:text-violet-500">Customers</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 dark:text-gray-100 font-medium">Error</span>
        </nav>
        <div className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error || 'Customer not found.'}
        </div>
      </div>
    )
  }

  const fields = [
    { label: 'Email', value: customer.email },
    { label: 'Phone', value: customer.phone },
    { label: 'Mobile', value: customer.mobile },
    { label: 'Street', value: customer.street },
    { label: 'City', value: customer.city },
    { label: 'ZIP', value: customer.zip },
    { label: 'Company', value: customer.companyName },
    { label: 'Type', value: customer.isCompany ? 'Company' : 'Individual' },
    { label: 'Created', value: customer.createdAt ? new Date(customer.createdAt).toLocaleString() : '' },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/portal" className="hover:text-violet-500">Portal</Link>
        <span className="mx-2">/</span>
        <Link href="/portal/customers" className="hover:text-violet-500">Customers</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-100 font-medium">{customer.name}</span>
      </nav>

      {/* Header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-5">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            {customer.name}
          </h1>
        </div>
        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          <Link
            href={`/portal/customers/${customer.id}/edit`}
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white flex items-center justify-center"
          >
            <Pencil className="w-4 h-4 mr-2" />
            <span>Edit</span>
          </Link>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Contact Information</h2>
        </header>
        <div className="p-5">
          <div className="grid gap-5 md:grid-cols-2">
            {fields.map(({ label, value }) => (
              <div key={label}>
                <label className="block text-sm font-medium mb-1 text-gray-500 dark:text-gray-400">
                  {label}
                </label>
                <div className="text-sm text-gray-800 dark:text-gray-100">
                  {value || '-'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
