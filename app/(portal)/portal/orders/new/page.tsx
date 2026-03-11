'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, X, Users, Package, CheckCircle2, Loader2 } from 'lucide-react'
import StepPipeline from '@/components/step-pipeline'
import ComboboxSearch from '@/components/combobox-search'
import { useAlert } from '@/app/contexts/alertContext'
import { getContacts, getProducts, type OdooContact, type OdooProduct, type ContactsListApiResponse, type ProductsListApiResponse } from '@/lib/odoo-api'
import { getSalesToken } from '@/lib/odoo-auth'
import {
  createQuotation,
  getOrder as fetchOrderDetail,
  sendOrder as restSendOrder,
  confirmOrder as restConfirmOrder,
  requestApproval as restRequestApproval,
  approveOrder as restApproveOrder,
  rejectOrder as restRejectOrder,
  registerPayment as restRegisterPayment,
  getProformaPdf,
  sendProformaPdf,
} from '@/lib/portal/order-api'
import { formatCurrency } from '@/lib/portal/mock-orders'
import { PIPELINE_STEPS, getOrderStepIndex, STEP_ACTIONS } from '@/lib/portal/order-constants'
import { StepRevise, StepApproval, StepPayment, StepInvoice } from '@/components/order-steps'
import { CategoryBadge, CustomerInfoRow, CustomerInfoRowSkeleton, StepContentSkeleton } from '@/components/order-shared'
import type {
  CustomerEntity,
  ProductUnitEntity,
  OrderEntity,
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
// Local types
// ============================================================================

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

const DROPDOWN_PAGE_SIZE = 10

export default function CreateOrderPage() {
  const router = useRouter()
  const { alert } = useAlert()

  // ── Post-creation workflow state ──
  const [createdOrder, setCreatedOrder] = useState<OrderEntity | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [backendStep, setBackendStep] = useState(0)
  const [orderLoading, setOrderLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // ── Create-mode form state ──
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerEntity | null>(null)
  const [lines, setLines] = useState<OrderLine[]>([])
  const [creating, setCreating] = useState(false)

  // ── Customer combobox with infinite scroll ──
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState('')
  const [customerPage, setCustomerPage] = useState(1)
  const [accumulatedCustomers, setAccumulatedCustomers] = useState<CustomerEntity[]>([])
  const [customersLoading, setCustomersLoading] = useState(false)
  const [customerHasMore, setCustomerHasMore] = useState(false)
  const prevCustomerSearchRef = useRef(debouncedCustomerSearch)

  // ── Product combobox with infinite scroll ──
  const [productDropdownOpen, setProductDropdownOpen] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [debouncedProductSearch, setDebouncedProductSearch] = useState('')
  const [productPage, setProductPage] = useState(1)
  const [accumulatedProducts, setAccumulatedProducts] = useState<ProductUnitEntity[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productHasMore, setProductHasMore] = useState(false)
  const prevProductSearchRef = useRef(debouncedProductSearch)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedCustomerSearch(customerSearch), 300)
    return () => clearTimeout(t)
  }, [customerSearch])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedProductSearch(productSearch), 300)
    return () => clearTimeout(t)
  }, [productSearch])

  useEffect(() => {
    if (prevCustomerSearchRef.current !== debouncedCustomerSearch) {
      setCustomerPage(1)
      setAccumulatedCustomers([])
      prevCustomerSearchRef.current = debouncedCustomerSearch
    }
  }, [debouncedCustomerSearch])

  useEffect(() => {
    if (prevProductSearchRef.current !== debouncedProductSearch) {
      setProductPage(1)
      setAccumulatedProducts([])
      prevProductSearchRef.current = debouncedProductSearch
    }
  }, [debouncedProductSearch])

  const handleCustomerOpenChange = useCallback((open: boolean) => {
    setCustomerDropdownOpen(open)
    if (!open) {
      setCustomerPage(1)
      setAccumulatedCustomers([])
    }
  }, [])

  const handleProductOpenChange = useCallback((open: boolean) => {
    setProductDropdownOpen(open)
    if (!open) {
      setProductPage(1)
      setAccumulatedProducts([])
    }
  }, [])

  // ── Fetch customers via REST ──
  useEffect(() => {
    if (!customerDropdownOpen || !!createdOrder) return
    let cancelled = false
    const fetchData = async () => {
      setCustomersLoading(true)
      try {
        const token = getSalesToken()
        const result: ContactsListApiResponse = await getContacts(
          { q: debouncedCustomerSearch || undefined, page: customerPage, limit: DROPDOWN_PAGE_SIZE },
          token || undefined,
        )
        if (cancelled) return
        const mapped = result.contacts.map(mapContact)
        setAccumulatedCustomers((prev) => customerPage === 1 ? mapped : [...prev, ...mapped])
        setCustomerHasMore(result.pagination.has_next_page)
      } catch {
        if (!cancelled) setCustomerHasMore(false)
      } finally {
        if (!cancelled) setCustomersLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [customerDropdownOpen, debouncedCustomerSearch, customerPage, createdOrder])

  // ── Fetch products via REST ──
  useEffect(() => {
    if (!productDropdownOpen || !!createdOrder) return
    let cancelled = false
    const fetchData = async () => {
      setProductsLoading(true)
      try {
        const token = getSalesToken()
        const result: ProductsListApiResponse = await getProducts(
          { search: debouncedProductSearch || undefined, page: productPage, limit: DROPDOWN_PAGE_SIZE, active: true },
          token || undefined,
        )
        if (cancelled) return
        const mapped = result.products.map(mapProduct)
        setAccumulatedProducts((prev) => productPage === 1 ? mapped : [...prev, ...mapped])
        setProductHasMore(result.pagination.has_next_page)
      } catch {
        if (!cancelled) setProductHasMore(false)
      } finally {
        if (!cancelled) setProductsLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [productDropdownOpen, debouncedProductSearch, productPage, createdOrder])

  const customerLoadingMore = customersLoading && customerPage > 1
  const customerLoadingInitial = customersLoading && customerPage === 1

  const productLoadingMore = productsLoading && productPage > 1
  const productLoadingInitial = productsLoading && productPage === 1

  const handleCustomerLoadMore = useCallback(() => {
    if (!customersLoading && customerHasMore) {
      setCustomerPage((p) => p + 1)
    }
  }, [customersLoading, customerHasMore])

  const handleProductLoadMore = useCallback(() => {
    if (!productsLoading && productHasMore) {
      setProductPage((p) => p + 1)
    }
  }, [productsLoading, productHasMore])

  const physicalLines = lines.filter((l) => l.puCategory === 'physical')
  const contractLines = lines.filter((l) => l.puCategory !== 'physical')

  const summary = useMemo(() => {
    const physicalSubtotal = physicalLines.reduce((s, l) => s + l.priceUnit * l.quantity, 0)
    const contractSubtotal = contractLines.reduce((s, l) => s + l.priceUnit * l.quantity, 0)
    const subtotal = physicalSubtotal + contractSubtotal
    const total = subtotal
    return { physicalSubtotal, contractSubtotal, subtotal, total }
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

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      alert({ text: 'Please select a customer.', type: 'error' })
      return
    }
    if (lines.length === 0) {
      alert({ text: 'Add at least one product line.', type: 'error' })
      return
    }

    setCreating(true)
    try {
      const quotationResult = await createQuotation({
        customer_id: Number(selectedCustomer.id),
        products: lines.map((l) => ({
          product_id: l.productId,
          quantity: l.quantity,
          price_unit: l.priceUnit,
          description: l.description ?? undefined,
        })),
      })

      if (!quotationResult.success || !quotationResult.order?.id) {
        alert({ text: quotationResult.message ?? 'Failed to create quotation.', type: 'error' })
        setCreating(false)
        return
      }

      const orderId = Number(quotationResult.order.id)

      alert({ text: 'Quotation created successfully.', type: 'success' })

      // Immediately transition to workflow view using creation response data
      setCreatedOrder(quotationResult.order)
      setBackendStep(1)
      setActiveStep(1)
      setCreating(false)
      window.history.replaceState(null, '', `/portal/orders/${orderId}`)

      // Fire send in the background — don't let it block the detail fetch
      setOrderLoading(true)
      const sendPromise = restSendOrder(orderId).catch(() => {})

      try {
        const freshOrder = await fetchOrderDetail(orderId)
        const step = Math.max(1, getOrderStepIndex(freshOrder))
        setCreatedOrder(freshOrder)
        setBackendStep(step)
        setActiveStep(step)
      } catch {
        /* keep initial order data on failure */
      } finally {
        setOrderLoading(false)
      }

      // Once send completes, silently refresh to pick up post-send state
      sendPromise.then(async () => {
        try {
          const postSendOrder = await fetchOrderDetail(orderId)
          const postStep = Math.max(1, getOrderStepIndex(postSendOrder))
          setCreatedOrder(postSendOrder)
          setBackendStep(postStep)
          setActiveStep(postStep)
        } catch {}
      })
    } catch (err: any) {
      alert({ text: err?.message ?? 'Failed to create order.', type: 'error' })
      setCreating(false)
    }
  }

  // ── Post-creation: REST mutation helpers ──

  const orderId = createdOrder ? Number(createdOrder.id) : null

  const refreshOrder = useCallback(async (minStep?: number) => {
    if (!orderId) return
    try {
      const fresh = await fetchOrderDetail(orderId)
      setCreatedOrder(fresh)
      const step = Math.max(minStep ?? 1, getOrderStepIndex(fresh))
      setBackendStep(step)
      setActiveStep(step)
    } catch { /* keep local state */ }
  }, [orderId])

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

  const handleConfirm = useCallback(() => {
    if (!orderId) return
    return handleRestAction(
      async () => {
        await restConfirmOrder(orderId)
        await restRequestApproval(orderId)
      },
      'Order confirmed & submitted for approval.',
      2,
    )
  }, [handleRestAction, orderId])

  const handleRequestApproval = useCallback(() => {
    if (!orderId) return
    return handleRestAction(() => restRequestApproval(orderId), 'Approval request submitted.', 3)
  }, [handleRestAction, orderId])

  const handleApprove = useCallback(
    (notes: string) => {
      if (!orderId) return
      return handleRestAction(() => restApproveOrder(orderId, notes), 'Order approved.')
    },
    [handleRestAction, orderId],
  )

  const handleReject = useCallback(
    (notes: string) => {
      if (!orderId) return
      return handleRestAction(() => restRejectOrder(orderId, notes), 'Order rejected.')
    },
    [handleRestAction, orderId],
  )

  const handleRegisterPayment = useCallback(
    async (amount: number, paymentDate: string, memo: string) => {
      if (!orderId) return
      setActionLoading(true)
      try {
        const result = await restRegisterPayment(orderId, amount, memo)
        alert({ text: 'Payment registered.', type: 'success' })

        let updated: OrderEntity
        try {
          const fresh = await fetchOrderDetail(orderId)
          updated = fresh
        } catch {
          updated = { ...createdOrder! }
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

        setCreatedOrder(updated)
        const computed = getOrderStepIndex(updated)
        setBackendStep(computed)
        setActiveStep(computed)
      } catch (err: any) {
        alert({ text: err?.message ?? 'Operation failed', type: 'error' })
      } finally {
        setActionLoading(false)
      }
    },
    [orderId, alert, createdOrder],
  )

  const handleDownloadPdf = useCallback(async () => {
    if (!orderId) return
    try {
      const pdf = await getProformaPdf(orderId)
      if (pdf?.base64) {
        const link = document.createElement('a')
        link.href = `data:${pdf.contentType};base64,${pdf.base64}`
        link.download = pdf.filename
        link.click()
      }
    } catch (err: any) {
      alert({ text: err?.message ?? 'Failed to download PDF', type: 'error' })
    }
  }, [orderId, alert])

  const handleSendProforma = useCallback(async () => {
    if (!orderId) return
    const res = await sendProformaPdf(orderId)
    if (!res.success) throw new Error(res.message ?? 'Failed to send proforma')
    alert({ text: 'Proforma invoice sent to customer.', type: 'success' })
  }, [orderId, alert])

  const handleStepAction = useCallback(
    async () => {
      switch (backendStep) {
        case 1:
          await handleConfirm()
          break
        default:
          await refreshOrder()
          break
      }
    },
    [backendStep, handleConfirm, handleRequestApproval, refreshOrder],
  )

  const isViewingPastStep = createdOrder ? activeStep < backendStep : false

  // ── Workflow mode (after creation) ──
  if (createdOrder) {
    const stateLabel: Record<string, { label: string; cls: string }> = {
      draft: { label: 'Draft', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
      sent: { label: 'Sent', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
      sale: { label: 'Confirmed', cls: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
      done: { label: 'Done', cls: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300' },
      cancel: { label: 'Cancelled', cls: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
    }
    const st = stateLabel[createdOrder.state] ?? stateLabel.draft

    const renderActiveStep = () => {
      switch (activeStep) {
        case 1: return <StepRevise order={createdOrder} onConfirm={handleConfirm} readOnly={isViewingPastStep} />
        case 2: return <StepApproval order={createdOrder} onRequestApproval={handleRequestApproval} onApprove={handleApprove} onReject={handleReject} onDownloadPdf={handleDownloadPdf} onSendProforma={handleSendProforma} />
        case 3: return <StepPayment order={createdOrder} onRegisterPayment={handleRegisterPayment} />
        case 4: return <StepInvoice order={createdOrder} />
        default: return null
      }
    }

    const sa = STEP_ACTIONS[activeStep]
    const needsFullPayment = activeStep === 3 && createdOrder.paymentStatus !== 'paid'
    const nextDisabled = actionLoading || needsFullPayment

    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/portal" className="hover:text-violet-500">Portal</Link>
          <span className="mx-2">/</span>
          <Link href="/portal/orders" className="hover:text-violet-500">Orders</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 dark:text-gray-100 font-medium">{createdOrder.name}</span>
        </nav>

        <div className="sm:flex sm:justify-between sm:items-center mb-5">
          <div>
            <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
              {PIPELINE_STEPS[activeStep]?.label ?? 'Order'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {createdOrder.partnerName} · {createdOrder.name}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-3 sm:mt-0">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.cls}`}>
              {st.label}
            </span>
            <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">{createdOrder.name}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 px-5 pt-5 pb-2 mb-6">
          <StepPipeline
            steps={PIPELINE_STEPS}
            currentStep={activeStep}
            maxStep={backendStep}
            onStepClick={(i) => { if (i > 0) setActiveStep(i) }}
          />
        </div>

        <div className="animate-in fade-in duration-200">
          {orderLoading ? <StepContentSkeleton rowCount={lines.length || 3} /> : renderActiveStep()}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/60">
          <div>
            {activeStep > 1 && (
              <button
                className="btn border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
                onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
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

  // ── Create mode (before creation) ──

  const renderComboboxCustomerItem = (c: CustomerEntity) => (
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
  )

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
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            Create Quotation
          </h1>
        </div>
        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          <span className="btn border-gray-200 dark:border-gray-700/60 text-gray-500 dark:text-gray-400 cursor-default">
            Draft
          </span>
        </div>
      </div>

      {/* Pipeline */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 px-5 pt-5 pb-2 mb-6">
        <StepPipeline steps={PIPELINE_STEPS} currentStep={0} />
      </div>

      {/* Single form card */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">

        {/* Customer section */}
        <div className="border-b border-gray-100 dark:border-gray-700/60">
          <header className="px-5 py-3 bg-gray-50 dark:bg-gray-900/20 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/40">
                <Users className="w-4 h-4 text-violet-600 dark:text-violet-300" />
              </div>
              Customer
            </h2>
            <ComboboxSearch<CustomerEntity>
              triggerLabel={selectedCustomer ? 'Change Customer' : 'Select Customer'}
              triggerIcon={<Users className="w-4 h-4" />}
              triggerClassName="btn text-sm border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300 min-w-[10rem] justify-center"
              searchPlaceholder="Search by name or email…"
              value={customerSearch}
              onChange={setCustomerSearch}
              items={accumulatedCustomers}
              isLoading={customerLoadingInitial}
              emptyMessage="No customers found"
              onSelect={handleSelectCustomer}
              onOpenChange={handleCustomerOpenChange}
              align="right"
              dropdownClassName="w-80"
              renderItem={renderComboboxCustomerItem}
              onLoadMore={handleCustomerLoadMore}
              hasMore={customerHasMore}
              isLoadingMore={customerLoadingMore}
            />
          </header>

          <div className="px-5 py-4">
            {selectedCustomer ? (
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <CustomerInfoRow
                    name={selectedCustomer.name}
                    email={selectedCustomer.email}
                    phone={selectedCustomer.phone || selectedCustomer.mobile}
                    isCompany={selectedCustomer.isCompany}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleClearCustomer}
                  className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:text-red-400/70 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors shrink-0"
                  title="Clear customer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <CustomerInfoRowSkeleton />
            )}
          </div>
        </div>

        {/* Product lines section */}
        <header className="px-5 py-3 bg-gray-50 dark:bg-gray-900/20 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/40">
              <Package className="w-4 h-4 text-violet-600 dark:text-violet-300" />
            </div>
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
            triggerClassName="btn text-sm border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300 min-w-[10rem] justify-center"
            searchPlaceholder="Search products…"
            value={productSearch}
            onChange={setProductSearch}
            items={accumulatedProducts}
            isLoading={productLoadingInitial}
            emptyMessage="No products found"
            onSelect={handleAddProduct}
            onOpenChange={handleProductOpenChange}
            align="right"
            dropdownClassName="w-96"
            onLoadMore={handleProductLoadMore}
            hasMore={productHasMore}
            isLoadingMore={productLoadingMore}
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
                  <tr key={line.tempId} className="border-b border-gray-100 dark:border-gray-700/60">
                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-sm text-gray-400">
                      {idx + 1}
                    </td>
                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                      <div className="font-medium text-sm text-gray-800 dark:text-gray-100">
                        {line.productName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {line.sku}
                      </div>
                    </td>
                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                      <CategoryBadge category={line.puCategory} />
                    </td>
                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-sm tabular-nums text-gray-600 dark:text-gray-300">
                      {line.puMetric}
                      {line.durationMonths && (
                        <div className="text-xs text-gray-400">{line.durationMonths} Months</div>
                      )}
                    </td>
                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.priceUnit}
                        onChange={(e) => handleLineChange(line.tempId, 'priceUnit', parseFloat(e.target.value) || 0)}
                        className="form-input w-24 text-right text-sm tabular-nums py-1"
                      />
                    </td>
                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-right">
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) => handleLineChange(line.tempId, 'quantity', parseInt(e.target.value) || 1)}
                        className="form-input w-16 text-right text-sm tabular-nums py-1"
                      />
                    </td>
                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-right font-semibold text-sm tabular-nums text-gray-800 dark:text-gray-100">
                      {formatCurrency(line.priceUnit * line.quantity)}
                    </td>
                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
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
              <div className="flex justify-between text-base border-t-2 border-gray-800 dark:border-gray-200 pt-2 mt-1.5">
                <span className="font-bold text-gray-800 dark:text-gray-100">Total</span>
                <span className="font-extrabold text-green-600 dark:text-green-400 tabular-nums">
                  {formatCurrency(summary.total)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
          <Link
            href="/portal/orders"
            className="btn border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
          >
            Cancel
          </Link>
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
