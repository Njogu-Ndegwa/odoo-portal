'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client'
import Link from 'next/link'
import { PRODUCT_UNIT_QUERY } from '@/lib/portal/queries'
import { UPDATE_PRODUCT_UNIT } from '@/lib/portal/mutations'
import type { ProductUnitDetailResponse, UpdateProductUnitData } from '@/lib/portal/types'
import { useAlert } from '@/app/contexts/alertContext'

const puCategories = ['physical', 'service', 'contract', 'digital'] as const
const puMetrics = ['piece', 'duration', 'count', 'energy', 'distance']
const serviceTypes = ['access', 'gage']
const contractTypes = ['privilege', 'warranty', 'rental', 'maintenance', 'asset_assignment']

type PuCategory = typeof puCategories[number] | ''

const categoryHints: Record<string, string> = {
  physical: 'Tangible assets like batteries, vehicles, chargers, and accessories.',
  service: 'Operational value like swap services, maintenance, or subscriptions.',
  contract: 'Entitlements and obligations like deposits, warranties, or rental rights.',
  digital: 'Access, data, and software-defined capabilities (reserved for future use).',
}

const categoryDefaults: Record<string, { type: string; pu_metric: string; recurring_invoice: boolean }> = {
  physical: { type: 'product', pu_metric: 'piece', recurring_invoice: false },
  service: { type: 'service', pu_metric: 'duration', recurring_invoice: true },
  contract: { type: 'service', pu_metric: 'duration', recurring_invoice: true },
  digital: { type: 'service', pu_metric: 'count', recurring_invoice: false },
}

