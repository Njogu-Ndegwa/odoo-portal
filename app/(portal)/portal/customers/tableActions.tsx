'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
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
            alert({ text: `${customerName} deleted successfully`, type: 'success' });
            setDangerModalOpen(false);
            onDelete?.();
        } catch (err) {
            alert({ text: err instanceof Error ? err.message : 'Failed to delete customer', type: 'error' });
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
                title={`Delete ${customerName}?`}
                content="Are you sure you want to delete this customer? This action cannot be undone."
                confirmButtonLabel="Yes, Delete it"
                onConfirm={handleConfirmDelete}
            />
        </>
    );
};
