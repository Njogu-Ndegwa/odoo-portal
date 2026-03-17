'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import FeedbackModal from '@/components/feedback-modal';
import { useAlert } from '@/app/contexts/alertContext';

interface ActionProps {
    row: any;
    onDelete: () => void; 
}

export const actions = ({ row, onDelete }: ActionProps) => {
    const router = useRouter();
    const [dangerModalOpen, setDangerModalOpen] = useState(false)
    const { alert } = useAlert()
    const tc = useTranslations('common')
    const tm = useTranslations('modal')

    const customerId = row.node?._id;
    const handleEdit = () => {
        router.push(`/accounts/customers/edit/${customerId}`);
    };

    const handleDelete = () => {
        setDangerModalOpen(true)
    };

    const handleConfirmDelete = async () => {
        // try {
        //     const response = await deleteFleet(row.id);
        //     alert({ text: response.message, type: "success" })
        //     console.log('Fleet deleted successfully:', response);
        //     setDangerModalOpen(false);
        //     if (onDelete) {
        //         onDelete();
        //     }
        // } catch (error) {
        //     console.error('Delete failed:', error);
        //     alert({ text: tm('deleteFailed', { entity: 'message template' }), type: "error" })
        // }
    };

    const handleMore = () => {
        console.log('More options for:', row.id);
    };

    return (
        <>
            <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                onClick={handleEdit}
            >
                <Pencil className="w-4 h-4 text-gray-500" />
                <span className="sr-only">{tc('edit')}</span>
            </button>
            <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                onClick={handleDelete}
            >
                <Trash2 className="w-4 h-4 text-red-500" />
                <span className="sr-only">{tc('delete')}</span>
            </button>
            <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                onClick={handleMore}
            >
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
                <span className="sr-only">{tc('moreOptions')}</span>
            </button>
            <FeedbackModal
                isOpen={dangerModalOpen}
                setIsOpen={setDangerModalOpen}
                variant="danger"
                title={tm('deleteTitle', { count: 1, entity: 'message template' })}
                content={tm('deleteConfirmation', { entity: 'message template' })}
                confirmButtonLabel={tm('yesDelete')}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
};
