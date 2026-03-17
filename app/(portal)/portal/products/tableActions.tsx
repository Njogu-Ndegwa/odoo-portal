'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { useTranslations } from 'next-intl';
import { Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import FeedbackModal from '@/components/feedback-modal';
import { useAlert } from '@/app/contexts/alertContext';
import { DELETE_PRODUCT_UNIT } from '@/lib/portal/mutations';

interface ActionProps {
    row: any;
    onDelete: () => void;
}

export const actions = ({ row, onDelete }: ActionProps) => {
    const router = useRouter();
    const { alert } = useAlert();
    const t = useTranslations('portal.products');
    const tc = useTranslations('common');
    const tm = useTranslations('modal');
    const [dangerModalOpen, setDangerModalOpen] = useState(false);
    const productId = row.id;
    const productName = row.name || 'this product';

    const [deleteProduct] = useMutation(DELETE_PRODUCT_UNIT);

    const handleEdit = () => {
        router.push(`/portal/products/${productId}/edit`);
    };

    const handleDelete = () => {
        setDangerModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteProduct({ variables: { id: String(productId) } });
            alert({ text: t('deletedSuccess', { name: productName }), type: 'success' });
            setDangerModalOpen(false);
            onDelete?.();
        } catch (err) {
            alert({ text: err instanceof Error ? err.message : t('deleteProductFailed'), type: 'error' });
            setDangerModalOpen(false);
        }
    };

    const handleMore = () => {
        router.push(`/portal/products/${productId}`);
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
                title={t('deleteProductTitle', { name: productName })}
                content={t('deleteProductConfirm')}
                confirmButtonLabel={tm('yesDelete')}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
};
