'use client'

import { TableColumn } from '@/components/table/table'
import { useTranslations } from 'next-intl'

const stateBadge: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
    inactive: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
}

export function useServiceAccountColumns() {
    const t = useTranslations('portal.serviceAccounts.columns')
    return [
        {
            header: t('name'),
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
        header: t('class'),
        accessor: 'account_class' as keyof any,
        cellRenderer: (value: unknown, item: any) => (
            <div className="max-w-md truncate">
                {item.account_class || '-'}
            </div>
        )
    },
    {
        header: t('state'),
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
        header: t('code'),
        accessor: 'account_code' as keyof any,
        cellRenderer: (value: unknown, item: any) => (
            <div className="max-w-md truncate">
                {item.account_code || '—'}
            </div>
        )
    },
    {
        header: t('parent'),
        accessor: 'parent_name' as keyof any,
        cellRenderer: (value: unknown, item: any) => (
            <div className="max-w-md truncate">
                {item.parent_name || '—'}
            </div>
        )
    },
    ] as TableColumn<any>[]
}
