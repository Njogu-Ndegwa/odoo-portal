'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { PRODUCT_UNIT_QUERY } from '@/lib/portal/queries'
import type { ProductUnitDetailResponse } from '@/lib/portal/types'

export default function ProductDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { data, loading, error } = useQuery<ProductUnitDetailResponse>(PRODUCT_UNIT_QUERY, {
    variables: { id },
    skip: !id,
  })

  const product = data?.productUnit

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        <div className="text-gray-400 py-12 text-center">Loading...</div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/portal" className="hover:text-violet-500">Portal</Link>
          <span className="mx-2">/</span>
          <Link href="/portal/products" className="hover:text-violet-500">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 dark:text-gray-100 font-medium">Error</span>
        </nav>
        <div className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error?.message || 'Product not found.'}
        </div>
      </div>
    )
  }

  const fields = [
    { label: 'SKU', value: product.sku },
    { label: 'Price', value: `${product.currencyName || ''} ${product.listPrice?.toLocaleString() ?? '-'}` },
    { label: 'Type', value: product.type },
    { label: 'PU Category', value: product.puCategory },
    { label: 'PU Metric', value: product.puMetric },
    { label: 'Service Type', value: product.serviceType },
    { label: 'Contract Type', value: product.contractType },
    { label: 'Product Category', value: product.categoryName },
    { label: 'Recurring', value: product.recurringInvoice ? 'Yes' : 'No' },
    { label: 'Available for Sale', value: product.saleOk ? 'Yes' : 'No' },
    { label: 'Company', value: product.companyName },
    { label: 'Created', value: product.createdAt ? new Date(product.createdAt).toLocaleString() : '' },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/portal" className="hover:text-violet-500">Portal</Link>
        <span className="mx-2">/</span>
        <Link href="/portal/products" className="hover:text-violet-500">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-100 font-medium">{product.name}</span>
      </nav>

      {/* Header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-5">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            {product.name}
          </h1>
          {product.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{product.description}</p>
          )}
        </div>
        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          <Link
            href={`/portal/products/${product.id}/edit`}
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
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Product Information</h2>
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
        {product.descriptionSale && (
          <>
            <header className="px-5 py-4 border-t border-b border-gray-100 dark:border-gray-700/60">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">Sales Description</h2>
            </header>
            <div className="p-5">
              <p className="text-sm text-gray-800 dark:text-gray-100">{product.descriptionSale}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
