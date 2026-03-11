'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Pencil,
  Send,
  CheckCircle2,
  CreditCard,
  Mail,
  Download,
  ShieldCheck,
  Clock,
  FileText,
  X,
} from 'lucide-react'
import Image from 'next/image'
import CompanyLogo from '@/components/ui/image.jpeg'
import ActivityTimeline from '@/components/activity-timeline'
import StatusBanner from '@/components/status-banner'
import { useAlert } from '@/app/contexts/alertContext'
import { getSalesUser } from '@/lib/odoo-auth'
import { formatCurrency } from '@/lib/portal/mock-orders'
import { CategoryBadge, OrderSummary, LinesTable } from '@/components/order-shared'
import type { OrderEntity, OrderLineEntity } from '@/lib/portal/types'

export function StepSend({ order, onSend }: { order: OrderEntity; onSend: () => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Send className="w-4 h-4 text-violet-500" /> Send Quotation
          </h2>
        </header>

        <div className="p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Customer</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{order.partnerName}</span>
            </div>
            <div>
              <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Email</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">{order.partnerEmail || '—'}</span>
            </div>
            <div>
              <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Order</span>
              <span className="text-sm tabular-nums text-gray-800 dark:text-gray-100">{order.name}</span>
            </div>
            <div>
              <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Total</span>
              <span className="text-sm font-semibold tabular-nums text-green-600 dark:text-green-400">{formatCurrency(order.amountTotal)}</span>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-300">
            <p>
              The quotation with <strong>{order.lines.length}</strong> product-unit line{order.lines.length !== 1 ? 's' : ''} will be sent to <strong>{order.partnerName}</strong>.
            </p>
          </div>

          <button
            onClick={onSend}
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white w-full"
          >
            <Send className="w-4 h-4" /> Send to Customer
          </button>
        </div>
      </div>

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

export function StepRevise({ order, onConfirm, readOnly }: { order: OrderEntity; onConfirm: () => void; readOnly?: boolean }) {
  const [lines, setLines] = useState(
    order.lines.map((l) => ({ ...l }))
  )

  useEffect(() => {
    setLines(order.lines.map((l) => ({ ...l })))
  }, [order])

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

  const displayLines = readOnly ? order.lines : lines

  const isRejected = order.approvalStatus === 'rejected'

  return (
    <>
      {isRejected && !readOnly && order.approval && (
        <StatusBanner
          variant="danger"
          title={`Rejected by ${order.approval.approvedBy ?? 'Approver'}`}
          description={
            [
              order.approval.approvedAt
                ? `on ${new Date(order.approval.approvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                : null,
              order.approval.notes ? `Reason: "${order.approval.notes}"` : null,
            ]
              .filter(Boolean)
              .join('. ') + '. Please revise and re-confirm the order.'
          }
        />
      )}

      {!readOnly && !isRejected && (
        <div className="flex items-center gap-3 px-5 py-3.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl mb-4 text-sm text-violet-700 dark:text-violet-300">
          <Pencil className="w-5 h-5 shrink-0" />
          <p>
            Quotation is <strong>fully editable</strong>. Update quantities, prices, and terms
            directly in the table below. Click <strong>Confirm Order</strong> when ready to lock as
            a Sales Order.
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">
            Product-Unit Lines
          </h2>
          {readOnly && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              Read-only
            </span>
          )}
        </header>
        {readOnly ? (
          <>
            <LinesTable lines={displayLines} />
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700/60">
              <OrderSummary lines={displayLines} />
            </div>
          </>
        ) : (
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
                  {displayLines.map((line, idx) => (
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
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700/60">
              <OrderSummary lines={displayLines} />
            </div>
          </>
        )}
      </div>
    </>
  )
}

export function StepApproval({
  order,
  onRequestApproval,
  onApprove,
  onReject,
  onDownloadPdf,
  onSendProforma,
}: {
  order: OrderEntity
  onRequestApproval: () => Promise<void> | void
  onApprove: (notes: string) => Promise<void> | void
  onReject: (notes: string) => Promise<void> | void
  onDownloadPdf: () => Promise<void> | void
  onSendProforma: () => Promise<void> | void
}) {
  const { alert } = useAlert()
  const approval = order.approval
  const isApproved = order.approvalStatus === 'approved'
  const isPending = order.approvalStatus === 'pending'
  const isNone = order.approvalStatus === 'none'

  const [approvalNotes, setApprovalNotes] = useState('')
  const [actionLoading, setActionLoading] = useState<'submit' | 'approve' | 'reject' | null>(null)
  const [proformaLoading, setProformaLoading] = useState<'download' | 'send' | null>(null)
  const [proformaSent, setProformaSent] = useState(false)

  const runAction = async (key: 'submit' | 'approve' | 'reject', fn: () => Promise<void> | void) => {
    setActionLoading(key)
    try { await fn() } finally { setActionLoading(null) }
  }

  const handleApprove = () => {
    runAction('approve', () => onApprove(approvalNotes))
  }

  const handleReject = () => {
    if (!approvalNotes.trim()) {
      alert({ text: 'Please provide a reason for rejection.', type: 'error' })
      return
    }
    runAction('reject', () => onReject(approvalNotes))
  }

  const proformaRef = `PI-${order.name.replace('SO-', '')}`

  const physicalLines = order.lines.filter((l) => l.puCategory === 'physical')
  const contractLines = order.lines.filter((l) => l.puCategory !== 'physical')
  const physicalSub = physicalLines.reduce((s, l) => s + l.priceSubtotal, 0)
  const contractSub = contractLines.reduce((s, l) => s + l.priceSubtotal, 0)

  const spinner = (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )

  return (
    <>
      {/* ── Status Banner ── */}
      {isNone && (
        <StatusBanner
          variant="info"
          title="Proforma Invoice Ready"
          description="Review the proforma invoice below, then submit for manager approval."
        />
      )}
      {isPending && (
        <StatusBanner
          variant="warning"
          title="Pending Approval"
          description={`Awaiting review from management.${(approval?.submittedBy || getSalesUser()?.name) ? ` Submitted by ${approval?.submittedBy || getSalesUser()?.name}` : ''}${approval?.submittedAt ? ` on ${new Date(approval.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}.`}
        />
      )}
      {isApproved && (
        <StatusBanner
          variant="success"
          title="Approved"
          description={`Order approved${approval?.approvedBy ? ` by ${approval.approvedBy}` : ''}${approval?.approvedAt ? ` on ${new Date(approval.approvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}. Send the proforma to the customer.`}
        />
      )}

      <div className="flex flex-col lg:flex-row lg:gap-6">
        {/* ── Sidebar ── */}
        <div className="lg:order-2 lg:w-2/5 w-full mb-4 lg:mb-0 space-y-4">

          {/* State: none — submit for approval */}
          {isNone && (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 overflow-hidden">
              <div className="px-5 py-5">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Ready for Approval</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Review the document, then submit.</p>
                </div>

                <div className="flex items-center justify-between px-3.5 py-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/50 mb-5">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-green-600 dark:text-green-400">Order Total</span>
                  <span className="text-lg font-extrabold tabular-nums text-green-600 dark:text-green-400">{formatCurrency(order.amountTotal)}</span>
                </div>

                <button
                  onClick={() => runAction('submit', onRequestApproval)}
                  disabled={!!actionLoading}
                  className="btn w-full bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {actionLoading === 'submit' ? (
                    <>{spinner} Submitting…</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4" /> Submit for Approval</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* State: pending — approve / reject */}
          {isPending && (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Review & Decide</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  <Clock className="w-3 h-3" /> Pending
                </span>
              </div>
              <div className="px-4 pt-3 pb-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Submitted by <span className="font-medium text-gray-700 dark:text-gray-300">{approval?.submittedBy || getSalesUser()?.name || '—'}</span>
                  {approval?.submittedAt
                    ? ` on ${new Date(approval.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    : ''}
                </p>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between px-3.5 py-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/50">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-green-600 dark:text-green-400">Order Total</span>
                  <span className="text-base font-extrabold tabular-nums text-green-600 dark:text-green-400">{formatCurrency(order.amountTotal)}</span>
                </div>

                <div>
                  <label htmlFor="approval-notes" className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
                    Review Notes <span className="normal-case tracking-normal text-gray-400">(required for rejection)</span>
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
                    disabled={!!actionLoading}
                    className="btn flex-1 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading === 'approve' ? (
                      <>{spinner} Approving…</>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4" /> Approve</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={!!actionLoading}
                    className="btn flex-1 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                  >
                    {actionLoading === 'reject' ? (
                      <>{spinner} Rejecting…</>
                    ) : (
                      <><X className="w-4 h-4" /> Reject</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* State: approved — send proforma */}
          {isApproved && (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-green-200 dark:border-green-800/60 overflow-hidden">
              <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800/60 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-green-800 dark:text-green-300">Approved</h3>
                  <p className="text-xs text-green-700/80 dark:text-green-400/80">
                    by {approval?.approvedBy ?? '—'}
                    {approval?.approvedAt
                      ? ` on ${new Date(approval.approvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : ''}
                  </p>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {approval?.notes && (
                  <div className="px-3 py-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/50 text-sm text-green-800 dark:text-green-300">
                    <span className="text-[10px] font-medium uppercase tracking-wide block mb-0.5">Approver Notes</span>
                    &ldquo;{approval.notes}&rdquo;
                  </div>
                )}

                <div>
                  <h4 className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2.5">
                    Send to Customer
                  </h4>

                  {proformaSent ? (
                    <div className="flex items-center gap-2.5 px-3.5 py-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Sent to <strong>{order.partnerName}</strong></span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={async () => {
                          setProformaLoading('send')
                          try {
                            await onSendProforma()
                            setProformaSent(true)
                          } finally {
                            setProformaLoading(null)
                          }
                        }}
                        disabled={!!proformaLoading}
                        className="btn w-full bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white disabled:opacity-50"
                      >
                        {proformaLoading === 'send' ? (
                          <>{spinner} Sending…</>
                        ) : (
                          <><Mail className="w-4 h-4" /> Email to Customer</>
                        )}
                      </button>
                      <button
                        onClick={async () => {
                          setProformaLoading('download')
                          try { await onDownloadPdf() } finally { setProformaLoading(null) }
                        }}
                        disabled={!!proformaLoading}
                        className="btn w-full border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-50"
                      >
                        {proformaLoading === 'download' ? (
                          <>{spinner} Downloading…</>
                        ) : (
                          <><Download className="w-4 h-4" /> Download PDF</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Breakdown */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
            <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Order Breakdown</h3>
            </header>
            <div className="p-5 space-y-4">
              {physicalSub > 0 && contractSub > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">Allocation</span>
                    <span className="text-[11px] font-medium tabular-nums text-gray-400 dark:text-gray-500">
                      {Math.round((physicalSub / order.amountTotal) * 100)}% / {Math.round((contractSub / order.amountTotal) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-500 rounded-l-full" style={{ width: `${(physicalSub / order.amountTotal) * 100}%` }} />
                    <div className="h-full bg-amber-500 rounded-r-full" style={{ width: `${(contractSub / order.amountTotal) * 100}%` }} />
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500"><span className="w-2 h-2 rounded-full bg-blue-500" />Physical</span>
                    <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500"><span className="w-2 h-2 rounded-full bg-amber-500" />Contract</span>
                  </div>
                </div>
              )}

              {physicalLines.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CategoryBadge category="physical" />
                    <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">Physical Assets</span>
                    <span className="ml-auto text-xs font-semibold tabular-nums text-gray-800 dark:text-gray-100">{formatCurrency(physicalSub)}</span>
                  </div>
                  <div className="space-y-1">
                    {physicalLines.map((l) => (
                      <div key={l.id} className="flex items-center justify-between text-sm px-3 py-1.5 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                        <div className="min-w-0">
                          <span className="text-gray-700 dark:text-gray-200 truncate">{l.productName}</span>
                          <span className="text-gray-400 dark:text-gray-500 ml-1.5 text-xs">x{l.quantity}</span>
                        </div>
                        <span className="tabular-nums text-gray-600 dark:text-gray-300 shrink-0 ml-3">{formatCurrency(l.priceSubtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {contractLines.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CategoryBadge category="contract" />
                    <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">Contracts & Deposits</span>
                    <span className="ml-auto text-xs font-semibold tabular-nums text-gray-800 dark:text-gray-100">{formatCurrency(contractSub)}</span>
                  </div>
                  <div className="space-y-1">
                    {contractLines.map((l) => (
                      <div key={l.id} className="flex items-center justify-between text-sm px-3 py-1.5 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                        <div className="min-w-0">
                          <span className="text-gray-700 dark:text-gray-200 truncate">{l.productName}</span>
                          <span className="text-gray-400 dark:text-gray-500 ml-1.5 text-xs">x{l.quantity}</span>
                        </div>
                        <span className="tabular-nums text-gray-600 dark:text-gray-300 shrink-0 ml-3">{formatCurrency(l.priceSubtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 flex justify-between text-sm">
                <span className="font-semibold text-gray-800 dark:text-gray-100">Order Total</span>
                <span className="font-semibold tabular-nums text-gray-800 dark:text-gray-100">{formatCurrency(order.amountTotal)}</span>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
            <header className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/60">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Activity</h3>
            </header>
            <div className="p-4">
              {order.timeline.length > 0 ? (
                <ActivityTimeline events={order.timeline.slice(0, 5)} />
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-3">No events yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Main: Proforma Invoice Document ── */}
        <div className="lg:order-1 lg:w-3/5 w-full min-w-0 space-y-4">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 overflow-hidden">
            {/* Card header with title + actions */}
            <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">Proforma Invoice</h2>
              <div className="flex items-center gap-2">
                {isApproved && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                    <CheckCircle2 className="w-3 h-3" /> Approved
                  </span>
                )}
                {isPending && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    <Clock className="w-3 h-3" /> Pending Review
                  </span>
                )}
                <button
                  onClick={async () => {
                    setProformaLoading('download')
                    try { await onDownloadPdf() } finally { setProformaLoading(null) }
                  }}
                  disabled={!!proformaLoading}
                  className="btn text-sm border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-50"
                >
                  {proformaLoading === 'download' ? (
                    <>{spinner} Generating…</>
                  ) : (
                    <><Download className="w-3.5 h-3.5" /> Download PDF</>
                  )}
                </button>
              </div>
            </header>

            {/* Document container */}
            <div className="p-8 bg-gray-50 dark:bg-gray-900/30 flex justify-center">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 max-w-2xl w-full shadow-md">
                {/* Document header */}
                <div className="flex justify-between items-start mb-7">
                  <div>
                    <h2 className="text-xl font-black text-gray-800 dark:text-gray-100">PROFORMA INVOICE</h2>
                    <div className="text-sm tabular-nums text-gray-600 dark:text-gray-300">{proformaRef}</div>
                  </div>
                  <div className="text-right">
                    <Image src={CompanyLogo} alt="OVES Energy" width={120} height={48} className="ml-auto mb-1.5 object-contain" />
                    <div className="text-xs text-gray-500 dark:text-gray-400">Mombasa Road, Nairobi<br />sales@oves.energy</div>
                  </div>
                </div>

                {/* Bill To + Date/Reference */}
                <div className="flex justify-between mb-6 gap-4">
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Bill To</div>
                    <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">{order.partnerName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {order.contactPerson && <>Attn: {order.contactPerson}<br /></>}
                      {order.partnerEmail && <>{order.partnerEmail}<br /></>}
                      {order.partnerPhone && <>{order.partnerPhone}</>}
                    </div>
                  </div>
                  <div className="text-right text-xs space-y-0.5">
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">Date</span>{' '}
                      <span className="text-gray-600 dark:text-gray-300 ml-1">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">SO</span>{' '}
                      <span className="tabular-nums text-gray-800 dark:text-gray-100 ml-1">{order.name}</span>
                    </div>
                    {order.salesOutlet && (
                      <div>
                        <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">Outlet</span>{' '}
                        <span className="text-gray-600 dark:text-gray-300 ml-1">{order.salesOutlet}</span>
                      </div>
                    )}
                    {order.salesRepName && (
                      <div>
                        <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">Sales Rep</span>{' '}
                        <span className="text-gray-600 dark:text-gray-300 ml-1">{order.salesRepName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <LinesTable lines={order.lines} />

                <div className="mt-4 px-5 py-4">
                  <OrderSummary lines={order.lines} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function StepPayment({
  order,
  onRegisterPayment,
}: {
  order: OrderEntity
  onRegisterPayment: (amount: number, paymentDate: string, memo: string) => Promise<void> | void
}) {
  const isPaid = order.paymentStatus === 'paid'
  const isPartial = order.paymentStatus === 'partial'

  const physicalLines = order.lines.filter((l) => l.puCategory === 'physical')
  const contractLines = order.lines.filter((l) => l.puCategory !== 'physical')
  const physicalSub = physicalLines.reduce((s, l) => s + l.priceSubtotal, 0)
  const contractSub = contractLines.reduce((s, l) => s + l.priceSubtotal, 0)

  const [payAmount, setPayAmount] = useState(order.remainingAmount)
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0])
  const [payMemo, setPayMemo] = useState('')
  const [payLoading, setPayLoading] = useState(false)

  useEffect(() => {
    setPayAmount(order.remainingAmount)
  }, [order.remainingAmount])

  const paidPercent = order.amountTotal > 0 ? Math.round((order.paidAmount / order.amountTotal) * 100) : 0

  return (
    <>
      {isPaid && (
        <StatusBanner
          variant="success"
          title="Fully Paid"
          description={`${formatCurrency(order.paidAmount)} of ${formatCurrency(order.amountTotal)} received.`}
        />
      )}

      {isPartial && (
        <StatusBanner
          variant="warning"
          title="Partial Payment"
          description={`${formatCurrency(order.paidAmount)} of ${formatCurrency(order.amountTotal)} received. ${formatCurrency(order.remainingAmount)} remaining.`}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Payment Summary — always visible when any amount has been paid */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Payment Summary</h2>
          </header>
          <div className="p-5 space-y-4">
            {(isPaid || isPartial) ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Order Total</span>
                    <span className="font-semibold tabular-nums text-gray-800 dark:text-gray-100">{formatCurrency(order.amountTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Amount Paid</span>
                    <span className="font-semibold tabular-nums text-green-600 dark:text-green-400">{formatCurrency(order.paidAmount)}</span>
                  </div>
                  {!isPaid && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Remaining</span>
                      <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">{formatCurrency(order.remainingAmount)}</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">Progress</span>
                    <span className="text-xs font-semibold tabular-nums text-gray-600 dark:text-gray-300">{paidPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isPaid ? 'bg-green-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(paidPercent, 100)}%` }}
                    />
                  </div>
                </div>

                {order.payments.length > 0 && (
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 space-y-3">
                    <h3 className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">Payment Records</h3>
                    {order.payments.map((pay) => (
                      <div key={pay.id} className="flex items-center justify-between text-sm px-3 py-2 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                        <div className="min-w-0">
                          <span className="font-medium text-gray-800 dark:text-gray-100">{formatCurrency(pay.amount)}</span>
                          {pay.paymentMethod && <span className="text-gray-400 dark:text-gray-500 ml-1.5">via {pay.paymentMethod}</span>}
                          {pay.memo && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{pay.memo}</p>}
                        </div>
                        <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400 shrink-0 ml-3">{pay.paymentDate}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <CreditCard className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No payments received yet.</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Use the form below to register the first payment.</p>
              </div>
            )}

            {!isPaid && (
              <div className={`${(isPaid || isPartial) ? 'pt-3 border-t border-gray-100 dark:border-gray-700/60' : 'pt-1'} space-y-3`}>
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
                  onClick={async () => {
                    setPayLoading(true)
                    try { await onRegisterPayment(payAmount, payDate, payMemo) } finally { setPayLoading(false) }
                  }}
                  disabled={payLoading}
                  className="btn bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 w-full"
                >
                  {payLoading ? (
                    <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Registering…</>
                  ) : (
                    <><CreditCard className="w-4 h-4" /> Register Payment</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Order Breakdown</h2>
          </header>
          <div className="p-5 space-y-4">
            {physicalSub > 0 && contractSub > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">Allocation</span>
                  <span className="text-[11px] font-medium tabular-nums text-gray-400 dark:text-gray-500">
                    {Math.round((physicalSub / order.amountTotal) * 100)}% / {Math.round((contractSub / order.amountTotal) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                  <div className="h-full bg-blue-500 rounded-l-full" style={{ width: `${(physicalSub / order.amountTotal) * 100}%` }} />
                  <div className="h-full bg-amber-500 rounded-r-full" style={{ width: `${(contractSub / order.amountTotal) * 100}%` }} />
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500"><span className="w-2 h-2 rounded-full bg-blue-500" />Physical</span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500"><span className="w-2 h-2 rounded-full bg-amber-500" />Contract</span>
                </div>
              </div>
            )}

            {physicalLines.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <CategoryBadge category="physical" />
                  <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">Physical Assets</span>
                  <span className="ml-auto text-xs font-semibold tabular-nums text-gray-800 dark:text-gray-100">{formatCurrency(physicalSub)}</span>
                </div>
                <div className="space-y-1">
                  {physicalLines.map((l) => (
                    <div key={l.id} className="flex items-center justify-between text-sm px-3 py-1.5 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                      <div className="min-w-0">
                        <span className="text-gray-700 dark:text-gray-200 truncate">{l.productName}</span>
                        <span className="text-gray-400 dark:text-gray-500 ml-1.5 text-xs">x{l.quantity}</span>
                      </div>
                      <span className="tabular-nums text-gray-600 dark:text-gray-300 shrink-0 ml-3">{formatCurrency(l.priceSubtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contractLines.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <CategoryBadge category="contract" />
                  <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">Contracts & Deposits</span>
                  <span className="ml-auto text-xs font-semibold tabular-nums text-gray-800 dark:text-gray-100">{formatCurrency(contractSub)}</span>
                </div>
                <div className="space-y-1">
                  {contractLines.map((l) => (
                    <div key={l.id} className="flex items-center justify-between text-sm px-3 py-1.5 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                      <div className="min-w-0">
                        <span className="text-gray-700 dark:text-gray-200 truncate">{l.productName}</span>
                        <span className="text-gray-400 dark:text-gray-500 ml-1.5 text-xs">x{l.quantity}</span>
                      </div>
                      <span className="tabular-nums text-gray-600 dark:text-gray-300 shrink-0 ml-3">{formatCurrency(l.priceSubtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                  <strong className="font-semibold">Deposit note:</strong> A portion of the Contract amount is booked as a liability, not revenue.
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 flex justify-between text-sm">
              <span className="font-semibold text-gray-800 dark:text-gray-100">Order Total</span>
              <span className="font-semibold tabular-nums text-gray-800 dark:text-gray-100">{formatCurrency(order.amountTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function StepInvoice({ order }: { order: OrderEntity }) {
  const invoice = order.invoices[0]
  const invoiceRef = invoice?.name ?? `INV-${order.name.replace(/^S\/?\/?/, '')}`
  const invoiceDate = invoice?.createdAt ?? order.createdAt
  const invoiceElRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const handleDownloadPdf = useCallback(async () => {
    const el = invoiceElRef.current
    if (!el) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })
      const imgData = canvas.toDataURL('image/png')
      const imgWidth = canvas.width
      const imgHeight = canvas.height

      const pdfWidth = 210
      const pdfContentWidth = pdfWidth - 20
      const pdfContentHeight = (imgHeight * pdfContentWidth) / imgWidth
      const pdfHeight = Math.max(297, pdfContentHeight + 20)

      const pdf = new jsPDF({ unit: 'mm', format: [pdfWidth, pdfHeight] })
      pdf.addImage(imgData, 'PNG', 10, 10, pdfContentWidth, pdfContentHeight)
      pdf.save(`${invoiceRef}.pdf`)
    } catch {
      /* silently fail */
    } finally {
      setDownloading(false)
    }
  }, [invoiceRef])

  return (
    <>
      <StatusBanner
        variant="info"
        title={`Invoice ${invoiceRef}`}
        description={`Generated from ${order.name} · ${order.lines.length} Product-Unit line${order.lines.length !== 1 ? 's' : ''}`}
      />

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 mb-4">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Invoice Document</h2>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="btn text-sm border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-50"
            >
              {downloading ? (
                <><svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Generating…</>
              ) : (
                <><Download className="w-3.5 h-3.5" /> Download PDF</>
              )}
            </button>
            <button className="btn text-sm bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
              <Mail className="w-3.5 h-3.5" /> Email to Customer
            </button>
          </div>
        </header>

        <div className="p-8 bg-gray-50 dark:bg-gray-900/30 flex justify-center">
          <div ref={invoiceElRef} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 max-w-2xl w-full shadow-md">
            <div className="flex justify-between items-start mb-7">
              <div>
                <h2 className="text-xl font-black text-gray-800 dark:text-gray-100">INVOICE</h2>
                <div className="text-sm tabular-nums text-gray-600 dark:text-gray-300">{invoiceRef}</div>
              </div>
              <div className="text-right">
                <Image src={CompanyLogo} alt="OVES Energy" width={120} height={48} className="ml-auto mb-1.5 object-contain" />
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
                <div><span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">Date</span> <span className="text-gray-600 dark:text-gray-300 ml-1">{invoiceDate ? new Date(invoiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span></div>
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
