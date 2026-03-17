import { TableColumn } from '@/components/table/table'
import { format } from 'date-fns'
import { useTranslations } from 'next-intl'

export function useMessageGroupColumns() {
    const t = useTranslations('messageGroup.columns')
    const td = useTranslations('common')

    const columns: TableColumn<any>[] = [
        {
            header: t('name'),
            accessor: 'node.name' as keyof any,
            cellRenderer: (value: unknown, item: any) => {
                if (!item.node) return <div>-</div>;

                return (
                    <div className="font-medium text-gray-800 dark:text-gray-100">
                        {item.node.name || '-'}
                    </div>
                );
            }
        },
        {
            header: t('type'),
            accessor: 'node.type' as keyof any,
            cellRenderer: (value: unknown, item: any) => {
                if (!item.node) return <div>-</div>;

                const type = item.node.type;
                let typeColor = "bg-gray-100 text-gray-800";

                if (type === "CUSTOMER") typeColor = "bg-green-100 text-green-800";
                if (type === "AGENT") typeColor = "bg-blue-100 text-blue-800";
                if (type === "ADMIN") typeColor = "bg-purple-100 text-purple-800";

                return (
                    <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${typeColor}`}>
                        {type || '-'}
                    </div>
                );
            }
        },
        {
            header: t('phone'),
            accessor: 'node.contact.phone' as keyof any,
            cellRenderer: (value: unknown, item: any) => {
                if (!item.node) return <div>-</div>;

                return (
                    <div className="max-w-md truncate">
                        {item.node.contact?.phone || '-'}
                    </div>
                );
            }
        },
        {
            header: t('email'),
            accessor: 'node.contact.email' as keyof any,
            cellRenderer: (value: unknown, item: any) => {
                if (!item.node) return <div>-</div>;

                return (
                    <div className="max-w-md truncate">
                        {item.node.contact?.email || '-'}
                    </div>
                );
            }
        },
        {
            header: t('location'),
            accessor: 'node.address.city' as keyof any,
            cellRenderer: (value: unknown, item: any) => {
                if (!item.node) return <div>-</div>;

                const address = item.node.address;
                return (
                    <div className="max-w-md truncate">
                        {address ? `${address.city || ''}, ${address.country || ''}` : '-'}
                    </div>
                );
            }
        },
        {
            header: t('distributor'),
            accessor: 'node.distributor.name' as keyof any,
            cellRenderer: (value: unknown, item: any) => {
                if (!item.node) return <div>-</div>;

                return (
                    <div className="max-w-md truncate">
                        {item.node.distributor?.name || '-'}
                    </div>
                );
            }
        },
        {
            header: t('createdAt'),
            accessor: 'node.createdAt' as keyof any,
            cellRenderer: (value: unknown, item: any) => {
                if (!item.node) return <div>-</div>;

                try {
                    const formattedDate = format(new Date(item.node.createdAt), 'MMM dd, yyyy');
                    return <div className="max-w-md truncate">{formattedDate}</div>;
                } catch (e) {
                    return <div className="max-w-md truncate">-</div>;
                }
            }
        },
        {
            header: t('updatedAt'),
            accessor: 'node.updatedAt' as keyof any,
            cellRenderer: (value: unknown, item: any) => {
                if (!item.node) return <div>-</div>;

                try {
                    const formattedDate = format(new Date(item.node.updatedAt), 'MMM dd, yyyy');
                    return <div className="max-w-md truncate">{formattedDate}</div>;
                } catch (e) {
                    return <div className="max-w-md truncate">-</div>;
                }
            }
        },
    ]

    const dropdownOptions = [
        {
            id: 0,
            value: td('delete')
        },
        {
            id: 1,
            value: td('assignToAgent')
        },
    ]

    return { columns, dropdownOptions }
}
