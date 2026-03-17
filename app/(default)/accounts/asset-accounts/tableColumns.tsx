import { TableColumn } from '@/components/table/table'
import { format } from 'date-fns'
import { useTranslations } from 'next-intl'

export function useAssetAccountColumns() {
    const t = useTranslations('assetAccounts.columns')
    const td = useTranslations('common')

    const columns: TableColumn<any>[] = [
        {
            header: t('assetId'),
            accessor: 'node.asset.sellerItemID' as keyof any,
            cellRenderer: (value: unknown, item: any) => (
                <div className="font-medium text-gray-800 dark:text-gray-100">
                    {String(item.node.asset.sellerItemID)}
                </div>
            )
        },
        {
            header: t('accountStage'),
            accessor: 'node.accountStage' as keyof any,
            cellRenderer: (value: unknown, item: any) => {
                const stage = item.node.accountStage;
                let stageColor = "bg-gray-100 text-gray-800";

                if (stage === "ACCOUNT_ACTIVATED") stageColor = "bg-green-100 text-green-800";
                if (stage === "PAYPLAN_COMPLETED") stageColor = "bg-blue-100 text-blue-800";
                if (stage === "ASSET_USER_PAIRED") stageColor = "bg-purple-100 text-purple-800";
                if (stage === "ACCOUNT_CLOSED") stageColor = "bg-red-100 text-red-800";

                return (
                    <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${stageColor}`}>
                        {stage.replace(/_/g, ' ')}
                    </div>
                );
            }
        },
        {
            header: t('customer'),
            accessor: 'node.credit.owner.name' as keyof any,
            cellRenderer: (value: unknown, item: any) => (
                <div className="font-medium text-gray-800 dark:text-gray-100">
                    {item.node.credit?.owner?.name || '-'}
                </div>
            )
        },
        {
            header: t('contact'),
            accessor: 'node.credit.owner.contact.phone' as keyof any,
            cellRenderer: (value: unknown, item: any) => (
                <div className="max-w-md truncate">
                    {item.node.credit?.owner?.contact?.phone || '-'}
                </div>
            )
        },
        {
            header: t('location'),
            accessor: 'node.credit.owner.address.city' as keyof any,
            cellRenderer: (value: unknown, item: any) => {
                const address = item.node.credit?.owner?.address;
                return (
                    <div className="max-w-md truncate">
                        {address ? `${address.city}, ${address.country}` : '-'}
                    </div>
                );
            }
        },
        {
            header: t('balance'),
            accessor: 'node.credit.balance' as keyof any,
            cellRenderer: (value: unknown, item: any) => {
                const balance = item.node.credit?.balance;
                const color = balance < 0 ? 'text-red-600' : 'text-green-600';
                return (
                    <div className={`font-medium ${color}`}>
                        ${typeof balance === 'number' ? balance.toFixed(2) : '0.00'}
                    </div>
                );
            }
        },
        {
            header: t('status'),
            accessor: 'node.credit.accountStatus' as keyof any,
            cellRenderer: (value: unknown, item: any) => {
                const status = item.node.credit?.accountStatus;
                let statusColor = "bg-gray-100 text-gray-800";

                if (status === "ACTIVE") statusColor = "bg-green-100 text-green-800";
                if (status === "INACTIVE") statusColor = "bg-red-100 text-red-800";

                return (
                    <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${statusColor}`}>
                        {status || '-'}
                    </div>
                );
            }
        },
        {
            header: t('createdAt'),
            accessor: 'node.createdAt' as keyof any,
            cellRenderer: (value: unknown, item: any) => {
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
