import { TableColumn } from '@/components/table/table'

export const columns: TableColumn<any>[] = [
    {
        header: 'Name',
        accessor: 'name' as keyof any,
        cellRenderer: (value: unknown, item: any) => {
            const name = item.name || '-';
            const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
            return (
                <div className="font-medium text-gray-800 dark:text-gray-100">
                    {capitalizedName}
                </div>
            );
        }
    },
    {
        header: 'Email',
        accessor: 'email' as keyof any,
        cellRenderer: (value: unknown, item: any) => (
            <div className="max-w-md truncate">
                {item.email || '-'}
            </div>
        )
    },
    {
        header: 'Phone',
        accessor: 'phone' as keyof any,
        cellRenderer: (value: unknown, item: any) => (
            <div className="max-w-md truncate">
                {item.phone || '-'}
            </div>
        )
    },
    {
        header: 'City',
        accessor: 'city' as keyof any,
        cellRenderer: (value: unknown, item: any) => (
            <div className="max-w-md truncate">
                {item.city || '-'}
            </div>
        )
    },
    {
        header: 'Street',
        accessor: 'street' as keyof any,
        cellRenderer: (value: unknown, item: any) => (
            <div className="max-w-md truncate">
                {item.street || '-'}
            </div>
        )
    },
    {
        header: 'Type',
        accessor: 'isCompany' as keyof any,
        cellRenderer: (value: unknown, item: any) => {
            const isCompany = item.isCompany;
            const typeColor = isCompany
                ? "bg-blue-100 text-blue-800"
                : "bg-green-100 text-green-800";
            return (
                <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${typeColor}`}>
                    {isCompany ? 'Company' : 'Individual'}
                </div>
            );
        }
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
        value: 'Assign to Agent'
    },
]
