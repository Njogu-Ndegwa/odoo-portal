'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
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
            alert({ text: `${productName} deleted successfully`, type: 'success' });
            setDangerModalOpen(false);
            onDelete?.();
        } catch (err) {
            alert({ text: err instanceof Error ? err.message : 'Failed to delete product', type: 'error' });
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
                title={`Delete ${productName}?`}
                content="Are you sure you want to delete this product? This will clear all linked order lines, invoices, and subscriptions."
                confirmButtonLabel="Yes, Delete it"
                onConfirm={handleConfirmDelete}
            />
        </>
    );
};
