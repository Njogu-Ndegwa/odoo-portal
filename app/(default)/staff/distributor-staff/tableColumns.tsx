import { TableColumn } from '@/components/table/table'
import { format } from 'date-fns'
import { useTranslations } from 'next-intl'

export function useDistributorStaffColumns() {
    const t = useTranslations('distributorStaff.columns')
    const tc = useTranslations('common')

    const columns: TableColumn<any>[] = [
        {
            header: t('name'),
            accessor: 'node.firstName' as keyof any,
            cellRenderer: (value: unknown, item: any) => {
                if (!item.node) return <div>-</div>;
                const firstName = item.node.firstName || '';
                const lastName = item.node.lastName || '';
                const fullName = `${firstName} ${lastName}`.trim();
                
                return (
                    <div className="font-medium text-gray-800 dark:text-gray-100">
                        {fullName || '-'}
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
            header: t('officeAddress'),
            accessor: 'node.officeAddress.city' as keyof any,
            cellRenderer: (value: unknown, item: any) => {
                if (!item.node) return <div>-</div>;
                
                const officeAddress = item.node.officeAddress;
                return (
                    <div className="max-w-md truncate">
                        {officeAddress ? `${officeAddress.city || ''}, ${officeAddress.country || ''}` : '-'}
                    </div>
                );
            }
        },
        {
            header: t('hireDate'),
            accessor: 'node.hireDate' as keyof any,
            cellRenderer: (value: unknown, item: any) => {
                if (!item.node) return <div>-</div>;
                
                try {
                    const hireDate = item.node.hireDate;
                    if (!hireDate) return <div>-</div>;
                    
                    const formattedDate = format(new Date(hireDate), 'MMM dd, yyyy');
                    return <div className="max-w-md truncate">{formattedDate}</div>;
                } catch (e) {
                    return <div className="max-w-md truncate">-</div>;
                }
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
            value: tc('delete')
        },
        {
            id: 1,
            value: tc('assignToAgent')
        },
    ]

    return { columns, dropdownOptions }
}