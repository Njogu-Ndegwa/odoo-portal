'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client'
import Link from 'next/link'
import { getSalesUser } from '@/lib/odoo-auth'
import { CREATE_PRODUCT_UNIT } from '@/lib/portal/mutations'
import type { CreateProductUnitData } from '@/lib/portal/types'
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

export default function ProductCreatePage() {
  const router = useRouter()
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

  const [createProductUnit, { loading: saving }] = useMutation<CreateProductUnitData>(CREATE_PRODUCT_UNIT)

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
    if (!form.listPrice || Number(form.listPrice) < 0) {
      alert({ text: 'A valid price is required.', type: 'error' })
      return
    }
    if (!form.puCategory) {
      alert({ text: 'Please select a PU category.', type: 'error' })
      return
    }

    const user = getSalesUser()

    try {
      const { data } = await createProductUnit({
        variables: {
          input: {
            name: form.name.trim(),
            listPrice: Number(form.listPrice),
            type: form.type || undefined,
            companyId: user?.companyId || undefined,
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

      if (data?.createProductUnit.success) {
        alert({ text: 'Product created successfully', type: 'success' })
        router.push('/portal/products')
      } else {
        alert({ text: data?.createProductUnit.message || 'Failed to create product', type: 'error' })
      }
    } catch (err: unknown) {
      alert({ text: err instanceof Error ? err.message : 'Failed to create product', type: 'error' })
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/portal" className="hover:text-violet-500">Portal</Link>
        <span className="mx-2">/</span>
        <Link href="/portal/products" className="hover:text-violet-500">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-100 font-medium">New</span>
      </nav>

      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          Create a Product
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
                <input id="name" name="name" className="form-input w-full" type="text" value={form.name} onChange={handleChange} required placeholder={
                  form.puCategory === 'physical' ? 'e.g. E3-Pro Motorbike' :
                  form.puCategory === 'service' ? 'e.g. Battery Swap Access – Weekly' :
                  form.puCategory === 'contract' ? 'e.g. Swap Privilege – MotBat 45Ah' :
                  form.puCategory === 'digital' ? 'e.g. Fleet Dashboard Access' :
                  'e.g. Product Name'
                } />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="listPrice">
                  Price <span className="text-red-500">*</span>
                </label>
                <input id="listPrice" name="listPrice" className="form-input w-full" type="number" min="0" step="0.01" value={form.listPrice} onChange={handleChange} required placeholder="e.g. 500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="sku">SKU</label>
                <input id="sku" name="sku" className="form-input w-full" type="text" value={form.sku} onChange={handleChange} placeholder={
                  form.puCategory === 'physical' ? 'e.g. PHY-E3PRO-001' :
                  form.puCategory === 'service' ? 'e.g. SVC-SWAP-W01' :
                  form.puCategory === 'contract' ? 'e.g. CTR-PRIV-45AH' :
                  'e.g. PROD-001'
                } />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="category">Category Name</label>
                <input id="category" name="category" className="form-input w-full" type="text" value={form.category} onChange={handleChange} placeholder="Auto-creates if not found" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="externalImageUrl">Image URL</label>
                <input id="externalImageUrl" name="externalImageUrl" className="form-input w-full" type="url" value={form.externalImageUrl} onChange={handleChange} placeholder="https://..." />
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
                <textarea id="description" name="description" className="form-textarea w-full" rows={3} value={form.description} onChange={handleChange} placeholder="Internal notes about this product" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="descriptionSale">Sales Description</label>
                <textarea id="descriptionSale" name="descriptionSale" className="form-textarea w-full" rows={3} value={form.descriptionSale} onChange={handleChange} placeholder="Description shown to customers" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <Link
            href="/portal/products"
            className="btn border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white ml-3"
          >
            {saving ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
