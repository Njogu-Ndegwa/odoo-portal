import { TableColumn } from '@/components/table/table'

export const columns: TableColumn<any>[] = [
    {
        header: 'Name',
        accessor: 'name' as keyof any,
        cellRenderer: (value: unknown, item: any) => {
            const name = item.name || '-';
            return (
                <div className="font-medium text-gray-800 dark:text-gray-100">
                    {name}
                </div>
            );
        }
    },
    {
        header: 'SKU',
        accessor: 'sku' as keyof any,
        cellRenderer: (value: unknown, item: any) => (
            <div className="max-w-md truncate font-mono text-xs">
                {item.sku || '-'}
            </div>
        )
    },
    {
        header: 'Price',
        accessor: 'listPrice' as keyof any,
        cellRenderer: (value: unknown, item: any) => (
            <div className="font-medium text-gray-800 dark:text-gray-100">
                {item.currencyName || ''} {item.listPrice?.toLocaleString() ?? '-'}
            </div>
        )
    },
    {
        header: 'Category',
        accessor: 'puCategory' as keyof any,
        cellRenderer: (value: unknown, item: any) => {
            const cat = item.puCategory;
            if (!cat) return <div>-</div>;
            const colors: Record<string, string> = {
                physical: 'bg-blue-100 text-blue-800',
                service: 'bg-green-100 text-green-800',
                contract: 'bg-purple-100 text-purple-800',
                digital: 'bg-amber-100 text-amber-800',
            };
            return (
                <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${colors[cat] || 'bg-gray-100 text-gray-800'}`}>
                    {cat}
                </div>
            );
        }
    },
    {
        header: 'Type',
        accessor: 'type' as keyof any,
        cellRenderer: (value: unknown, item: any) => (
            <div className="max-w-md truncate capitalize">
                {item.type || '-'}
            </div>
        )
    },
    {
        header: 'Recurring',
        accessor: 'recurringInvoice' as keyof any,
        cellRenderer: (value: unknown, item: any) => (
            <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${item.recurringInvoice ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {item.recurringInvoice ? 'Yes' : 'No'}
            </div>
        )
    },
    {
        header: 'Created At',
        accessor: 'createdAt' as keyof any,
        cellRenderer: (value: unknown, item: any) => {
            try {
                if (!item.createdAt) return <div>-</div>;
                const d = new Date(item.createdAt);
                return (
                    <div className="max-w-md truncate">
                        {d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </div>
                );
            } catch {
                return <div>-</div>;
            }
        }
    },
]

export const dropdownOptions = [
    {
        id: 0,
        value: 'Delete'
    },
]
