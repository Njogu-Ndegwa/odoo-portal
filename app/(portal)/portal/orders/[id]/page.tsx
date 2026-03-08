'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import {
  Pencil,
  Send,
  FileText,
  CheckCircle2,
  CreditCard,
  Mail,
  Download,
  ShieldCheck,
  ClipboardList,
  RefreshCw,
  Receipt,
  FileCheck,
  X,
  Users,
  Package,
} from 'lucide-react'
import StepPipeline from '@/components/step-pipeline'
import type { PipelineStep } from '@/components/step-pipeline'
import ActivityTimeline from '@/components/activity-timeline'
import InfoBar from '@/components/info-bar'
import StatusBanner from '@/components/status-banner'
import ComboboxSearch from '@/components/combobox-search'
import { useAlert } from '@/app/contexts/alertContext'
import {
  ORDER_QUERY,
  CUSTOMERS_QUERY,
  PRODUCT_UNITS_QUERY,
  SEND_ORDER_MUTATION,
  CONFIRM_ORDER_MUTATION,
  REQUEST_APPROVAL_MUTATION,
  APPROVE_ORDER_MUTATION,
  REJECT_ORDER_MUTATION,
  CREATE_INVOICE_MUTATION,
  CONFIRM_INVOICE_MUTATION,
  REGISTER_PAYMENT_MUTATION,
  ADD_LINES_MUTATION,
  GET_PROFORMA_PDF,
} from '@/lib/portal/queries'
import type {
  OrderEntity,
  OrderLineEntity,
  CustomerEntity,
  ProductUnitEntity,
  CustomersListResponse,
  ProductUnitsListResponse,
} from '@/lib/portal/types'

const PIPELINE_STEPS: PipelineStep[] = [
  { label: 'Quotation', icon: <ClipboardList /> },
  { label: 'Send to Customer', icon: <Send /> },
  { label: 'Revise & Confirm', icon: <RefreshCw /> },
  { label: 'Proforma Invoice', icon: <Receipt /> },
  { label: 'Approval', icon: <ShieldCheck /> },
  { label: 'Payment', icon: <CreditCard /> },
  { label: 'Final Invoice', icon: <FileCheck /> },
]

const VAT_RATE = 0.16

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function getOrderStepIndex(order: OrderEntity): number {
  if (order.state === 'draft') return 0
  if (order.state === 'sent') return 1

  if (order.state === 'sale' || order.state === 'done') {
    if (order.invoiceCount > 0 && order.paymentStatus === 'paid') return 6
    if (order.paymentStatus === 'partial' || order.paymentStatus === 'paid') return 5
    if (order.approvalStatus === 'approved') return 5
    if (order.approvalStatus === 'pending') return 4
    return 3
  }

  return 0
}

function CategoryBadge({ category }: { category: string | null }) {
  const isPhysical = category?.toLowerCase() === 'physical'
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
        isPhysical
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
      }`}
    >
      {isPhysical ? 'Physical' : 'Contract'}
    </span>
  )
}

function OrderSummary({ lines }: { lines: OrderLineEntity[] }) {
  const physicalSub = lines
    .filter((l) => l.puCategory === 'physical')
    .reduce((s, l) => s + l.priceSubtotal, 0)
  const contractSub = lines
    .filter((l) => l.puCategory !== 'physical')
    .reduce((s, l) => s + l.priceSubtotal, 0)
  const subtotal = physicalSub + contractSub
  const tax = subtotal * VAT_RATE
  const total = subtotal + tax

  return (
    <div className="max-w-xs ml-auto space-y-1.5">
      {physicalSub > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <CategoryBadge category="physical" /> Physical
          </span>
          <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
            {formatCurrency(physicalSub)}
          </span>
        </div>
      )}
      {contractSub > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <CategoryBadge category="contract" /> Contract
          </span>
          <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
            {formatCurrency(contractSub)}
          </span>
        </div>
      )}
      <div className="flex justify-between text-sm border-t border-gray-100 dark:border-gray-700/60 pt-1.5">
        <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
        <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
          {formatCurrency(subtotal)}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">VAT (16%)</span>
        <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
          {formatCurrency(tax)}
        </span>
      </div>
      <div className="flex justify-between text-base border-t-2 border-gray-800 dark:border-gray-200 pt-2 mt-1.5">
        <span className="font-bold text-gray-800 dark:text-gray-100">Total</span>
        <span className="font-extrabold text-green-600 dark:text-green-400 tabular-nums">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  )
}

function LinesTable({
  lines,
}: {
  lines: OrderLineEntity[]
}) {
  const physical = lines.filter((l) => l.puCategory === 'physical')
  const contract = lines.filter((l) => l.puCategory !== 'physical')

  const renderGroup = (
    group: OrderLineEntity[],
    label: string,
    badgeClass: string,
    sublabel: string
  ) => {
    if (group.length === 0) return null
    return (
      <>
        <tr>
          <td
            colSpan={7}
            className="bg-gray-50 dark:bg-gray-700/40 px-4 py-2 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeClass}`}>
                {label}
              </span>
              <span className="text-gray-500 dark:text-gray-400">{sublabel}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-normal normal-case">
                — {group.length} item{group.length > 1 ? 's' : ''}
              </span>
            </div>
          </td>
        </tr>
        {group.map((line) => (
          <tr
            key={line.id}
            className="border-b border-gray-100 dark:border-gray-700/60"
          >
            <td className="px-4 py-3 text-sm text-gray-400">
              {lines.indexOf(line) + 1}
            </td>
            <td className="px-4 py-3">
              <div className="font-medium text-sm text-gray-800 dark:text-gray-100">
                {line.productName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {line.sku}
                {line.description ? ` · ${line.description}` : ''}
              </div>
            </td>
            <td className="px-4 py-3">
              <CategoryBadge category={line.puCategory} />
            </td>
            <td className="px-4 py-3 text-sm tabular-nums text-gray-600 dark:text-gray-300">
              {line.puMetric}
              {line.durationMonths && (
                <div className="text-xs text-gray-400">{line.durationMonths} Months</div>
              )}
            </td>
            <td className="px-4 py-3 text-right text-sm tabular-nums text-gray-700 dark:text-gray-200">
              {formatCurrency(line.priceUnit)}
            </td>
            <td className="px-4 py-3 text-right text-sm tabular-nums text-gray-700 dark:text-gray-200">
              {line.quantity}
            </td>
            <td className="px-4 py-3 text-right font-semibold text-sm tabular-nums text-gray-800 dark:text-gray-100">
              {formatCurrency(line.priceSubtotal)}
            </td>
          </tr>
        ))}
      </>
    )
  }

  return (
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
          </tr>
        </thead>
        <tbody>
          {renderGroup(
            physical,
            'Physical',
            'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
            'Tangible Assets'
          )}
          {renderGroup(
            contract,
            'Contract',
            'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
            'Entitlements & Obligations'
          )}
        </tbody>
      </table>
    </div>
  )
}

