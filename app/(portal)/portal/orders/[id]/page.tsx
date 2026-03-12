'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, X, Users, Package, Loader2 } from 'lucide-react'
import StepPipeline from '@/components/step-pipeline'
import ComboboxSearch from '@/components/combobox-search'
import { useAlert } from '@/app/contexts/alertContext'
import { getContacts, getProducts, type OdooContact, type OdooProduct } from '@/lib/odoo-api'
import { getSalesToken } from '@/lib/odoo-auth'
import {
  getOrder as fetchOrderDetail,
  sendOrder as restSendOrder,
  confirmOrder as restConfirmOrder,
  requestApproval as restRequestApproval,
  approveOrder as restApproveOrder,
  rejectOrder as restRejectOrder,
  registerPayment as restRegisterPayment,
  sendProformaPdf,
} from '@/lib/portal/order-api'
import { formatCurrency } from '@/lib/portal/mock-orders'
import { PIPELINE_STEPS, getOrderStepIndex, STEP_ACTIONS } from '@/lib/portal/order-constants'
import { CategoryBadge, OrderSummary, LinesTable, CustomerInfoRow } from '@/components/order-shared'
import { StepRevise, StepApproval, StepPayment, StepInvoice } from '@/components/order-steps'
import type {
  OrderEntity,
  OrderLineEntity,
  CustomerEntity,
  ProductUnitEntity,
} from '@/lib/portal/types'

// ============================================================================
// Mappers: REST snake_case -> app camelCase entities
// ============================================================================

function mapContact(c: OdooContact): CustomerEntity {
  return {
    id: String(c.id),
    name: c.name,
    email: c.email || null,
    phone: c.phone || null,
    mobile: c.mobile || null,
    street: c.street || null,
    city: c.city || null,
    zip: c.zip || null,
    isCompany: c.is_company,
    companyId: c.company_id ?? null,
    companyName: c.company_name ?? null,
    countryName: c.country_name ?? null,
    assignedEmployeeId: c.assigned_employee_id ?? null,
    assignedEmployeeName: c.assigned_employee_name ?? null,
    createdAt: c.create_date ?? null,
    updatedAt: c.write_date ?? null,
  }
}

function mapProduct(p: OdooProduct): ProductUnitEntity {
  const pid = p.product_id ?? p.id
  return {
    id: String(pid),
    name: p.name,
    sku: p.default_code || null,
    listPrice: p.list_price ?? null,
    type: p.type ?? null,
    puCategory: p.pu_category || null,
    puMetric: p.pu_metric || null,
    serviceType: p.service_type || null,
    contractType: p.contract_type || null,
    categoryName: p.category_name || null,
    companyId: Array.isArray(p.company_id) ? p.company_id[0] : null,
    companyName: Array.isArray(p.company_id) ? p.company_id[1] : null,
    currencyName: p.currency ?? null,
    recurringInvoice: p.recurring_invoice ?? null,
    saleOk: p.sale_ok ?? null,
    active: p.active ?? true,
    imageUrl: p.image_url ?? null,
    description: p.description || null,
    descriptionSale: p.description_sale || null,
    createdAt: p.create_date ?? null,
    updatedAt: p.write_date ?? null,
  }
}

// ============================================================================
// StepQuotation (kept inline — mutates order object directly)
// ============================================================================

