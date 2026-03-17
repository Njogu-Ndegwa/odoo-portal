'use client'

import ModalBlank from '@/components/modal-blank'
import { ReactNode } from 'react'
import { useTranslations } from 'next-intl'

type ModalVariant = 'success' | 'danger' | 'info'

interface FeedbackModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  variant: ModalVariant
  title: string | ReactNode
  content: string | ReactNode
  cancelButtonLabel?: string
  confirmButtonLabel?: string
  onConfirm?: () => void
  onCancel?: () => void
}

export default function FeedbackModal({
  isOpen,
  setIsOpen,
  variant = 'info',
  title,
  content,
  cancelButtonLabel,
  confirmButtonLabel,
  onConfirm,
  onCancel,
}: FeedbackModalProps) {
  const t = useTranslations('modal')
  const resolvedCancel = cancelButtonLabel ?? t('cancel')
  const resolvedConfirm = confirmButtonLabel ?? t('confirm')
  const getIcon = () => {
    const iconClass = 'shrink-0 fill-current'
    const containerClass = 'w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-100 dark:bg-gray-700'
    
    switch(variant) {
      case 'success':
        return (
          <div className={containerClass}>
            <svg className={`${iconClass} text-green-500`} width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zM7 11.4L3.6 8 5 6.6l2 2 4-4L12.4 6 7 11.4z" />
            </svg>
          </div>
        )
      case 'danger':
        return (
          <div className={containerClass}>
            <svg className={`${iconClass} text-red-500`} width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 12c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm1-3H7V4h2v5z" />
            </svg>
          </div>
        )
      case 'info':
        return (
          <div className={containerClass}>
            <svg className={`${iconClass} text-violet-500`} width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 12H7V7h2v5zM8 6c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" />
            </svg>
          </div>
        )
    }
  }

  const getConfirmButtonStyle = () => {
    switch(variant) {
      case 'success':
        return 'bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white'
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white'
      case 'info':
        return 'bg-violet-500 hover:bg-violet-600 text-white'
    }
  }

  const handleConfirm = () => {
    onConfirm?.()
    setIsOpen(false)
  }

  const handleCancel = () => {
    onCancel?.()
    setIsOpen(false)
  }

  return (
    <ModalBlank isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="p-5 flex space-x-4">
        {/* Icon */}
        {getIcon()}
        
        {/* Content */}
        <div className="flex-1">
          {/* Modal header */}
          <div className="mb-2">
            <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {title}
            </div>
          </div>
          
          {/* Modal content */}
          <div className="text-sm mb-10">
            <div className="space-y-2">
              {typeof content === 'string' ? (
                <p>{content}</p>
              ) : content}
            </div>
          </div>
          
          {/* Modal footer */}
          <div className="flex flex-wrap justify-end space-x-2">
            <button 
              className="btn-sm border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
              onClick={handleCancel}
            >
              {resolvedCancel}
            </button>
            <button 
              className={`btn-sm ${getConfirmButtonStyle()}`}
              onClick={handleConfirm}
            >
              {resolvedConfirm}
            </button>
          </div>
        </div>
      </div>
    </ModalBlank>
  )
}