// ============================================================================
// Step panels
// ============================================================================

function StepQuotation({ order }: { order: OrderEntity }) {
  const isDraft = order.state === 'draft'

  const [customerSearch, setCustomerSearch] = useState('')
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState('')
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false)

  const [productSearch, setProductSearch] = useState('')
  const [debouncedProductSearch, setDebouncedProductSearch] = useState('')
  const [productDropdownOpen, setProductDropdownOpen] = useState(false)

  const [lines, setLines] = useState<OrderLineEntity[]>(order.lines)

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
      skip: !isDraft || !customerDropdownOpen,
    }
  )

  const { data: productsData, loading: productsLoading } = useQuery<ProductUnitsListResponse>(
    PRODUCT_UNITS_QUERY,
    {
      variables: { filters: { search: debouncedProductSearch || undefined, limit: 5, active: true } },
      skip: !isDraft || !productDropdownOpen,
    }
  )

  const customers = customersData?.customers.data ?? []
  const products = productsData?.productUnits.data ?? []

  const handleSelectCustomer = useCallback((c: CustomerEntity) => {
    order.partnerName = c.name
    order.partnerEmail = c.email ?? ''
    order.partnerPhone = c.phone ?? c.mobile ?? ''
    order.contactPerson = c.name
  }, [order])

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
            id: `temp-${Date.now()}`,
            productId: Number(p.id),
            productName: p.name,
            sku: p.sku ?? '',
            puCategory: p.puCategory?.toLowerCase() ?? 'physical',
            puMetric: p.puMetric ?? 'Piece',
            serviceType: p.serviceType ?? null,
            contractType: p.contractType ?? null,
            description: p.descriptionSale ?? p.description ?? '',
            durationMonths: null,
            priceUnit: p.listPrice ?? 0,
            quantity: 1,
            priceSubtotal: p.listPrice ?? 0,
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
      prev.map((l) => (l.id === lineId ? { ...l, [field]: value, priceSubtotal: field === 'quantity' ? l.priceUnit * value : value * l.quantity } : l))
    )
  }

  const physicalLines = lines.filter((l) => l.puCategory === 'physical')
  const contractLines = lines.filter((l) => l.puCategory !== 'physical')

  const renderEditableGroup = (
    group: OrderLineEntity[],
    label: string,
    badgeClass: string,
    sublabel: string
  ) => {
    if (group.length === 0) return null
    return (
      <>
        <tr>
          <td
            colSpan={8}
            className="bg-gray-50 dark:bg-gray-700/40 px-4 py-2 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeClass}`}>
                {label}
              </span>
              <span className="text-gray-500 dark:text-gray-400">{sublabel}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-normal normal-case">
                — {group.length} item{group.length > 1 ? 's' : ''}
              </span>
            </div>
          </td>
        </tr>
        {group.map((line) => (
          <tr key={line.id} className="border-b border-gray-100 dark:border-gray-700/60">
            <td className="px-4 py-3 text-sm text-gray-400">{lines.indexOf(line) + 1}</td>
            <td className="px-4 py-3">
              <div className="font-medium text-sm text-gray-800 dark:text-gray-100">{line.productName}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {line.sku}{line.description ? ` · ${line.description}` : ''}
              </div>
            </td>
            <td className="px-4 py-3">
              <CategoryBadge category={line.puCategory} />
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
    <>
      {/* Customer info */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 mb-4">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            Customer & Channel Attribution
          </h2>
          {isDraft ? (
            <ComboboxSearch<CustomerEntity>
              triggerLabel="Change Customer"
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
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
              Existing Customer
            </span>
          )}
        </header>
        <div className="p-5">
          <div className="grid gap-5 md:grid-cols-2 mb-4">
            <div>
              <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Customer</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{order.partnerName}</span>
            </div>
            <div>
              <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Contact Person</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">{order.contactPerson || '—'}</span>
            </div>
            <div>
              <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Email</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">{order.partnerEmail || '—'}</span>
            </div>
            <div>
              <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Phone</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">{order.partnerPhone || '—'}</span>
            </div>
          </div>
          {(order.channelPartner || order.salesRepName || order.salesOutlet) && (
            <div className="border-t border-gray-100 dark:border-gray-700/60 pt-4">
              <div className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-3">Channel Attribution</div>
              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Channel Partner</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{order.channelPartner || '—'}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Sales Representative</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{order.salesRepName || '—'}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Sales Outlet</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{order.salesOutlet || '—'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lines table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">
            Product-Unit Lines
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">
              ({lines.length} PUs)
            </span>
          </h2>
          {isDraft && (
            <ComboboxSearch<ProductUnitEntity>
              triggerLabel="Add PU Line"
              triggerIcon={<Package className="w-4 h-4" />}
              searchPlaceholder="Search products…"
              value={productSearch}
              onChange={setProductSearch}
              items={products}
              isLoading={productsLoading}
              emptyMessage="No products found"
              onSelect={handleAddProduct}
              onOpenChange={setProductDropdownOpen}
              align="right"
              dropdownClassName="w-80"
              renderItem={(p) => (
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="min-w-0">
                    <span className="font-medium text-gray-800 dark:text-gray-100">{p.name}</span>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      {p.sku && <span className="tabular-nums">{p.sku}</span>}
                      {p.puCategory && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          p.puCategory.toLowerCase() === 'physical'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}>
                          {p.puCategory}
                        </span>
                      )}
                    </div>
                  </div>
                  {p.listPrice != null && (
                    <span className="text-xs tabular-nums text-gray-500 shrink-0">{formatCurrency(p.listPrice)}</span>
                  )}
                </div>
              )}
            />
          )}
        </header>
        {isDraft ? (
          <>
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
                  {renderEditableGroup(
                    physicalLines,
                    'Physical',
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
                    'Tangible Assets'
                  )}
                  {renderEditableGroup(
                    contractLines,
                    'Contract',
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                    'Entitlements & Obligations'
                  )}
                  {lines.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                        No product lines yet. Click <strong>Add PU Line</strong> above to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700/60">
              <OrderSummary lines={lines} />
            </div>
          </>
        ) : (
          <>
            <LinesTable lines={order.lines} />
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700/60">
              <OrderSummary lines={order.lines} />
            </div>
          </>
        )}
      </div>
    </>
  )
}

function StepSend({ order, onSend }: { order: OrderEntity; onSend: () => void }) {
  const [emailTo, setEmailTo] = useState(order.partnerEmail || '')
  const [emailSubject, setEmailSubject] = useState(`Quotation ${order.name}`)
  const [emailBody, setEmailBody] = useState(
    `Dear ${order.contactPerson || order.partnerName},\n\nThank you for choosing OVES for your fleet electrification. Please find attached quotation ${order.name} covering your order.\n\nThis quotation includes ${order.lines.length} product-unit line(s) across Physical and Contract categories.\n\nThis quotation is valid for 30 days. Total: ${formatCurrency(order.amountTotal)} (incl. VAT).\n\nBest regards,\n${order.salesRepName || 'Sales Team'}\nOVES Energy`
  )

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Email editor */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Mail className="w-4 h-4 text-violet-500" /> Compose Email
          </h2>
          <button onClick={onSend} className="btn text-sm bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
            <Send className="w-3.5 h-3.5" /> Send Email
          </button>
        </header>

        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/40 border-b border-gray-100 dark:border-gray-700/60 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 w-14 shrink-0">From</span>
            <span className="text-sm text-gray-600 dark:text-gray-300">sales@oves.energy</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <label htmlFor="email-to" className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 w-14 shrink-0">To</label>
            <input
              id="email-to"
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              className="form-input flex-1 text-xs py-1"
              placeholder="recipient@example.com"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <label htmlFor="email-subject" className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 w-14 shrink-0">Subject</label>
            <input
              id="email-subject"
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="form-input flex-1 text-xs py-1 font-semibold"
            />
          </div>
        </div>

        <div className="p-5">
          <textarea
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            rows={12}
            className="form-textarea w-full text-sm text-gray-700 dark:text-gray-300 leading-relaxed resize-y"
          />
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-300">
            <FileText className="w-4 h-4 text-red-500" />
            {order.name}.pdf (310 KB)
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Activity Timeline</h2>
        </header>
        <div className="p-5">
          <ActivityTimeline events={order.timeline.slice(0, 3)} />
        </div>
      </div>
    </div>
  )
}

function StepRevise({ order, onConfirm }: { order: OrderEntity; onConfirm: () => void }) {
  const [lines, setLines] = useState(
    order.lines.map((l) => ({ ...l }))
  )

  const physicalLines = lines.filter((l) => l.puCategory === 'physical')
  const contractLines = lines.filter((l) => l.puCategory !== 'physical')

  const handleLineChange = (lineId: string, field: 'quantity' | 'priceUnit', value: number) => {
    setLines((prev) =>
      prev.map((l) =>
        l.id === lineId
          ? { ...l, [field]: value, priceSubtotal: field === 'quantity' ? l.priceUnit * value : value * l.quantity }
          : l
      )
    )
  }

  const handleRemoveLine = (lineId: string) => {
    setLines((prev) => prev.filter((l) => l.id !== lineId))
  }

  const renderEditableGroup = (
    group: OrderLineEntity[],
    label: string,
    badgeClass: string,
    sublabel: string
  ) => {
    if (group.length === 0) return null
    return (
      <>
        <tr>
          <td
            colSpan={8}
            className="bg-gray-50 dark:bg-gray-700/40 px-4 py-2 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeClass}`}>
                {label}
              </span>
              <span className="text-gray-500 dark:text-gray-400">{sublabel}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-normal normal-case">
                — {group.length} item{group.length > 1 ? 's' : ''}
              </span>
            </div>
          </td>
        </tr>
        {group.map((line) => (
          <tr key={line.id} className="border-b border-gray-100 dark:border-gray-700/60">
            <td className="px-4 py-3 text-sm text-gray-400">{lines.indexOf(line) + 1}</td>
            <td className="px-4 py-3">
              <div className="font-medium text-sm text-gray-800 dark:text-gray-100">{line.productName}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {line.sku}{line.description ? ` · ${line.description}` : ''}
              </div>
            </td>
            <td className="px-4 py-3">
              <CategoryBadge category={line.puCategory} />
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
    <>
      <div className="flex items-center gap-3 px-5 py-3.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl mb-4 text-sm text-violet-700 dark:text-violet-300">
        <Pencil className="w-5 h-5 shrink-0" />
        <p>
          Quotation is <strong>fully editable</strong>. Update quantities, prices, and terms
          directly in the table below. Click <strong>Confirm Order</strong> when ready to lock as
          a Sales Order.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">
            Product-Unit Lines
          </h2>
        </header>
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
              {renderEditableGroup(
                physicalLines,
                'Physical',
                'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
                'Tangible Assets'
              )}
              {renderEditableGroup(
                contractLines,
                'Contract',
                'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                'Entitlements & Obligations'
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700/60">
          <OrderSummary lines={lines} />
        </div>
      </div>
    </>
  )
}

function StepProforma({ order, onDownloadPdf }: { order: OrderEntity; onDownloadPdf: () => void }) {
  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 mb-4">
        <InfoBar
          items={[
            { label: 'Proforma #', value: <span className="tabular-nums text-gray-800 dark:text-gray-100">PI-{order.name.replace('SO-', '')}</span> },
            { label: 'Sales Order', value: <span className="tabular-nums text-gray-800 dark:text-gray-100">{order.name}</span> },
            {
              label: 'Date',
              value: order.createdAt
                ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '—',
            },
            { label: 'Customer', value: order.partnerName },
            { label: 'Outlet', value: order.salesOutlet || '—' },
          ]}
        />
        <LinesTable lines={order.lines} />
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700/60">
          <OrderSummary lines={order.lines} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Terms & Conditions</h2>
          </header>
          <div className="p-5 text-sm text-gray-600 dark:text-gray-300 space-y-2 leading-relaxed">
            <p><strong className="font-semibold text-gray-800 dark:text-gray-100">Physical PUs:</strong> Delivered within 10 business days after payment. Serial numbers assigned at dispatch.</p>
            <p><strong className="font-semibold text-gray-800 dark:text-gray-100">Contract PUs (deposits):</strong> Swap Privilege deposits are refundable upon contract termination per defined conditions.</p>
            <p><strong className="font-semibold text-gray-800 dark:text-gray-100">Contract PUs (warranties):</strong> Begin from delivery date. Coverage per Product-Unit specifications.</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Proforma Actions</h2>
          </header>
          <div className="p-5 text-center space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Download or send the proforma to <span className="font-semibold text-gray-800 dark:text-gray-100">{order.partnerName}</span>.
            </p>
            <button onClick={onDownloadPdf} className="btn bg-amber-500 text-white hover:bg-amber-600">
              <Download className="w-4 h-4" /> Download Proforma PDF
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function StepApproval({
  order,
  onRequestApproval,
  onApprove,
  onReject,
}: {
  order: OrderEntity
  onRequestApproval: () => void
  onApprove: (notes: string) => void
  onReject: (notes: string) => void
}) {
  const { alert } = useAlert()
  const approval = order.approval
  const isApproved = order.approvalStatus === 'approved'
  const isPending = order.approvalStatus === 'pending'
  const isNone = order.approvalStatus === 'none'

  const [approvalNotes, setApprovalNotes] = useState('')

  const handleApprove = () => {
    onApprove(approvalNotes)
  }

  const handleReject = () => {
    if (!approvalNotes.trim()) {
      alert({ text: 'Please provide a reason for rejection.', type: 'error' })
      return
    }
    onReject(approvalNotes)
  }

  return (
    <>
      {isApproved && approval && (
        <StatusBanner
          variant="success"
          title={`Approved by ${approval.approvedBy}`}
          description={`Approved on ${
            approval.approvedAt
              ? new Date(approval.approvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '—'
          }`}
        />
      )}
      {isPending && (
        <StatusBanner
          variant="warning"
          title="Pending Approval"
          description={`Submitted by ${approval?.submittedBy ?? '—'} on ${
            approval?.submittedAt
              ? new Date(approval.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '—'
          }. Awaiting review.`}
        />
      )}

      {isNone && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 mb-4 p-5 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            This order has not been submitted for approval yet.
          </p>
          <button onClick={onRequestApproval} className="btn bg-violet-600 text-white hover:bg-violet-700">
            <ShieldCheck className="w-4 h-4" /> Submit for Approval
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 mb-4">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Approval Details</h2>
          </header>
          <div className="p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Proforma #</span>
                <span className="text-sm tabular-nums text-gray-800 dark:text-gray-100">PI-{order.name.replace('SO-', '')}</span>
              </div>
              <div>
                <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Order Value</span>
                <span className="text-sm font-semibold tabular-nums text-green-600 dark:text-green-400">{formatCurrency(order.amountTotal)}</span>
              </div>
              <div>
                <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Submitted By</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">{approval?.submittedBy ?? '—'}</span>
              </div>
              <div>
                <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Status</span>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                  isApproved
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                    : isPending
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {isApproved ? 'Approved' : isPending ? 'Pending' : 'Not Submitted'}
                </span>
              </div>
              {isApproved && approval && (
                <div>
                  <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Approved By</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">{approval.approvedBy ?? '—'}</span>
                </div>
              )}
              {isApproved && approval?.approvedAt && (
                <div>
                  <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Approved On</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {new Date(approval.approvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
            {isApproved && approval?.notes && (
              <div className="mt-4 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-800 dark:text-green-300">
                <span className="text-[11px] font-medium uppercase tracking-wide">Approver notes:</span> {approval.notes}
              </div>
            )}
          </div>
        </div>

        {(isPending || isApproved) && (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
            <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                {isApproved ? 'Approval Decision' : 'Review & Decide'}
              </h2>
            </header>
            <div className="p-5">
              <div className="grid gap-5 sm:grid-cols-2 mb-4">
                <div>
                  <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Customer</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{order.partnerName}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Total</span>
                  <span className="text-sm font-semibold tabular-nums text-green-600 dark:text-green-400">{formatCurrency(order.amountTotal)}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">({order.lines.length} lines)</span>
                </div>
                <div>
                  <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Sales Rep</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{order.salesRepName || '—'}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Channel</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{order.channelPartner || '—'}</span>
                </div>
              </div>

              {isApproved && approval && (
                <div className="mb-4 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-800 dark:text-green-300 space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="font-semibold">Approved by {approval.approvedBy}</span>
                    <span className="text-green-600 dark:text-green-400">&middot;</span>
                    <span>
                      {approval.approvedAt
                        ? new Date(approval.approvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </span>
                  </div>
                  {approval.notes && <p>&ldquo;{approval.notes}&rdquo;</p>}
                </div>
              )}

              {isPending && (
                <>
                  <div className="mb-4">
                    <label htmlFor="approval-notes" className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
                      Notes <span className="normal-case tracking-normal text-gray-400">(required for rejection)</span>
                    </label>
                    <textarea
                      id="approval-notes"
                      rows={3}
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      className="form-textarea w-full text-sm resize-none"
                      placeholder="Add comments or conditions…"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleApprove}
                      className="btn flex-1 bg-green-600 text-white hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      className="btn flex-1 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Approval Timeline</h2>
        </header>
        <div className="p-5">
          {(() => {
            const approvalEvents = order.timeline.filter((e) => {
              const t = e.title.toLowerCase()
              return t.includes('approval') || t.includes('approved') || t.includes('pending') || t.includes('proforma') || t.includes('submitted')
            })
            return approvalEvents.length > 0 ? (
              <ActivityTimeline events={approvalEvents} />
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No approval events recorded yet.</p>
            )
          })()}
        </div>
      </div>
    </>
  )
}

function StepPayment({
  order,
  onRegisterPayment,
}: {
  order: OrderEntity
  onRegisterPayment: (amount: number, paymentDate: string, memo: string) => void
}) {
  const isPaid = order.paymentStatus === 'paid'
  const isPartial = order.paymentStatus === 'partial'

  const physicalSub = order.lines.filter((l) => l.puCategory === 'physical').reduce((s, l) => s + l.priceSubtotal, 0)
  const contractSub = order.lines.filter((l) => l.puCategory !== 'physical').reduce((s, l) => s + l.priceSubtotal, 0)
  const tax = (physicalSub + contractSub) * VAT_RATE

  const [payAmount, setPayAmount] = useState(order.remainingAmount)
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0])
  const [payMemo, setPayMemo] = useState('')

  return (
    <>
      {isPaid && (
        <StatusBanner
          variant="success"
          title="Payment Received"
          description={`${formatCurrency(order.paidAmount)} received${order.payments[0]?.paymentMethod ? ` via ${order.payments[0].paymentMethod}` : ''} on ${order.payments[0]?.paymentDate || '—'}`}
        />
      )}

      {isPartial && (
        <StatusBanner
          variant="warning"
          title="Partial Payment"
          description={`${formatCurrency(order.paidAmount)} received. ${formatCurrency(order.remainingAmount)} remaining.`}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Payment Details</h2>
          </header>
          <div className="p-5">
            <div className="grid gap-5 md:grid-cols-2">
              {order.payments.map((pay) => (
                <div key={pay.id} className="contents">
                  <div>
                    <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Payment Method</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{pay.paymentMethod || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Amount</span>
                    <span className="text-sm font-semibold tabular-nums text-green-600 dark:text-green-400">{formatCurrency(pay.amount)}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Transaction Ref</span>
                    <span className="text-sm tabular-nums text-gray-800 dark:text-gray-100">{pay.transactionRef || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Date</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{pay.paymentDate}</span>
                  </div>
                </div>
              ))}
              {order.payments.length === 0 && (
                <div className="col-span-2 text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                  No payments recorded yet.
                </div>
              )}
            </div>

            {!isPaid && (
              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700/60 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Register Payment</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Amount</label>
                    <input type="number" min="0" step="0.01" value={payAmount} onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)} className="form-input w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Date</label>
                    <input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} className="form-input w-full text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Memo</label>
                  <input type="text" value={payMemo} onChange={(e) => setPayMemo(e.target.value)} className="form-input w-full text-sm" placeholder="e.g. Initial deposit" />
                </div>
                <button
                  onClick={() => onRegisterPayment(payAmount, payDate, payMemo)}
                  className="btn bg-green-600 text-white hover:bg-green-700 w-full"
                >
                  <CreditCard className="w-4 h-4" /> Register Payment
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Payment Allocation by PU Category</h2>
          </header>
          <div className="p-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <CategoryBadge category="physical" /> Physical assets
              </span>
              <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">{formatCurrency(physicalSub)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <CategoryBadge category="contract" /> Contracts & deposits
              </span>
              <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">{formatCurrency(contractSub)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">VAT collected</span>
              <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">{formatCurrency(tax)}</span>
            </div>
            {contractSub > 0 && (
              <div className="mt-3 px-3 py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                <strong className="font-semibold">Deposit note:</strong> A portion of the Contract amount is booked as a <strong className="font-semibold">liability</strong>, not revenue. Refundable on contract termination.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function StepInvoice({
  order,
  onCreateInvoice,
  onConfirmInvoice,
}: {
  order: OrderEntity
  onCreateInvoice: () => void
  onConfirmInvoice: (invoiceId: string) => void
}) {
  const invoice = order.invoices[0]

  return (
    <>
      {invoice && (
        <StatusBanner
          variant="info"
          title={`Invoice ${invoice.name} Created`}
          description={`Converted from ${order.name} · ${order.lines.length} Product-Unit lines`}
        />
      )}

      {!invoice && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 mb-4 p-5 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            No invoice has been created for this order yet.
          </p>
          <button onClick={onCreateInvoice} className="btn bg-violet-600 text-white hover:bg-violet-700">
            <FileCheck className="w-4 h-4" /> Create Invoice
          </button>
        </div>
      )}

      {invoice && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 mb-4">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Invoice Document</h2>
            <div className="flex gap-2">
              <button className="btn text-sm border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300">
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
              {invoice.state === 'draft' && (
                <button
                  onClick={() => onConfirmInvoice(invoice.id)}
                  className="btn text-sm bg-green-600 text-white hover:bg-green-700"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Post Invoice
                </button>
              )}
              <button className="btn text-sm bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                <Mail className="w-3.5 h-3.5" /> Email to Customer
              </button>
            </div>
          </header>

          <div className="p-8 bg-gray-50 dark:bg-gray-900/30 flex justify-center">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 max-w-2xl w-full shadow-md">
              <div className="flex justify-between items-start mb-7">
                <div>
                  <h2 className="text-xl font-black text-gray-800 dark:text-gray-100">INVOICE</h2>
                  <div className="text-sm tabular-nums text-gray-600 dark:text-gray-300">{invoice.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-gray-800 dark:text-gray-100">OVES Energy</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Mombasa Road, Nairobi<br />sales@oves.energy</div>
                </div>
              </div>

              <div className="flex justify-between mb-6 gap-4">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Bill To</div>
                  <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">{order.partnerName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {order.contactPerson && <>Attn: {order.contactPerson}<br /></>}
                  </div>
                </div>
                <div className="text-right text-xs space-y-0.5">
                  <div><span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">Date</span> <span className="text-gray-600 dark:text-gray-300 ml-1">{invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span></div>
                  <div><span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">SO</span> <span className="tabular-nums text-gray-800 dark:text-gray-100 ml-1">{order.name}</span></div>
                  <div><span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">Status</span>{' '}
                  <span className={`font-bold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                    {order.paymentStatus === 'paid' ? 'PAID' : order.paymentStatus === 'partial' ? 'PARTIAL' : 'UNPAID'}
                  </span></div>
                </div>
              </div>

              <LinesTable lines={order.lines} />

              <div className="mt-4 px-5 py-4">
                <OrderSummary lines={order.lines} />
              </div>

              {order.paymentStatus === 'paid' && (
                <div className="mt-4 text-right space-y-1 text-sm">
                  <div className="text-green-600 dark:text-green-400 font-semibold">
                    Paid{order.payments[0]?.paymentMethod ? ` (${order.payments[0].paymentMethod})` : ''}: -{formatCurrency(order.paidAmount)}
                  </div>
                  <div className="font-extrabold text-green-600 dark:text-green-400">
                    Amount Due: {formatCurrency(0)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Complete Order Timeline</h2>
        </header>
        <div className="p-5">
          <ActivityTimeline events={order.timeline} />
        </div>
      </div>
    </>
  )
}

// ============================================================================
// Main detail page
// ============================================================================

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { alert } = useAlert()
  const id = params.id as string
  const numericId = parseInt(id, 10)

  const { data, loading, error, refetch } = useQuery<{ order: { order: OrderEntity } }>(
    ORDER_QUERY,
    { variables: { id: numericId }, skip: isNaN(numericId) },
  )

  const order = data?.order?.order ?? null
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    if (order) setActiveStep(getOrderStepIndex(order))
  }, [order])

  const [sendOrder] = useMutation(SEND_ORDER_MUTATION)
  const [confirmOrder] = useMutation(CONFIRM_ORDER_MUTATION)
  const [requestApproval] = useMutation(REQUEST_APPROVAL_MUTATION)
  const [approveOrder] = useMutation(APPROVE_ORDER_MUTATION)
  const [rejectOrder] = useMutation(REJECT_ORDER_MUTATION)
  const [createInvoice] = useMutation(CREATE_INVOICE_MUTATION)
  const [confirmInvoice] = useMutation(CONFIRM_INVOICE_MUTATION)
  const [registerPayment] = useMutation(REGISTER_PAYMENT_MUTATION)
  const [fetchProformaPdf] = useLazyQuery(GET_PROFORMA_PDF)

  const handleMutation = useCallback(
    async (
      mutationFn: (opts: any) => Promise<any>,
      variables: Record<string, any>,
      successMsg: string,
    ) => {
      try {
        await mutationFn({ variables })
        alert({ text: successMsg, type: 'success' })
        await refetch()
      } catch (err: any) {
        alert({ text: err?.message ?? 'Operation failed', type: 'error' })
      }
    },
    [alert, refetch],
  )

  const handleSend = useCallback(() => {
    handleMutation(sendOrder, { orderId: numericId }, 'Quotation sent to customer.')
  }, [handleMutation, sendOrder, numericId])

  const handleConfirm = useCallback(() => {
    handleMutation(confirmOrder, { orderId: numericId }, 'Order confirmed.')
  }, [handleMutation, confirmOrder, numericId])

  const handleRequestApproval = useCallback(() => {
    handleMutation(requestApproval, { orderId: numericId }, 'Approval request submitted.')
  }, [handleMutation, requestApproval, numericId])

  const handleApprove = useCallback(
    (notes: string) => {
      handleMutation(approveOrder, { orderId: numericId, input: { notes } }, 'Order approved.')
    },
    [handleMutation, approveOrder, numericId],
  )

  const handleReject = useCallback(
    (notes: string) => {
      handleMutation(rejectOrder, { orderId: numericId, input: { notes } }, 'Order rejected.')
    },
    [handleMutation, rejectOrder, numericId],
  )

  const handleCreateInvoice = useCallback(() => {
    handleMutation(createInvoice, { orderId: numericId }, 'Invoice created.')
  }, [handleMutation, createInvoice, numericId])

  const handleConfirmInvoice = useCallback(
    (invoiceId: string) => {
      handleMutation(
        confirmInvoice,
        { orderId: numericId, invoiceId: parseInt(invoiceId, 10) },
        'Invoice posted.',
      )
    },
    [handleMutation, confirmInvoice, numericId],
  )

  const handleRegisterPayment = useCallback(
    (amount: number, paymentDate: string, memo: string) => {
      handleMutation(
        registerPayment,
        { orderId: numericId, input: { amount, paymentDate, memo } },
        'Payment registered.',
      )
    },
    [handleMutation, registerPayment, numericId],
  )

  const handleDownloadPdf = useCallback(async () => {
    try {
      const { data: pdfData } = await fetchProformaPdf({ variables: { orderId: numericId } })
      const pdf = pdfData?.proformaPdf
      if (pdf?.base64) {
        const link = document.createElement('a')
        link.href = `data:${pdf.contentType};base64,${pdf.base64}`
        link.download = pdf.filename
        link.click()
      }
    } catch (err: any) {
      alert({ text: err?.message ?? 'Failed to download PDF', type: 'error' })
    }
  }, [fetchProformaPdf, numericId, alert])

  const handleStepAction = useCallback(
    async (nextStep: number) => {
      switch (activeStep) {
        case 0:
          await handleSend()
          break
        case 2:
          await handleConfirm()
          break
        case 3:
          await handleRequestApproval()
          break
        default:
          setActiveStep(nextStep)
          break
      }
    },
    [activeStep, handleSend, handleConfirm, handleRequestApproval],
  )

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        <div className="text-gray-400 dark:text-gray-500 py-12 text-center">Loading…</div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/portal" className="hover:text-violet-500">Portal</Link>
          <span className="mx-2">/</span>
          <Link href="/portal/orders" className="hover:text-violet-500">Orders</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 dark:text-gray-100 font-medium">Not Found</span>
        </nav>
        <div className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error?.message ?? 'Order not found.'}
        </div>
      </div>
    )
  }

  const stateLabel: Record<string, { label: string; cls: string }> = {
    draft: { label: 'Draft', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
    sent: { label: 'Sent', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
    sale: { label: 'Confirmed', cls: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
    done: { label: 'Done', cls: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300' },
    cancel: { label: 'Cancelled', cls: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  }
  const st = stateLabel[order.state] ?? stateLabel.draft

  const stepPanels = [
    <StepQuotation key="0" order={order} />,
    <StepSend key="1" order={order} onSend={handleSend} />,
    <StepRevise key="2" order={order} onConfirm={handleConfirm} />,
    <StepProforma key="3" order={order} onDownloadPdf={handleDownloadPdf} />,
    <StepApproval key="4" order={order} onRequestApproval={handleRequestApproval} onApprove={handleApprove} onReject={handleReject} />,
    <StepPayment key="5" order={order} onRegisterPayment={handleRegisterPayment} />,
    <StepInvoice key="6" order={order} onCreateInvoice={handleCreateInvoice} onConfirmInvoice={handleConfirmInvoice} />,
  ]

  const stepActions: { backLabel: string; nextLabel: string; nextVariant?: string }[] = [
    { backLabel: '', nextLabel: 'Send Quotation' },
    { backLabel: 'Quotation', nextLabel: 'Customer Responds' },
    { backLabel: 'Send to Customer', nextLabel: 'Confirm Order' },
    { backLabel: 'Revise & Confirm', nextLabel: 'Submit for Approval' },
    { backLabel: 'Proforma Invoice', nextLabel: 'Send PI & Collect Payment' },
    { backLabel: 'Approval', nextLabel: 'Create Final Invoice' },
    { backLabel: 'Payment', nextLabel: 'Order Complete', nextVariant: 'green' },
  ]

  const sa = stepActions[activeStep]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/portal" className="hover:text-violet-500">Portal</Link>
        <span className="mx-2">/</span>
        <Link href="/portal/orders" className="hover:text-violet-500">Orders</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-100 font-medium">{order.name}</span>
      </nav>

      {/* Header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-5">
        <div>
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            {PIPELINE_STEPS[activeStep]?.label ?? 'Order'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {order.partnerName} · {order.name}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.cls}`}>
            {st.label}
          </span>
          <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">{order.name}</span>
        </div>
      </div>

      {/* Pipeline */}
      <StepPipeline
        steps={PIPELINE_STEPS}
        currentStep={activeStep}
        onStepClick={(i) => setActiveStep(i)}
      />

      {/* Active panel */}
      <div className="animate-in fade-in duration-200">
        {stepPanels[activeStep]}
      </div>

      {/* Step navigation */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/60">
        <div>
          {activeStep > 0 && (
            <button
              className="btn border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
              onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
            >
              &larr; {sa.backLabel || 'Back'}
            </button>
          )}
        </div>
        <div>
          {activeStep < 6 ? (
            <button
              className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
              onClick={() => handleStepAction(Math.min(6, activeStep + 1))}
            >
              {sa.nextLabel} &rarr;
            </button>
          ) : (
            <button
              className="btn bg-green-600 text-white hover:bg-green-700"
              onClick={() => {
                alert({ text: 'Order complete!', type: 'success' })
                router.push('/portal/orders')
              }}
            >
              <CheckCircle2 className="w-4 h-4" /> {sa.nextLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
