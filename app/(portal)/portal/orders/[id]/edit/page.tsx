'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client'
import Link from 'next/link'
import { Plus, X, Package } from 'lucide-react'
import ComboboxSearch from '@/components/combobox-search'
import { useAlert } from '@/app/contexts/alertContext'
import { PRODUCT_UNITS_QUERY } from '@/lib/portal/queries'
import { getMockOrder, formatCurrency } from '@/lib/portal/mock-orders'
import type { OrderEntity, ProductUnitsListResponse, ProductUnitEntity } from '@/lib/portal/types'

interface EditLine {
  id: string
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

export default function EditOrderPage() {
  const params = useParams()
  const router = useRouter()
  const { alert } = useAlert()
  const id = params.id as string

  const [order, setOrder] = useState<OrderEntity | null>(null)
  const [lines, setLines] = useState<EditLine[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [productDropdownOpen, setProductDropdownOpen] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [debouncedProductSearch, setDebouncedProductSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedProductSearch(productSearch), 300)
    return () => clearTimeout(t)
  }, [productSearch])

  const { data: productsData, loading: productsLoading } = useQuery<ProductUnitsListResponse>(
    PRODUCT_UNITS_QUERY,
    {
      variables: { filters: { search: debouncedProductSearch || undefined, limit: 5, active: true } },
      skip: !productDropdownOpen,
    }
  )

  const products = productsData?.productUnits.data ?? []

  useEffect(() => {
    getMockOrder(id).then((o) => {
      if (o) {
        setOrder(o)
        setLines(
          o.lines.map((l) => ({
            id: l.id,
            productId: l.productId,
            productName: l.productName,
            sku: l.sku,
            puCategory: l.puCategory,
            puMetric: l.puMetric,
            description: l.description,
            durationMonths: l.durationMonths,
            priceUnit: l.priceUnit,
            quantity: l.quantity,
          }))
        )
      }
      setLoading(false)
    })
  }, [id])

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
            id: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
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

  const handleRemoveLine = (lineId: string) => {
    setLines((prev) => prev.filter((l) => l.id !== lineId))
  }

  const handleLineChange = (lineId: string, field: 'quantity' | 'priceUnit', value: number) => {
    setLines((prev) =>
      prev.map((l) => (l.id === lineId ? { ...l, [field]: value } : l))
    )
  }

  const handleSave = async () => {
    if (lines.length === 0) {
      alert({ text: 'Add at least one product line.', type: 'error' })
      return
    }
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    setSaving(false)
    alert({ text: 'Order updated successfully. (Mock)', type: 'success' })
    router.push(`/portal/orders/${id}`)
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        <div className="text-gray-400 py-12 text-center">Loading…</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        <div className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          Order not found.
        </div>
      </div>
    )
  }

  const renderLineRows = (lineGroup: EditLine[], categoryLabel: string, badgeClass: string) => {
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
          <tr key={line.id} className="border-b border-gray-100 dark:border-gray-700/60">
            <td className="px-4 py-3 text-sm text-gray-400">{lines.indexOf(line) + 1}</td>
            <td className="px-4 py-3">
              <div className="font-medium text-sm text-gray-800 dark:text-gray-100">{line.productName}</div>
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
              {line.durationMonths && <div className="text-xs text-gray-400">{line.durationMonths} Mo</div>}
            </td>
            <td className="px-4 py-3 text-right">
              <input
                type="number"
                min="0"
                step="0.01"
                value={line.priceUnit}
                onChange={(e) => handleLineChange(line.id, 'priceUnit', parseFloat(e.target.value) || 0)}
                className="form-input w-24 text-right text-sm tabular-nums py-1"
              />
            </td>
            <td className="px-4 py-3 text-right">
              <input
                type="number"
                min="1"
                value={line.quantity}
                onChange={(e) => handleLineChange(line.id, 'quantity', parseInt(e.target.value) || 1)}
                className="form-input w-16 text-right text-sm tabular-nums py-1"
              />
            </td>
            <td className="px-4 py-3 text-right font-semibold text-sm tabular-nums text-gray-800 dark:text-gray-100">
              {formatCurrency(line.priceUnit * line.quantity)}
            </td>
            <td className="px-4 py-3 text-center">
              <button type="button" onClick={() => handleRemoveLine(line.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
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
        <Link href={`/portal/orders/${id}`} className="hover:text-violet-500">{order.name}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-100 font-medium">Edit</span>
      </nav>

      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          Edit Order Lines
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {order.name} · {order.partnerName}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            Product-Unit Lines
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
                {renderLineRows(physicalLines, 'Physical', 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300')}
                {renderLineRows(contractLines, 'Contract', 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300')}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-sm text-gray-500 dark:text-gray-400">
            No lines. Click <strong>Add PU Line</strong> above to add products.
          </div>
        )}

        {lines.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700/60">
            <div className="max-w-xs ml-auto space-y-1.5">
              {physicalLines.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">PHY</span> Physical
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">{formatCurrency(summary.physicalSubtotal)}</span>
                </div>
              )}
              {contractLines.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">CTR</span> Contract
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">{formatCurrency(summary.contractSubtotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm border-t border-gray-100 dark:border-gray-700/60 pt-1.5">
                <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">{formatCurrency(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">VAT (16%)</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">{formatCurrency(summary.tax)}</span>
              </div>
              <div className="flex justify-between text-base border-t-2 border-gray-800 dark:border-gray-200 pt-2 mt-1.5">
                <span className="font-bold text-gray-800 dark:text-gray-100">Total</span>
                <span className="font-extrabold text-green-600 dark:text-green-400 tabular-nums">{formatCurrency(summary.total)}</span>
              </div>
            </div>
          </div>
        )}

        <footer className="px-5 py-4 border-t border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center justify-between">
            <Link
              href={`/portal/orders/${id}`}
              className="btn border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
            >
              Cancel
            </Link>
            <button
              type="button"
              disabled={saving}
              className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white ml-3"
              onClick={handleSave}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
