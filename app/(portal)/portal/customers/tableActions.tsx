'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { useTranslations } from 'next-intl';
import { Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import FeedbackModal from '@/components/feedback-modal';
import { useAlert } from '@/app/contexts/alertContext';
import { DELETE_CUSTOMER } from '@/lib/portal/mutations';

interface ActionProps {
    row: any;
    onDelete: () => void;
}

export const actions = ({ row, onDelete }: ActionProps) => {
    const router = useRouter();
    const { alert } = useAlert();
    const tc = useTranslations('common');
    const t = useTranslations('portal.customers');
    const tm = useTranslations('modal');
    const [dangerModalOpen, setDangerModalOpen] = useState(false);
    const customerId = row.id;
    const customerName = row.name || 'this customer';

    const [deleteCustomer] = useMutation(DELETE_CUSTOMER);

    const handleEdit = () => {
        router.push(`/portal/customers/${customerId}/edit`);
    };

    const handleDelete = () => {
        setDangerModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteCustomer({ variables: { id: String(customerId) } });
            alert({ text: t('deletedSuccess', { name: customerName }), type: 'success' });
            setDangerModalOpen(false);
            onDelete?.();
        } catch (err) {
            alert({ text: err instanceof Error ? err.message : t('deleteCustomerFailed'), type: 'error' });
            setDangerModalOpen(false);
        }
    };

    const handleMore = () => {
        router.push(`/portal/customers/${customerId}`);
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
                <span className="sr-only">{tc('viewDetails')}</span>
            </button>
            <FeedbackModal
                isOpen={dangerModalOpen}
                setIsOpen={setDangerModalOpen}
                variant="danger"
                title={t('deleteTitle', { name: customerName })}
                content={t('deleteCustomerConfirm')}
                confirmButtonLabel={tm('yesDelete')}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
};
