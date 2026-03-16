import { TableColumn } from '@/components/table/table'

const stateBadge: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
    inactive: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
}

export const columns: TableColumn<any>[] = [
    {
        header: 'Name',
        accessor: 'name' as keyof any,
        cellRenderer: (value: unknown, item: any) => {
            const name = item.name || '-'
            return (
                <div className="font-medium text-gray-800 dark:text-gray-100">
                    {name}
                </div>
            )
        }
    },
    {
        header: 'Class',
        accessor: 'account_class' as keyof any,
        cellRenderer: (value: unknown, item: any) => (
            <div className="max-w-md truncate">
                {item.account_class || '-'}
            </div>
        )
    },
    {
        header: 'State',
        accessor: 'state' as keyof any,
        cellRenderer: (value: unknown, item: any) => {
            const state = item.state || 'inactive'
            return (
                <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${stateBadge[state] ?? stateBadge.inactive}`}>
                    {state}
                </div>
            )
        }
    },
    {
        header: 'Code',
        accessor: 'account_code' as keyof any,
        cellRenderer: (value: unknown, item: any) => (
            <div className="max-w-md truncate">
                {item.account_code || '—'}
            </div>
        )
    },
    {
        header: 'Parent',
        accessor: 'parent_name' as keyof any,
        cellRenderer: (value: unknown, item: any) => (
            <div className="max-w-md truncate">
                {item.parent_name || '—'}
            </div>
        )
    },
]

export const dropdownOptions = [
    {
        id: 0,
        value: 'Delete Selected'
    },
]
