import { TableColumn } from '@/components/table/table'
import { format } from 'date-fns'
import { MapPin } from 'lucide-react'

export const columns: TableColumn<any>[] = [
  {
    header: 'Fleet Name',
    accessor: 'name' as keyof any,
    cellRenderer: (value: unknown, item: any) => {
      return (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {item.name || '-'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">
            {item.description || '-'}
          </div>
        </div>
      )
    }
  },
  {
    header: 'Manager',
    accessor: 'manager' as keyof any,
    cellRenderer: (value: unknown, item: any) => {
      return (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/20 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-violet-600 dark:text-violet-400">
              {item.manager ? item.manager.split(' ').map((n: string) => n[0]).join('') : '-'}
            </span>
          </div>
          <span className="text-gray-900 dark:text-white">{item.manager || '-'}</span>
        </div>
      )
    }
  },
  {
    header: 'Devices',
    accessor: 'deviceCount' as keyof any,
    cellRenderer: (value: unknown, item: any) => {
      const activePercentage = item.deviceCount ? ((item.activeDevices / item.deviceCount) * 100).toFixed(1) : 0
      return (
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-white">
            {item.activeDevices || 0}/{item.deviceCount || 0}
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            {activePercentage}% active
          </div>
        </div>
      )
    }
  },
  {
    header: 'Health Score',
    accessor: 'healthScore' as keyof any,
    cellRenderer: (value: unknown, item: any) => {
      const score = item.healthScore || 0
      const getHealthColor = (score: number) => {
        if (score >= 90) return 'text-green-600 dark:text-green-400'
        if (score >= 75) return 'text-yellow-600 dark:text-yellow-400'
        return 'text-red-600 dark:text-red-400'
      }
      
      return (
        <div className={`text-lg font-bold ${getHealthColor(score)}`}>
          {score}%
        </div>
      )
    }
  },
  {
    header: 'Status',
    accessor: 'status' as keyof any,
    cellRenderer: (value: unknown, item: any) => {
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'active': return 'text-green-600 dark:text-green-400'
          case 'inactive': return 'text-gray-600 dark:text-gray-400'
          case 'maintenance': return 'text-yellow-600 dark:text-yellow-400'
          default: return 'text-gray-600 dark:text-gray-400'
        }
      }

      const getStatusBgColor = (status: string) => {
        switch (status) {
          case 'active': return 'bg-green-100 dark:bg-green-900/20'
          case 'inactive': return 'bg-gray-100 dark:bg-gray-900/20'
          case 'maintenance': return 'bg-yellow-100 dark:bg-yellow-900/20'
          default: return 'bg-gray-100 dark:bg-gray-900/20'
        }
      }

      const status = item.status || 'inactive'
      
      return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBgColor(status)} ${getStatusColor(status)}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )
    }
  },
  {
    header: 'Location',
    accessor: 'location' as keyof any,
    cellRenderer: (value: unknown, item: any) => {
      return (
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{item.location || '-'}</span>
        </div>
      )
    }
  },
  {
    header: 'Created At',
    accessor: 'createdAt' as keyof any,
    cellRenderer: (value: unknown, item: any) => {
      try {
        if (!item.createdAt) return <div className="max-w-md truncate">-</div>
        const formattedDate = format(new Date(item.createdAt), 'MMM dd, yyyy')
        return <div className="max-w-md truncate">{formattedDate}</div>
      } catch (e) {
        return <div className="max-w-md truncate">-</div>
      }
    }
  }
]

export const dropdownOptions = [
  {
    id: 0,
    value: 'Delete'
  },
  {
    id: 1,
    value: 'Assign to Agent'
  },
  {
    id: 2,
    value: 'Re-assign to Agent'
  }
]