export default function ProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { alert } = useAlert()
  const [form, setForm] = useState({
    name: '',
    listPrice: '',
    type: 'service',
    puCategory: '' as PuCategory,
    puMetric: '',
    serviceType: '',
    contractType: '',
    sku: '',
    description: '',
    descriptionSale: '',
    category: '',
    recurringInvoice: false,
    saleOk: true,
    externalImageUrl: '',
  })

  const { data, loading: fetching } = useQuery<ProductUnitDetailResponse>(PRODUCT_UNIT_QUERY, {
    variables: { id },
    skip: !id,
  })

  const [updateProductUnit, { loading: saving }] = useMutation<UpdateProductUnitData>(UPDATE_PRODUCT_UNIT)

  useEffect(() => {
    if (data?.productUnit) {
      const p = data.productUnit
      setForm({
        name: p.name || '',
        listPrice: String(p.listPrice ?? ''),
        type: p.type || 'service',
        puCategory: (p.puCategory || '') as PuCategory,
        puMetric: p.puMetric || '',
        serviceType: p.serviceType || '',
        contractType: p.contractType || '',
        sku: p.sku || '',
        description: p.description || '',
        descriptionSale: p.descriptionSale || '',
        category: p.categoryName || '',
        recurringInvoice: p.recurringInvoice ?? false,
        saleOk: p.saleOk ?? true,
        externalImageUrl: p.imageUrl || '',
      })
    }
  }, [data])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cat = e.target.value as PuCategory
    const defaults = cat ? categoryDefaults[cat] : { type: 'service', pu_metric: '', recurring_invoice: false }
    setForm((prev) => ({
      ...prev,
      puCategory: cat,
      type: defaults.type,
      puMetric: defaults.pu_metric,
      recurringInvoice: defaults.recurring_invoice,
      serviceType: cat === 'service' ? prev.serviceType : '',
      contractType: cat === 'contract' ? prev.contractType : '',
    }))
  }

  const handleServiceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setForm((prev) => ({
      ...prev,
      serviceType: val,
      puMetric: val === 'gage' ? 'count' : 'duration',
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name.trim()) {
      alert({ text: 'Product name is required.', type: 'error' })
      return
    }

    try {
      const { data: result } = await updateProductUnit({
        variables: {
          id,
          input: {
            name: form.name.trim(),
            listPrice: Number(form.listPrice),
            type: form.type || undefined,
            puCategory: form.puCategory || undefined,
            puMetric: form.puMetric || undefined,
            serviceType: form.serviceType || undefined,
            contractType: form.contractType || undefined,
            sku: form.sku.trim() || undefined,
            description: form.description.trim() || undefined,
            descriptionSale: form.descriptionSale.trim() || undefined,
            category: form.category.trim() || undefined,
            recurringInvoice: form.recurringInvoice,
            saleOk: form.saleOk,
            externalImageUrl: form.externalImageUrl.trim() || undefined,
          },
        },
      })

      if (result?.updateProductUnit.success) {
        alert({ text: 'Product updated successfully', type: 'success' })
        router.push('/portal/products')
      } else {
        alert({ text: result?.updateProductUnit.message || 'Failed to update product', type: 'error' })
      }
    } catch (err: unknown) {
      alert({ text: err instanceof Error ? err.message : 'Failed to update product', type: 'error' })
    }
  }

  if (fetching) {
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
        <Link href="/portal/products" className="hover:text-violet-500">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-100 font-medium">Edit</span>
      </nav>

      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          Edit Product
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 mb-6">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Basic Information</h2>
          </header>
          <div className="p-5">
            <div className="grid gap-5 md:grid-cols-2">
              {/* PU Category first */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" htmlFor="puCategory">
                  Product Category <span className="text-red-500">*</span>
                </label>
                <select id="puCategory" name="puCategory" className="form-select w-full" value={form.puCategory} onChange={handleCategoryChange}>
                  <option value="">— Select a category —</option>
                  {puCategories.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
                {form.puCategory && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{categoryHints[form.puCategory]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </label>
                <input id="name" name="name" className="form-input w-full" type="text" value={form.name} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="listPrice">
                  Price <span className="text-red-500">*</span>
                </label>
                <input id="listPrice" name="listPrice" className="form-input w-full" type="number" min="0" step="0.01" value={form.listPrice} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="sku">SKU</label>
                <input id="sku" name="sku" className="form-input w-full" type="text" value={form.sku} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="category">Category Name</label>
                <input id="category" name="category" className="form-input w-full" type="text" value={form.category} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="externalImageUrl">Image URL</label>
                <input id="externalImageUrl" name="externalImageUrl" className="form-input w-full" type="url" value={form.externalImageUrl} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Classification — dynamic based on puCategory */}
        {form.puCategory && (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 mb-6">
            <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">Classification</h2>
            </header>
            <div className="p-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="puMetric">PU Metric</label>
                  <select id="puMetric" name="puMetric" className="form-select w-full" value={form.puMetric} onChange={handleChange}>
                    <option value="">— None —</option>
                    {puMetrics.map((m) => (
                      <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {form.puCategory === 'service' && (
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="serviceType">Service Type</label>
                    <select id="serviceType" name="serviceType" className="form-select w-full" value={form.serviceType} onChange={handleServiceTypeChange}>
                      <option value="">— Select —</option>
                      {serviceTypes.map((s) => (
                        <option key={s} value={s}>{s === 'access' ? 'Access (time-bounded)' : 'Gage (usage-based)'}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                      {form.serviceType === 'access' ? 'Grants time-bounded access to infrastructure (e.g., weekly swap access).' :
                       form.serviceType === 'gage' ? 'Monetizes usage metrics (e.g., per-swap, per-kWh).' :
                       'Choose how this service is metered.'}
                    </p>
                  </div>
                )}

                {form.puCategory === 'contract' && (
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="contractType">Contract Type</label>
                    <select id="contractType" name="contractType" className="form-select w-full" value={form.contractType} onChange={handleChange}>
                      <option value="">— Select —</option>
                      {contractTypes.map((c) => (
                        <option key={c} value={c}>{c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                      {form.contractType === 'privilege' ? 'Prerequisite entitlement to purchase services (e.g., deposit-backed swap access).' :
                       form.contractType === 'warranty' ? 'Repair or replacement commitment for physical products.' :
                       form.contractType === 'rental' ? 'Time-bounded usage rights without ownership transfer.' :
                       form.contractType === 'maintenance' ? 'Scheduled servicing and upkeep commitment.' :
                       form.contractType === 'asset_assignment' ? 'Binds a specific asset (e.g., vehicle) to a service plan.' :
                       'Define the type of commercial commitment.'}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-6 mt-5">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" name="recurringInvoice" className="form-checkbox" checked={form.recurringInvoice} onChange={handleChange} />
                  <span className="text-sm font-medium ml-2">Recurring Invoice</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" name="saleOk" className="form-checkbox" checked={form.saleOk} onChange={handleChange} />
                  <span className="text-sm font-medium ml-2">Available for Sale</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 mb-6">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Description</h2>
          </header>
          <div className="p-5">
            <div className="grid gap-5 md:grid-cols-1">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="description">Internal Description</label>
                <textarea id="description" name="description" className="form-textarea w-full" rows={3} value={form.description} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="descriptionSale">Sales Description</label>
                <textarea id="descriptionSale" name="descriptionSale" className="form-textarea w-full" rows={3} value={form.descriptionSale} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <Link
            href={`/portal/products/${id}`}
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
      </form>
    </div>
  )
}
