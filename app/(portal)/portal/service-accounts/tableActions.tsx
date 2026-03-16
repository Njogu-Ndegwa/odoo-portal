'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import FeedbackModal from '@/components/feedback-modal'
import { useAlert } from '@/app/contexts/alertContext'
import { deleteServiceAccount } from '@/lib/sa-api'

interface ActionProps {
    row: any
    onDelete: () => void
}

export const actions = ({ row, onDelete }: ActionProps) => {
    const router = useRouter()
    const { alert } = useAlert()
    const [dangerModalOpen, setDangerModalOpen] = useState(false)
    const saId = row.id
    const saName = row.name || 'this account'

    const handleEdit = () => {
        router.push(`/portal/service-accounts/${saId}`)
    }

    const handleDelete = () => {
        setDangerModalOpen(true)
    }

    const handleConfirmDelete = async () => {
        try {
            await deleteServiceAccount(saId)
            alert({ text: `${saName} deleted successfully`, type: 'success' })
            setDangerModalOpen(false)
            onDelete?.()
        } catch (err) {
            alert({ text: err instanceof Error ? err.message : 'Failed to delete account', type: 'error' })
            setDangerModalOpen(false)
        }
    }

    const handleMore = () => {
        router.push(`/portal/service-accounts/${saId}`)
    }

    return (
        <>
            <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                onClick={handleEdit}
            >
                <Pencil className="w-4 h-4 text-gray-500" />
                <span className="sr-only">Edit</span>
            </button>
            <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                onClick={handleDelete}
            >
                <Trash2 className="w-4 h-4 text-red-500" />
                <span className="sr-only">Delete</span>
            </button>
            <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                onClick={handleMore}
            >
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
                <span className="sr-only">View details</span>
            </button>
            <FeedbackModal
                isOpen={dangerModalOpen}
                setIsOpen={setDangerModalOpen}
                variant="danger"
                title={`Delete ${saName}?`}
                content="Are you sure you want to delete this service account? This action cannot be undone."
                confirmButtonLabel="Yes, Delete it"
                onConfirm={handleConfirmDelete}
            />
        </>
    )
}
