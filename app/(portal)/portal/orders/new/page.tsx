'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client'
import Link from 'next/link'
import { Plus, X, Users, Package } from 'lucide-react'
import ComboboxSearch from '@/components/combobox-search'
import { useAlert } from '@/app/contexts/alertContext'
import { CUSTOMERS_QUERY, PRODUCT_UNITS_QUERY, CREATE_ORDER_MUTATION } from '@/lib/portal/queries'
import { formatCurrency } from '@/lib/portal/mock-orders'
import type {
  CustomersListResponse,
  ProductUnitsListResponse,
  CustomerEntity,
  ProductUnitEntity,
} from '@/lib/portal/types'

interface OrderLine {
  tempId: string
  productId: number
  productName: string
  sku: string | null
  puCategory: string | null
  puMetric: string | null
  description: string | null
  durationMonths: number | null
  priceUnit: number
  quantity: number
}

const VAT_RATE = 0.16

export default function CreateOrderPage() {
  const router = useRouter()
  const { alert } = useAlert()

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerEntity | null>(null)
  const [lines, setLines] = useState<OrderLine[]>([])
  const [clientOrderRef, setClientOrderRef] = useState('')
  const [channelPartner, setChannelPartner] = useState('')
  const [salesOutlet, setSalesOutlet] = useState('')

  // Customer search
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState('')

  // Product search
  const [productDropdownOpen, setProductDropdownOpen] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [debouncedProductSearch, setDebouncedProductSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedCustomerSearch(customerSearch), 300)
    return () => clearTimeout(t)
  }, [customerSearch])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedProductSearch(productSearch), 300)
    return () => clearTimeout(t)
  }, [productSearch])

  const { data: customersData, loading: customersLoading } = useQuery<CustomersListResponse>(
    CUSTOMERS_QUERY,
    {
      variables: { filters: { search: debouncedCustomerSearch || undefined, limit: 5 } },
      skip: !customerDropdownOpen,
    }
  )

  const { data: productsData, loading: productsLoading } = useQuery<ProductUnitsListResponse>(
    PRODUCT_UNITS_QUERY,
    {
      variables: { filters: { search: debouncedProductSearch || undefined, limit: 5, active: true } },
      skip: !productDropdownOpen,
    }
  )

  const customers = customersData?.customers.data ?? []
  const products = productsData?.productUnits.data ?? []

  const physicalLines = lines.filter((l) => l.puCategory === 'physical')
  const contractLines = lines.filter((l) => l.puCategory !== 'physical')

  const summary = useMemo(() => {
    const physicalSubtotal = physicalLines.reduce((s, l) => s + l.priceUnit * l.quantity, 0)
    const contractSubtotal = contractLines.reduce((s, l) => s + l.priceUnit * l.quantity, 0)
    const subtotal = physicalSubtotal + contractSubtotal
    const tax = subtotal * VAT_RATE
    const total = subtotal + tax
    return { physicalSubtotal, contractSubtotal, subtotal, tax, total }
  }, [physicalLines, contractLines])

  const handleSelectCustomer = useCallback((c: CustomerEntity) => {
    setSelectedCustomer(c)
  }, [])

  const handleClearCustomer = useCallback(() => {
    setSelectedCustomer(null)
  }, [])

  const handleAddProduct = useCallback(
    (p: ProductUnitEntity) => {
      const existing = lines.find((l) => l.productId === Number(p.id))
      if (existing) {
        setLines((prev) =>
          prev.map((l) =>
            l.productId === Number(p.id) ? { ...l, quantity: l.quantity + 1 } : l
          )
        )
      } else {
        setLines((prev) => [
          ...prev,
          {
            tempId: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            productId: Number(p.id),
            productName: p.name,
            sku: p.sku,
            puCategory: p.puCategory?.toLowerCase() ?? 'physical',
            puMetric: p.puMetric ?? 'Piece',
            description: p.descriptionSale ?? p.description,
            durationMonths: null,
            priceUnit: p.listPrice ?? 0,
            quantity: 1,
          },
        ])
      }
    },
    [lines]
  )

  const handleRemoveLine = (tempId: string) => {
    setLines((prev) => prev.filter((l) => l.tempId !== tempId))
  }

  const handleLineChange = (tempId: string, field: 'quantity' | 'priceUnit', value: number) => {
    setLines((prev) =>
      prev.map((l) => (l.tempId === tempId ? { ...l, [field]: value } : l))
    )
  }

  const [createOrder, { loading: creating }] = useMutation(CREATE_ORDER_MUTATION)

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      alert({ text: 'Please select a customer.', type: 'error' })
      return
    }
    if (lines.length === 0) {
      alert({ text: 'Add at least one product line.', type: 'error' })
      return
    }

    try {
      const { data } = await createOrder({
        variables: {
          input: {
            partnerId: Number(selectedCustomer.id),
            clientOrderRef: clientOrderRef || undefined,
            lines: lines.map((l) => ({
              productId: l.productId,
              quantity: l.quantity,
              priceUnit: l.priceUnit,
            })),
          },
        },
      })

      const result = data?.createOrder
      if (result?.success && result?.order?.id) {
        alert({ text: 'Quotation created successfully.', type: 'success' })
        router.push(`/portal/orders/${result.order.id}`)
      } else {
        alert({ text: result?.message ?? 'Failed to create order.', type: 'error' })
      }
    } catch (err: any) {
      alert({ text: err?.message ?? 'Failed to create order.', type: 'error' })
    }
  }

  const renderLineRows = (lineGroup: OrderLine[], categoryLabel: string, badgeClass: string) => {
    if (lineGroup.length === 0) return null
    return (
      <>
        <tr>
          <td
            colSpan={8}
            className="bg-gray-50 dark:bg-gray-700/40 px-4 py-2 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeClass}`}>
                {categoryLabel}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {categoryLabel === 'Physical' ? 'Tangible Assets' : 'Entitlements & Obligations'}
              </span>
              <span className="text-gray-400 dark:text-gray-500 font-normal normal-case">
                — {lineGroup.length} item{lineGroup.length > 1 ? 's' : ''}
              </span>
            </div>
          </td>
        </tr>
        {lineGroup.map((line) => (
          <tr key={line.tempId} className="border-b border-gray-100 dark:border-gray-700/60">
            <td className="px-4 py-3 text-sm text-gray-400">
              {lines.indexOf(line) + 1}
            </td>
            <td className="px-4 py-3">
              <div className="font-medium text-sm text-gray-800 dark:text-gray-100">
                {line.productName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {line.sku}{line.description ? ` · ${line.description}` : ''}
              </div>
            </td>
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeClass}`}>
                {categoryLabel}
              </span>
            </td>
            <td className="px-4 py-3 text-sm tabular-nums text-gray-600 dark:text-gray-300">
              {line.puMetric}
              {line.durationMonths && (
                <div className="text-xs text-gray-400">{line.durationMonths} Months</div>
              )}
            </td>
            <td className="px-4 py-3 text-right">
              <input
                type="number"
                min="0"
                step="0.01"
                value={line.priceUnit}
                onChange={(e) => handleLineChange(line.tempId, 'priceUnit', parseFloat(e.target.value) || 0)}
                className="form-input w-24 text-right text-sm tabular-nums py-1"
              />
            </td>
            <td className="px-4 py-3 text-right">
              <input
                type="number"
                min="1"
                value={line.quantity}
                onChange={(e) => handleLineChange(line.tempId, 'quantity', parseInt(e.target.value) || 1)}
                className="form-input w-16 text-right text-sm tabular-nums py-1"
              />
            </td>
            <td className="px-4 py-3 text-right font-semibold text-sm tabular-nums text-gray-800 dark:text-gray-100">
              {formatCurrency(line.priceUnit * line.quantity)}
            </td>
            <td className="px-4 py-3 text-center">
              <button
                type="button"
                onClick={() => handleRemoveLine(line.tempId)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </td>
          </tr>
        ))}
      </>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/portal" className="hover:text-violet-500">Portal</Link>
        <span className="mx-2">/</span>
        <Link href="/portal/orders" className="hover:text-violet-500">Orders</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-100 font-medium">New</span>
      </nav>

      {/* Header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-5">
        <div>
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            Create Quotation
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Select a customer and add product-unit lines
          </p>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            Draft
          </span>
        </div>
      </div>

      {/* Customer card */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 mb-4">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            Customer & Channel Attribution
          </h2>
          <ComboboxSearch<CustomerEntity>
            triggerLabel={selectedCustomer ? 'Change Customer' : 'Select Customer'}
            triggerIcon={<Users className="w-4 h-4" />}
            searchPlaceholder="Search by name or email…"
            value={customerSearch}
            onChange={setCustomerSearch}
            items={customers}
            isLoading={customersLoading}
            emptyMessage="No customers found"
            onSelect={handleSelectCustomer}
            onOpenChange={setCustomerDropdownOpen}
            align="right"
            dropdownClassName="w-80"
            renderItem={(c) => (
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-800 dark:text-gray-100">{c.name}</span>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span className="truncate">{c.email || 'No email'}</span>
                    <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      c.isCompany
                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {c.isCompany ? 'Company' : 'Individual'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          />
        </header>
        <div className="p-5">
          {selectedCustomer ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 mb-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Customer</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{selectedCustomer.name}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Email</div>
                  <div className="text-sm text-gray-800 dark:text-gray-100">{selectedCustomer.email || '—'}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Phone</div>
                  <div className="text-sm text-gray-800 dark:text-gray-100">{selectedCustomer.phone || selectedCustomer.mobile || '—'}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Type</div>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                    selectedCustomer.isCompany
                      ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {selectedCustomer.isCompany ? 'Company' : 'Individual'}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700/60 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Channel Attribution
                  </div>
                  <button
                    type="button"
                    onClick={handleClearCustomer}
                    className="text-xs text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                  >
                    Clear customer
                  </button>
                </div>
                <div className="grid gap-5 md:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-gray-400" htmlFor="channelPartner">
                      Channel Partner
                    </label>
                    <input
                      id="channelPartner"
                      className="form-input w-full text-sm"
                      type="text"
                      value={channelPartner}
                      onChange={(e) => setChannelPartner(e.target.value)}
                      placeholder="e.g. GreenRide Dealers"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-gray-400" htmlFor="clientOrderRef">
                      Customer PO Reference
                    </label>
                    <input
                      id="clientOrderRef"
                      className="form-input w-full text-sm"
                      type="text"
                      value={clientOrderRef}
                      onChange={(e) => setClientOrderRef(e.target.value)}
                      placeholder="e.g. PO-2026-001"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-gray-400" htmlFor="salesOutlet">
                      Sales Outlet
                    </label>
                    <input
                      id="salesOutlet"
                      className="form-input w-full text-sm"
                      type="text"
                      value={salesOutlet}
                      onChange={(e) => setSalesOutlet(e.target.value)}
                      placeholder="e.g. Westlands Hub"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Skeleton placeholder */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="h-4 w-44 rounded bg-gray-100 dark:bg-gray-700/50" />
                  <div className="h-3 w-32 rounded bg-gray-100 dark:bg-gray-700/50 mt-1.5" />
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700/60 pt-4">
                <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Channel Attribution
                </div>
                <div className="grid gap-5 md:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-400 dark:text-gray-500">
                      Channel Partner
                    </label>
                    <div className="h-9 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-dashed border-gray-200 dark:border-gray-700/60" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-400 dark:text-gray-500">
                      Customer PO Reference
                    </label>
                    <div className="h-9 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-dashed border-gray-200 dark:border-gray-700/60" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-400 dark:text-gray-500">
                      Sales Outlet
                    </label>
                    <div className="h-9 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-dashed border-gray-200 dark:border-gray-700/60" />
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
                Click <strong>Select Customer</strong> to get started
              </p>
            </>
          )}
        </div>
      </div>

      {/* Lines card */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 mb-4">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            Product-Unit Lines
            {lines.length > 0 && (
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                ({lines.length} PU{lines.length > 1 ? 's' : ''} across{' '}
                {new Set(lines.map((l) => l.puCategory)).size} categor{new Set(lines.map((l) => l.puCategory)).size > 1 ? 'ies' : 'y'})
              </span>
            )}
          </h2>
          <ComboboxSearch<ProductUnitEntity>
            triggerLabel="Add PU Line"
            triggerIcon={<Plus className="w-4 h-4" />}
            searchPlaceholder="Search products…"
            value={productSearch}
            onChange={setProductSearch}
            items={products}
            isLoading={productsLoading}
            emptyMessage="No products found"
            onSelect={handleAddProduct}
            onOpenChange={setProductDropdownOpen}
            align="right"
            dropdownClassName="w-96"
            renderItem={(p) => (
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-800 dark:text-gray-100">{p.name}</span>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span>{p.sku || 'No SKU'}</span>
                    {p.puCategory && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          p.puCategory.toLowerCase() === 'physical'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}
                      >
                        {p.puCategory}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm tabular-nums font-semibold text-gray-700 dark:text-gray-200 shrink-0">
                  {p.listPrice != null ? formatCurrency(p.listPrice) : '—'}
                </span>
              </div>
            )}
          />
        </header>

        {lines.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700/30">
                  <th className="px-4 py-3 w-10">#</th>
                  <th className="px-4 py-3">Product-Unit</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Metric</th>
                  <th className="px-4 py-3 text-right">Unit Price</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {renderLineRows(
                  physicalLines,
                  'Physical',
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                )}
                {renderLineRows(
                  contractLines,
                  'Contract',
                  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 px-5">
            <Package className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No product lines yet. Click <strong>Add PU Line</strong> above to build the quotation.
            </p>
          </div>
        )}

        {/* Summary */}
        {lines.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700/60">
            <div className="max-w-xs ml-auto space-y-1.5">
              {physicalLines.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      PHY
                    </span>
                    Physical
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                    {formatCurrency(summary.physicalSubtotal)}
                  </span>
                </div>
              )}
              {contractLines.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      CTR
                    </span>
                    Contract
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                    {formatCurrency(summary.contractSubtotal)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm border-t border-gray-100 dark:border-gray-700/60 pt-1.5 mt-1">
                <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                  {formatCurrency(summary.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">VAT (16%)</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                  {formatCurrency(summary.tax)}
                </span>
              </div>
              <div className="flex justify-between text-base border-t-2 border-gray-800 dark:border-gray-200 pt-2 mt-1.5">
                <span className="font-bold text-gray-800 dark:text-gray-100">Total</span>
                <span className="font-extrabold text-green-600 dark:text-green-400 tabular-nums">
                  {formatCurrency(summary.total)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/60">
        <Link
          href="/portal/orders"
          className="btn border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
        >
          Cancel
        </Link>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={creating}
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white disabled:opacity-50"
            onClick={handleSubmit}
          >
            {creating ? 'Creating…' : 'Create Quotation'}
          </button>
        </div>
      </div>
    </div>
  )
}