function StepQuotation({ order }: { order: OrderEntity }) {
  const isDraft = order.state === 'draft'

  const [customerSearch, setCustomerSearch] = useState('')
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState('')
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false)
  const [customers, setCustomers] = useState<CustomerEntity[]>([])
  const [customersLoading, setCustomersLoading] = useState(false)

  const [productSearch, setProductSearch] = useState('')
  const [debouncedProductSearch, setDebouncedProductSearch] = useState('')
  const [productDropdownOpen, setProductDropdownOpen] = useState(false)
  const [products, setProducts] = useState<ProductUnitEntity[]>([])
  const [productsLoading, setProductsLoading] = useState(false)

  const [lines, setLines] = useState<OrderLineEntity[]>(order.lines)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedCustomerSearch(customerSearch), 300)
    return () => clearTimeout(t)
  }, [customerSearch])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedProductSearch(productSearch), 300)
    return () => clearTimeout(t)
  }, [productSearch])

  useEffect(() => {
    if (!isDraft || !customerDropdownOpen) return
    let cancelled = false
    const fetchData = async () => {
      setCustomersLoading(true)
      try {
        const token = getSalesToken()
        const result = await getContacts(
          { q: debouncedCustomerSearch || undefined, limit: 5 },
          token || undefined,
        )
        if (!cancelled) setCustomers(result.contacts.map(mapContact))
      } catch { /* ignore */ }
      if (!cancelled) setCustomersLoading(false)
    }
    fetchData()
    return () => { cancelled = true }
  }, [isDraft, customerDropdownOpen, debouncedCustomerSearch])

  useEffect(() => {
    if (!isDraft || !productDropdownOpen) return
    let cancelled = false
    const fetchData = async () => {
      setProductsLoading(true)
      try {
        const token = getSalesToken()
        const result = await getProducts(
          { search: debouncedProductSearch || undefined, limit: 5, active: true },
          token || undefined,
        )
        if (!cancelled) setProducts(result.products.map(mapProduct))
      } catch { /* ignore */ }
      if (!cancelled) setProductsLoading(false)
    }
    fetchData()
    return () => { cancelled = true }
  }, [isDraft, productDropdownOpen, debouncedProductSearch])

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

  return (
    <>
      {/* Customer info */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 mb-4">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            Customer
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
        <div className="px-5 py-4">
          <CustomerInfoRow
            name={order.partnerName}
            email={order.partnerEmail}
            phone={order.partnerPhone}
          />
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
              <table className="table-auto w-full dark:text-gray-300">
                <thead className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-t border-b border-gray-100 dark:border-gray-700/60">
                  <tr>
                    <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
                      <div className="font-semibold text-left">#</div>
                    </th>
                    <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                      <div className="font-semibold text-left">Product-Unit</div>
                    </th>
                    <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                      <div className="font-semibold text-left">Category</div>
                    </th>
                    <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                      <div className="font-semibold text-left">Metric</div>
                    </th>
                    <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                      <div className="font-semibold text-right">Unit Price</div>
                    </th>
                    <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                      <div className="font-semibold text-right">Qty</div>
                    </th>
                    <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                      <div className="font-semibold text-right">Subtotal</div>
                    </th>
                    <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
                  {lines.map((line, idx) => (
                    <tr key={line.id} className="border-b border-gray-100 dark:border-gray-700/60">
                      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-sm text-gray-400">{idx + 1}</td>
                      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                        <div className="font-medium text-sm text-gray-800 dark:text-gray-100">{line.productName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{line.sku}</div>
                      </td>
                      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                        <CategoryBadge category={line.puCategory} />
                      </td>
                      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-sm tabular-nums text-gray-600 dark:text-gray-300">
                        {line.puMetric}
                        {line.durationMonths && <div className="text-xs text-gray-400">{line.durationMonths} Mo</div>}
                      </td>
                      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-right">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.priceUnit}
                          onChange={(e) => handleLineChange(line.id, 'priceUnit', parseFloat(e.target.value) || 0)}
                          className="form-input w-24 text-right text-sm tabular-nums py-1"
                        />
                      </td>
                      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-right">
                        <input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) => handleLineChange(line.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="form-input w-16 text-right text-sm tabular-nums py-1"
                        />
                      </td>
                      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-right font-semibold text-sm tabular-nums text-gray-800 dark:text-gray-100">
                        {formatCurrency(line.priceUnit * line.quantity)}
                      </td>
                      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
                        <button type="button" onClick={() => handleRemoveLine(line.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
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

// ============================================================================
// Main detail page
// ============================================================================

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { alert } = useAlert()
  const id = params.id as string
  const numericId = parseInt(id, 10)

  const [order, setOrder] = useState<OrderEntity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [backendStep, setBackendStep] = useState(0)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchOrder = useCallback(async () => {
    if (isNaN(numericId)) {
      setError('Invalid order ID.')
      setLoading(false)
      return
    }
    try {
      const data = await fetchOrderDetail(numericId)
      setOrder(data)
      const step = getOrderStepIndex(data)
      setBackendStep(step)
      setActiveStep(step)
      setError(null)
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load order.')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [numericId])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  const refreshOrder = useCallback(async (minStep?: number) => {
    try {
      const fresh = await fetchOrderDetail(numericId)
      setOrder(fresh)
      const computed = getOrderStepIndex(fresh)
      const step = minStep != null ? Math.max(minStep, computed) : computed
      setBackendStep(step)
      setActiveStep(step)
    } catch { /* keep current state */ }
  }, [numericId])

  const handleRestAction = useCallback(
    async (actionFn: () => Promise<any>, successMsg: string, minStep?: number) => {
      setActionLoading(true)
      try {
        await actionFn()
        alert({ text: successMsg, type: 'success' })
        await refreshOrder(minStep)
      } catch (err: any) {
        alert({ text: err?.message ?? 'Operation failed', type: 'error' })
      } finally {
        setActionLoading(false)
      }
    },
    [alert, refreshOrder],
  )

  const handleSend = useCallback(() => {
    return handleRestAction(() => restSendOrder(numericId), 'Quotation sent to customer.', 1)
  }, [handleRestAction, numericId])

  const handleConfirm = useCallback(() => {
    return handleRestAction(
      async () => {
        await restConfirmOrder(numericId)
        await restRequestApproval(numericId)
      },
      'Order confirmed & submitted for approval.',
      2,
    )
  }, [handleRestAction, numericId])

  const handleRequestApproval = useCallback(() => {
    return handleRestAction(() => restRequestApproval(numericId), 'Approval request submitted.', 3)
  }, [handleRestAction, numericId])

  const handleApprove = useCallback(
    (notes: string) => {
      return handleRestAction(() => restApproveOrder(numericId, notes), 'Order approved.')
    },
    [handleRestAction, numericId],
  )

  const handleReject = useCallback(
    (notes: string) => {
      return handleRestAction(() => restRejectOrder(numericId, notes), 'Order rejected.')
    },
    [handleRestAction, numericId],
  )

  const handleRegisterPayment = useCallback(
    async (amount: number, paymentDate: string, memo: string) => {
      setActionLoading(true)
      try {
        const result = await restRegisterPayment(numericId, amount, memo)
        alert({ text: 'Payment registered.', type: 'success' })

        let updated: OrderEntity
        try {
          const fresh = await fetchOrderDetail(numericId)
          updated = fresh
        } catch {
          updated = { ...order! }
        }

        const newPayment = result.payment ?? {
          id: String(Date.now()),
          amount,
          paymentDate,
          memo: memo || null,
          paymentMethod: null,
          transactionRef: null,
        }
        const alreadyIncluded = updated.payments.some(
          (p) => p.amount === newPayment.amount && p.paymentDate === newPayment.paymentDate,
        )
        if (!alreadyIncluded) {
          updated.payments = [...updated.payments, newPayment]
        }

        if (result.orderPaymentStatus) {
          updated.paymentStatus = result.orderPaymentStatus
        }
        if (result.paidAmount != null) updated.paidAmount = result.paidAmount
        if (result.remainingAmount != null) updated.remainingAmount = result.remainingAmount

        setOrder(updated)
        const computed = getOrderStepIndex(updated)
        setBackendStep(computed)
        setActiveStep(computed)
      } catch (err: any) {
        alert({ text: err?.message ?? 'Operation failed', type: 'error' })
      } finally {
        setActionLoading(false)
      }
    },
    [numericId, alert, order],
  )

  const handleSendProforma = useCallback(async () => {
    const res = await sendProformaPdf(numericId)
    if (!res.success) throw new Error(res.message ?? 'Failed to send proforma')
    alert({ text: 'Proforma invoice sent to customer.', type: 'success' })
  }, [numericId, alert])

  const handleStepAction = useCallback(
    async () => {
      switch (backendStep) {
        case 0:
          await handleSend()
          break
        case 1:
          await handleConfirm()
          break
        case 3:
          setActiveStep(4)
          setBackendStep(4)
          break
        default:
          await refreshOrder()
          break
      }
    },
    [backendStep, handleSend, handleConfirm, refreshOrder],
  )

  const isViewingPastStep = activeStep < backendStep

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
          {error ?? 'Order not found.'}
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

  const renderActiveStep = () => {
    switch (activeStep) {
      case 0: return <StepQuotation order={order} />
      case 1: return <StepRevise order={order} onConfirm={handleConfirm} readOnly={isViewingPastStep} />
      case 2: return <StepApproval order={order} onRequestApproval={handleRequestApproval} onApprove={handleApprove} onReject={handleReject} onSendProforma={handleSendProforma} />
      case 3: return <StepPayment order={order} onRegisterPayment={handleRegisterPayment} />
      case 4: return <StepInvoice order={order} />
      default: return null
    }
  }

  const sa = STEP_ACTIONS[activeStep]
  const needsFullPayment = activeStep === 3 && order.paymentStatus !== 'paid'
  const nextDisabled = actionLoading || needsFullPayment

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
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 px-5 pt-5 pb-2 mb-6">
        <StepPipeline
          steps={PIPELINE_STEPS}
          currentStep={activeStep}
          maxStep={backendStep}
          onStepClick={setActiveStep}
        />
      </div>

      {/* Active panel */}
      <div className="animate-in fade-in duration-200">
        {renderActiveStep()}
      </div>

      {/* Step navigation */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/60">
        <div>
          {activeStep > 0 && (
            <button
              className="btn border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            >
              &larr; {PIPELINE_STEPS[activeStep - 1]?.label || 'Back'}
            </button>
          )}
        </div>
        <div>
          {isViewingPastStep ? (
            <button
              className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
              onClick={() => setActiveStep(activeStep + 1)}
            >
              {PIPELINE_STEPS[activeStep + 1]?.label ?? 'Next'} &rarr;
            </button>
          ) : activeStep < 4 && sa.nextLabel ? (
            <div className="flex items-center gap-3">
              {needsFullPayment && (
                <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">Full payment required</span>
              )}
              <button
                className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleStepAction}
                disabled={nextDisabled}
              >
                {actionLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing&hellip;</>
                ) : (
                  <>{sa.nextLabel} &rarr;</>
                )}
              </button>
            </div>
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
