'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSalesToken, getSalesUser } from '@/lib/odoo-auth'
import { createProductItem } from '@/lib/services/product-service'

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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    list_price: '',
    type: 'service',
    pu_category: '' as PuCategory,
    pu_metric: '',
    service_type: '',
    contract_type: '',
    default_code: '',
    description: '',
    description_sale: '',
    category: '',
    recurring_invoice: false,
    sale_ok: true,
    external_image_url: '',
  })

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
      pu_category: cat,
      type: defaults.type,
      pu_metric: defaults.pu_metric,
      recurring_invoice: defaults.recurring_invoice,
      service_type: cat === 'service' ? prev.service_type : '',
      contract_type: cat === 'contract' ? prev.contract_type : '',
    }))
  }

  const handleServiceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setForm((prev) => ({
      ...prev,
      service_type: val,
      pu_metric: val === 'gage' ? 'count' : 'duration',
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.name.trim()) {
      setError('Product name is required.')
      return
    }
    if (!form.list_price || Number(form.list_price) < 0) {
      setError('A valid price is required.')
      return
    }
    if (!form.pu_category) {
      setError('Please select a PU category.')
      return
    }

    const token = getSalesToken()
    if (!token) {
      setError('Session expired. Please log in again.')
      return
    }

    const user = getSalesUser()

    setSaving(true)
    try {
      await createProductItem(
        {
          name: form.name.trim(),
          list_price: Number(form.list_price),
          type: form.type || undefined,
          company_id: user?.companyId || undefined,
          pu_category: form.pu_category || undefined,
          pu_metric: form.pu_metric || undefined,
          service_type: form.service_type || undefined,
          contract_type: form.contract_type || undefined,
          default_code: form.default_code.trim() || undefined,
          description: form.description.trim() || undefined,
          description_sale: form.description_sale.trim() || undefined,
          category: form.category.trim() || undefined,
          recurring_invoice: form.recurring_invoice,
          sale_ok: form.sale_ok,
          external_image_url: form.external_image_url.trim() || undefined,
        },
        token
      )
      router.push('/portal/products')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
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
        <Link href="/portal/products" className="hover:text-violet-500">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-100 font-medium">New</span>
      </nav>

      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          Create a Product
        </h1>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

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
                <label className="block text-sm font-medium mb-1" htmlFor="pu_category">
                  Product Category <span className="text-red-500">*</span>
                </label>
                <select id="pu_category" name="pu_category" className="form-select w-full" value={form.pu_category} onChange={handleCategoryChange}>
                  <option value="">— Select a category —</option>
                  {puCategories.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
                {form.pu_category && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{categoryHints[form.pu_category]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </label>
                <input id="name" name="name" className="form-input w-full" type="text" value={form.name} onChange={handleChange} required placeholder={
                  form.pu_category === 'physical' ? 'e.g. E3-Pro Motorbike' :
                  form.pu_category === 'service' ? 'e.g. Battery Swap Access – Weekly' :
                  form.pu_category === 'contract' ? 'e.g. Swap Privilege – MotBat 45Ah' :
                  form.pu_category === 'digital' ? 'e.g. Fleet Dashboard Access' :
                  'e.g. Product Name'
                } />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="list_price">
                  Price <span className="text-red-500">*</span>
                </label>
                <input id="list_price" name="list_price" className="form-input w-full" type="number" min="0" step="0.01" value={form.list_price} onChange={handleChange} required placeholder="e.g. 500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="default_code">SKU</label>
                <input id="default_code" name="default_code" className="form-input w-full" type="text" value={form.default_code} onChange={handleChange} placeholder={
                  form.pu_category === 'physical' ? 'e.g. PHY-E3PRO-001' :
                  form.pu_category === 'service' ? 'e.g. SVC-SWAP-W01' :
                  form.pu_category === 'contract' ? 'e.g. CTR-PRIV-45AH' :
                  'e.g. PROD-001'
                } />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="category">Category Name</label>
                <input id="category" name="category" className="form-input w-full" type="text" value={form.category} onChange={handleChange} placeholder="Auto-creates if not found" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="external_image_url">Image URL</label>
                <input id="external_image_url" name="external_image_url" className="form-input w-full" type="url" value={form.external_image_url} onChange={handleChange} placeholder="https://..." />
              </div>
            </div>
          </div>
        </div>

        {/* Classification — dynamic based on pu_category */}
        {form.pu_category && (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 mb-6">
            <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">Classification</h2>
            </header>
            <div className="p-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="pu_metric">PU Metric</label>
                  <select id="pu_metric" name="pu_metric" className="form-select w-full" value={form.pu_metric} onChange={handleChange}>
                    <option value="">— None —</option>
                    {puMetrics.map((m) => (
                      <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {form.pu_category === 'service' && (
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="service_type">Service Type</label>
                    <select id="service_type" name="service_type" className="form-select w-full" value={form.service_type} onChange={handleServiceTypeChange}>
                      <option value="">— Select —</option>
                      {serviceTypes.map((s) => (
                        <option key={s} value={s}>{s === 'access' ? 'Access (time-bounded)' : 'Gage (usage-based)'}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                      {form.service_type === 'access' ? 'Grants time-bounded access to infrastructure (e.g., weekly swap access).' :
                       form.service_type === 'gage' ? 'Monetizes usage metrics (e.g., per-swap, per-kWh).' :
                       'Choose how this service is metered.'}
                    </p>
                  </div>
                )}

                {form.pu_category === 'contract' && (
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="contract_type">Contract Type</label>
                    <select id="contract_type" name="contract_type" className="form-select w-full" value={form.contract_type} onChange={handleChange}>
                      <option value="">— Select —</option>
                      {contractTypes.map((c) => (
                        <option key={c} value={c}>{c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                      {form.contract_type === 'privilege' ? 'Prerequisite entitlement to purchase services (e.g., deposit-backed swap access).' :
                       form.contract_type === 'warranty' ? 'Repair or replacement commitment for physical products.' :
                       form.contract_type === 'rental' ? 'Time-bounded usage rights without ownership transfer.' :
                       form.contract_type === 'maintenance' ? 'Scheduled servicing and upkeep commitment.' :
                       form.contract_type === 'asset_assignment' ? 'Binds a specific asset (e.g., vehicle) to a service plan.' :
                       'Define the type of commercial commitment.'}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-6 mt-5">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" name="recurring_invoice" className="form-checkbox" checked={form.recurring_invoice} onChange={handleChange} />
                  <span className="text-sm font-medium ml-2">Recurring Invoice</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" name="sale_ok" className="form-checkbox" checked={form.sale_ok} onChange={handleChange} />
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
                <label className="block text-sm font-medium mb-1" htmlFor="description_sale">Sales Description</label>
                <textarea id="description_sale" name="description_sale" className="form-textarea w-full" rows={3} value={form.description_sale} onChange={handleChange} placeholder="Description shown to customers" />
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
