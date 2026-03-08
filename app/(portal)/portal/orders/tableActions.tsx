'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import FeedbackModal from '@/components/feedback-modal'
import { useAlert } from '@/app/contexts/alertContext'

interface ActionProps {
  row: any
  onDelete: () => void
}

function OrderActions({ row, onDelete }: ActionProps) {
  const router = useRouter()
  const { alert } = useAlert()
  const [dangerModalOpen, setDangerModalOpen] = useState(false)
  const orderId = row.id
  const orderName = row.name || 'this order'
  const isDraft = row.state === 'draft'
  const canEdit = isDraft || row.state === 'sent'
  const canDelete = isDraft

  const handleEdit = () => {
    router.push(`/portal/orders/${orderId}/edit`)
  }

  const handleDelete = () => {
    setDangerModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      // TODO: replace with actual DELETE_ORDER mutation when available
      setDangerModalOpen(false)
      alert({ text: `${orderName} deleted successfully`, type: 'success' })
      onDelete?.()
    } catch (err) {
      alert({ text: err instanceof Error ? err.message : 'Failed to delete order', type: 'error' })
      setDangerModalOpen(false)
    }
  }

  const handleMore = () => {
    router.push(`/portal/orders/${orderId}`)
  }

  return (
    <div className="flex items-center gap-1">
      <button
        className={`p-2 rounded-full transition-colors ${canEdit ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'opacity-30 cursor-not-allowed'}`}
        onClick={canEdit ? handleEdit : undefined}
        disabled={!canEdit}
        title={canEdit ? 'Edit order' : 'Only draft and sent orders can be edited'}
      >
        <Pencil className="w-4 h-4 text-gray-500" />
        <span className="sr-only">Edit</span>
      </button>
      <button
        className={`p-2 rounded-full transition-colors ${canDelete ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'opacity-30 cursor-not-allowed'}`}
        onClick={canDelete ? handleDelete : undefined}
        disabled={!canDelete}
        title={canDelete ? 'Delete order' : 'Only draft orders can be deleted'}
      >
        <Trash2 className={`w-4 h-4 ${canDelete ? 'text-red-500' : 'text-gray-500'}`} />
        <span className="sr-only">Delete</span>
      </button>
      <button
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        onClick={handleMore}
        title="View details"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-500" />
        <span className="sr-only">View details</span>
      </button>
      <FeedbackModal
        isOpen={dangerModalOpen}
        setIsOpen={setDangerModalOpen}
        variant="danger"
        title={`Delete ${orderName}?`}
        content="Are you sure you want to delete this order? This action cannot be undone."
        confirmButtonLabel="Yes, Delete it"
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export const actions = ({ row, onDelete }: ActionProps) => (
  <OrderActions row={row} onDelete={onDelete} />
)
