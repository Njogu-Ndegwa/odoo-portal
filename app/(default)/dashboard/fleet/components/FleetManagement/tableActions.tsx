'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Pencil, Trash2, Plus, Settings, MoreHorizontal } from 'lucide-react'
import FeedbackModal from '@/components/feedback-modal'
import { useAlert } from '@/app/contexts/alertContext'

interface ActionProps {
  row: any // Fleet interface type
  onDelete: () => void
  onViewDetails?: (fleet: any) => void
  onAssignDevices?: () => void
}

export const actions = ({ row, onDelete, onViewDetails, onAssignDevices }: ActionProps) => {
  const router = useRouter()
  const t = useTranslations('fleetDashboard')
  const [dangerModalOpen, setDangerModalOpen] = useState(false)
  const { alert } = useAlert()
  
  const fleetId = row.id

  const handleEdit = () => {
    // Navigate to edit fleet page or open edit modal
    // router.push(`/fleet/edit/${fleetId}`)
    console.log('Edit fleet:', fleetId)
  }

  const handleDelete = () => {
    setDangerModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      // Implement delete fleet logic here
      // const response = await deleteFleet(fleetId)
      
      // Show success feedback
      alert({ text: "Fleet deleted successfully", type: "success" })
      console.log('Fleet deleted successfully:', fleetId)
      
      // Close delete modal
      setDangerModalOpen(false)
      
      // Call the onDelete callback after successful deletion
      if (onDelete) {
        onDelete()
      }
    } catch (error) {
      console.error('Delete failed:', error)
      // Show error feedback
      alert({ text: "Failed to delete fleet. Please try again.", type: "error" })
    }
  }

//   const handleViewDetails = () => {
//     if (onViewDetails) {
//       onViewDetails(row)
//     }
//   }

//   const handleAssignDevices = () => {
//     if (onAssignDevices) {
//       onAssignDevices()
//     }
//   }

  const handleMore = () => {
    // Implement more options logic here
    console.log('More options for fleet:', fleetId)
  }

  return (
    <>
      {/* <button
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        onClick={handleViewDetails}
        title="View Details"
      >
        <Settings className="w-4 h-4 text-gray-500" />
        <span className="sr-only">View Details</span>
      </button>
      
      <button
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        onClick={handleAssignDevices}
        title="Assign Devices"
      >
        <Plus className="w-4 h-4 text-blue-500" />
        <span className="sr-only">Assign Devices</span>
      </button> */}
      
      <button
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        onClick={handleEdit}
        title={t('editFleet')}
      >
        <Pencil className="w-4 h-4 text-gray-500" />
        <span className="sr-only">{t('editFleet')}</span>
      </button>
      
      <button
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        onClick={handleDelete}
        title={t('deleteFleet')}
      >
        <Trash2 className="w-4 h-4 text-red-500" />
        <span className="sr-only">{t('deleteFleet')}</span>
      </button>
      
      <button
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        onClick={handleMore}
        title={t('moreOptionsMenu')}
      >
        <MoreHorizontal className="w-4 h-4 text-gray-500" />
        <span className="sr-only">{t('moreOptionsMenu')}</span>
      </button>
      
      <FeedbackModal
        isOpen={dangerModalOpen}
        setIsOpen={setDangerModalOpen}
        variant="danger"
        title={t('deleteFleet')}
        content={t('deleteFleetSingleConfirm')}
        confirmButtonLabel={t('deleteFleet')}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}