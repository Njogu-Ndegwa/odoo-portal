'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Pencil, Trash2 /*, MoreHorizontal */ } from 'lucide-react'
import FeedbackModal from '@/components/feedback-modal'
import { useAlert } from '@/app/contexts/alertContext'

interface ActionProps {
  row: any
  onDelete: () => void
}

function OrderActions({ row, onDelete }: ActionProps) {
  const t = useTranslations('portal.orders')
  const tc = useTranslations('common')
  const tm = useTranslations('modal')
  const router = useRouter()
  const { alert } = useAlert()
  const [dangerModalOpen, setDangerModalOpen] = useState(false)
  const orderId = row.id
  const orderName = row.name || 'this order'
  const isDraft = row.state === 'draft'
  const canEdit = isDraft || row.state === 'sent'
  const canDelete = isDraft

  const handleEdit = () => {
    router.push(`/portal/orders/${orderId}`)
  }

  const handleDelete = () => {
    setDangerModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      // TODO: replace with actual DELETE_ORDER mutation when available
      setDangerModalOpen(false)
      alert({ text: t('deletedSuccess', { name: orderName }), type: 'success' })
      onDelete?.()
    } catch (err) {
      alert({ text: err instanceof Error ? err.message : t('deleteOrderFailed'), type: 'error' })
      setDangerModalOpen(false)
    }
  }

  // const handleMore = () => {
  //   router.push(`/portal/orders/${orderId}`)
  // }

  return (
    <div className="flex items-center gap-1">
      <button
        className={`p-2 rounded-full transition-colors ${canEdit ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'opacity-30 cursor-not-allowed'}`}
        onClick={canEdit ? handleEdit : undefined}
        disabled={!canEdit}
        title={canEdit ? t('editOrder') : t('onlyDraftSentEdit')}
      >
        <Pencil className="w-4 h-4 text-gray-500" />
        <span className="sr-only">{tc('edit')}</span>
      </button>
      <button
        className={`p-2 rounded-full transition-colors ${canDelete ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'opacity-30 cursor-not-allowed'}`}
        onClick={canDelete ? handleDelete : undefined}
        disabled={!canDelete}
        title={canDelete ? tc('delete') : t('onlyDraftDelete')}
      >
        <Trash2 className={`w-4 h-4 ${canDelete ? 'text-red-500' : 'text-gray-500'}`} />
        <span className="sr-only">{tc('delete')}</span>
      </button>
      {/* <button
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        onClick={handleMore}
        title="View details"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-500" />
        <span className="sr-only">View details</span>
      </button> */}
      <FeedbackModal
        isOpen={dangerModalOpen}
        setIsOpen={setDangerModalOpen}
        variant="danger"
        title={`${tc('delete')} ${orderName}?`}
        content={t('deleteOrderConfirm')}
        confirmButtonLabel={tm('yesDelete')}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export const actions = ({ row, onDelete }: ActionProps) => (
  <OrderActions row={row} onDelete={onDelete} />
)
