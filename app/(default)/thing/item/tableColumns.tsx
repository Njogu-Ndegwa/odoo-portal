import { TableColumn } from '@/components/table/table'
import { format } from 'date-fns'
import { useTranslations } from 'next-intl'

export function useItemColumns() {
    const t = useTranslations('thingItem.columns')
    const tc = useTranslations('common')

    const columns: TableColumn<any>[] = [
        {
            header: t('accountNumber'),
            accessor: 'node.oemItemID' as keyof any,
            cellRenderer: (value: unknown, item: any) => {
                if (!item.node) return <div>-</div>;
                
                return (
                    <div className="font-medium text-gray-800 dark:text-gray-100">
                        {item.node.oemItemID || '-'}
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
                
                if (type === "SIMULATOR") typeColor = "bg-purple-100 text-purple-800";
                if (type === "BATTERY") typeColor = "bg-green-100 text-green-800";
                if (type === "CONTROLLER") typeColor = "bg-blue-100 text-blue-800";
                
                return (
                    <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${typeColor}`}>
                        {type || '-'}
                    </div>
                );
            }
        },
        {
            header: t('batchNumber'),
            accessor: 'node.itemBatch.batchNumber' as keyof any,
            cellRenderer: (value: unknown, item: any) => (
                <div className="max-w-md truncate">
                    {item.node.itemBatch?.batchNumber || '-'}
                </div>
            )
        },
        {
            header: t('description'),
            accessor: 'node.description' as keyof any,
            cellRenderer: (value: unknown, item: any) => (
                <div className="max-w-md truncate">
                    {item.node.description || '-'}
                </div>
            )
        },
        {
            header: t('fleet'),
            accessor: 'node.itemFleet.fleetName' as keyof any,
            cellRenderer: (value: unknown, item: any) => (
                <div className="max-w-md truncate">
                    {item.node.itemFleet?.fleetName || '-'}
                </div>
            )
        },
        {
            header: t('lifeCycle'),
            accessor: 'node.lifeCycle' as keyof any,
            cellRenderer: (value: unknown, item: any) => {
                if (!item.node) return <div>-</div>;
                
                const lifeCycle = item.node.lifeCycle;
                let lifeCycleColor = "bg-gray-100 text-gray-800";
                
                if (lifeCycle === "ACTIVE") lifeCycleColor = "bg-green-100 text-green-800";
                if (lifeCycle === "INACTIVE") lifeCycleColor = "bg-red-100 text-red-800";
                if (lifeCycle === "PENDING") lifeCycleColor = "bg-yellow-100 text-yellow-800";
                
                return (
                    <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${lifeCycleColor}`}>
                        {lifeCycle || '-'}
                    </div>
                );
            }
        },
        {
            header: t('customer'),
            accessor: 'node.assetAccount.credit.owner.name' as keyof any,
            cellRenderer: (value: unknown, item: any) => (
                <div className="max-w-md truncate">
                    {item.node.assetAccount?.credit?.owner?.name || '-'}
                </div>
            )
        },
        {
            header: t('firmware'),
            accessor: 'node.itemFirmware.version' as keyof any,
            cellRenderer: (value: unknown, item: any) => (
                <div className="max-w-md truncate">
                    {item.node.itemFirmware?.version || '-'}
                </div>
            )
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
        }
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