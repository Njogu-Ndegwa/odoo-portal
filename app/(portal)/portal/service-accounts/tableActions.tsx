'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Pencil, Trash2, MoreHorizontal, Users } from 'lucide-react'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import FeedbackModal from '@/components/feedback-modal'
import { useAlert } from '@/app/contexts/alertContext'
import { deleteServiceAccount } from '@/lib/sa-api'

interface ActionProps {
  row: any
  onDelete: () => void
}

function SAActions({ row, onDelete }: ActionProps) {
  const router = useRouter()
  const { alert } = useAlert()
  const tc = useTranslations('common')
  const t = useTranslations('portal.serviceAccounts')
  const tm = useTranslations('modal')

  const saId = row.id
  const saName = row.name || 'this account'

  const [dangerModalOpen, setDangerModalOpen] = useState(false)

  const handleEdit = () => {
    router.push(`/portal/service-accounts/${saId}`)
  }

  const handleManageMembers = () => {
    router.push(`/portal/service-accounts/${saId}/members`)
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteServiceAccount(saId)
      alert({ text: t('deletedSingleSuccess', { name: saName }), type: 'success' })
      setDangerModalOpen(false)
      onDelete?.()
    } catch (err) {
      alert({ text: err instanceof Error ? err.message : t('deleteAccountFailed'), type: 'error' })
      setDangerModalOpen(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        onClick={handleEdit}
        title={tc('edit')}
      >
        <Pencil className="w-4 h-4 text-gray-500" />
        <span className="sr-only">{tc('edit')}</span>
      </button>
      <button
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        onClick={() => setDangerModalOpen(true)}
        title={tc('delete')}
      >
        <Trash2 className="w-4 h-4 text-red-500" />
        <span className="sr-only">{tc('delete')}</span>
      </button>

      {/* More actions dropdown */}
      <Menu as="div" className="relative inline-flex">
        {({ open }) => (
          <>
            <MenuButton
              className={`p-2 rounded-full transition-colors focus:outline-hidden ${
                open
                  ? 'bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400'
                  : 'text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <MoreHorizontal className="w-4 h-4" />
              <span className="sr-only">{tc('moreOptions')}</span>
            </MenuButton>
            <MenuItems
              as="ul"
              anchor="bottom end"
              className="z-50 min-w-[10rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1 focus:outline-hidden [--anchor-gap:4px]"
            >
              <MenuItem as="li">
                {({ active }) => (
                  <button
                    className={`font-medium text-sm flex items-center gap-2 w-full py-1.5 px-3 ${
                      active ? 'text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/40' : 'text-gray-600 dark:text-gray-300'
                    }`}
                    onClick={handleManageMembers}
                  >
                    <Users className="w-4 h-4" />
                    {t('actions.manageMembers')}
                  </button>
                )}
              </MenuItem>
              <MenuItem as="li">
                {({ active }) => (
                  <button
                    className={`font-medium text-sm flex items-center gap-2 w-full py-1.5 px-3 ${
                      active ? 'text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/40' : 'text-gray-600 dark:text-gray-300'
                    }`}
                    onClick={handleEdit}
                  >
                    <Pencil className="w-4 h-4" />
                    {tc('viewDetails')}
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </>
        )}
      </Menu>

      {/* Delete confirmation modal */}
      <FeedbackModal
        isOpen={dangerModalOpen}
        setIsOpen={setDangerModalOpen}
        variant="danger"
        title={t('deleteTitle', { name: saName })}
        content={t('deleteConfirm')}
        confirmButtonLabel={tm('yesDelete')}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export const actions = ({ row, onDelete }: ActionProps) => (
  <SAActions row={row} onDelete={onDelete} />
)
