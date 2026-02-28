'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import FeedbackModal from '@/components/feedback-modal';
import { getSalesToken } from '@/lib/odoo-auth';
import { deleteProductItem } from '@/lib/services/product-service';

interface ActionProps {
    row: any;
    onDelete: () => void;
}

export const actions = ({ row, onDelete }: ActionProps) => {
    const router = useRouter();
    const [dangerModalOpen, setDangerModalOpen] = useState(false);
    const productId = row.id;
    const productName = row.name || 'this product';

    const handleEdit = () => {
        router.push(`/portal/products/${productId}/edit`);
    };

    const handleDelete = () => {
        setDangerModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        const token = getSalesToken();
        if (!token) return;

        try {
            await deleteProductItem(productId, token);
        } catch (err) {
            console.error('Failed to delete product:', err);
        } finally {
            setDangerModalOpen(false);
            if (onDelete) {
                onDelete();
            }
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
