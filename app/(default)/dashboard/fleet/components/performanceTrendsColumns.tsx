// // import { Design2TableColumn } from '@/components/table/table2'
// // import { format } from 'date-fns'
// // import { TrendingUp, TrendingDown } from 'lucide-react'

// // export interface PerformanceTrend {
// //   id: string
// //   metric: string
// //   currentValue: number
// //   previousValue: number
// //   change: number
// //   changeType: 'increase' | 'decrease'
// //   period: string
// //   category: string
// //   updatedAt: string
// // }

// // export const performanceTrendsColumns: Design2TableColumn<PerformanceTrend>[] = [
// //   {
// //     header: 'Metric',
// //     accessor: (item) => item.metric,
// //     cellRenderer: (value, item) => (
// //       <div>
// //         <div className="font-medium text-gray-800 dark:text-gray-100">
// //           {value}
// //         </div>
// //         <div className="text-sm text-gray-600 dark:text-gray-400">
// //           {item.category}
// //         </div>
// //       </div>
// //     )
// //   },
// //   {
// //     header: 'Current Value',
// //     accessor: (item) => item.currentValue,
// //     cellRenderer: (value, item) => (
// //       <div className="font-medium text-gray-800 dark:text-gray-100">
// //         {item.metric.includes('Rate') || item.metric.includes('Score') ? `${value}%` : 
// //          item.metric.includes('Time') ? `${value}ms` : value.toLocaleString()}
// //       </div>
// //     )
// //   },
// //   {
// //     header: 'Previous Value',
// //     accessor: (item) => item.previousValue,
// //     cellRenderer: (value, item) => (
// //       <div className="text-gray-600 dark:text-gray-400">
// //         {item.metric.includes('Rate') || item.metric.includes('Score') ? `${value}%` : 
// //          item.metric.includes('Time') ? `${value}ms` : value.toLocaleString()}
// //       </div>
// //     )
// //   },
// //   {
// //     header: 'Change',
// //     accessor: (item) => item.change,
// //     cellRenderer: (value, item) => {
// //       const isPositive = item.changeType === 'increase'
// //       const isGoodChange = (item.metric.includes('Error') && !isPositive) || 
// //                           (item.metric.includes('Response Time') && !isPositive) ||
// //                           (!item.metric.includes('Error') && !item.metric.includes('Response Time') && isPositive)
      
// //       return (
// //         <div className={`flex items-center gap-1 ${
// //           isGoodChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
// //         }`}>
// //           {isPositive ? (
// //             <TrendingUp className="w-4 h-4" />
// //           ) : (
// //             <TrendingDown className="w-4 h-4" />
// //           )}
// //           <span className="font-medium">
// //             {isPositive ? '+' : ''}{value.toFixed(1)}%
// //           </span>
// //         </div>
// //       )
// //     }
// //   },
// //   {
// //     header: 'Period',
// //     accessor: (item) => item.period,
// //     cellRenderer: (value) => (
// //       <span className="text-gray-600 dark:text-gray-400 text-sm">{value}</span>
// //     )
// //   },
// //   {
// //     header: 'Last Updated',
// //     accessor: (item) => item.updatedAt,
// //     align: 'right',
// //     cellRenderer: (value) => {
// //       const formattedDate = format(new Date(String(value)), 'MMM dd, yyyy HH:mm')
// //       return <div className="text-gray-600 dark:text-gray-400 text-sm">{formattedDate}</div>
// //     }
// //   }
// // ]

// import { Design2TableColumn } from '@/components/table/table2'
// import { ArrowUp, ArrowDown } from 'lucide-react'

// export interface PerformanceTrend {
//   period: string
//   health: number
//   utilization: number
//   efficiency: number
// }

// export const performanceTrendsColumns: Design2TableColumn<PerformanceTrend>[] = [
//   {
//     header: 'Period',
//     accessor: (item) => item.period,
//     cellRenderer: (value) => (
//       <div className="font-medium text-gray-900 dark:text-white">
//         {value}
//       </div>
//     )
//   },
//   {
//     header: 'Fleet Health',
//     accessor: (item) => item.health,
//     cellRenderer: (value, item, index, data) => {
//       const previousRow = data && index > 0 ? data[index - 1] : null
//       const getChangeIndicator = (current: number, previous?: number) => {
//         if (!previous) return null
//         const change = current - previous
//         const percentage = (change / previous) * 100
        
//         if (Math.abs(percentage) < 0.1) return null
        
//         return (
//           <div className={`flex items-center gap-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
//             {change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
//             <span className="text-xs">{Math.abs(percentage).toFixed(1)}%</span>
//           </div>
//         )
//       }

//       return (
//         <div className="flex items-center justify-between">
//           <span className="text-gray-900 dark:text-white">{value}%</span>
//           {getChangeIndicator(value, previousRow?.health)}
//         </div>
//       )
//     }
//   },
//   {
//     header: 'Utilization',
//     accessor: (item) => item.utilization,
//     cellRenderer: (value, item, index, data) => {
//       const previousRow = data && index > 0 ? data[index - 1] : null
//       const getChangeIndicator = (current: number, previous?: number) => {
//         if (!previous) return null
//         const change = current - previous
//         const percentage = (change / previous) * 100
        
//         if (Math.abs(percentage) < 0.1) return null
        
//         return (
//           <div className={`flex items-center gap-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
//             {change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
//             <span className="text-xs">{Math.abs(percentage).toFixed(1)}%</span>
//           </div>
//         )
//       }

//       return (
//         <div className="flex items-center justify-between">
//           <span className="text-gray-900 dark:text-white">{value}%</span>
//           {getChangeIndicator(value, previousRow?.utilization)}
//         </div>
//       )
//     }
//   },
//   {
//     header: 'Efficiency',
//     accessor: (item) => item.efficiency,
//     cellRenderer: (value, item, index, data) => {
//       const previousRow = data && index > 0 ? data[index - 1] : null
//       const getChangeIndicator = (current: number, previous?: number) => {
//         if (!previous) return null
//         const change = current - previous
//         const percentage = (change / previous) * 100
        
//         if (Math.abs(percentage) < 0.1) return null
        
//         return (
//           <div className={`flex items-center gap-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
//             {change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
//             <span className="text-xs">{Math.abs(percentage).toFixed(1)}%</span>
//           </div>
//         )
//       }

//       return (
//         <div className="flex items-center justify-between">
//           <span className="text-gray-900 dark:text-white">{value}%</span>
//           {getChangeIndicator(value, previousRow?.efficiency)}
//         </div>
//       )
//     }
//   }
// ]


import { Design2TableColumn } from '@/components/table/table2'
import { TrendingUp, TrendingDown } from 'lucide-react'

export interface PerformanceTrend {
  id: string
  metric: string
  currentValue: number
  previousValue: number
  change: number
  changeType: 'increase' | 'decrease'
  period: string
  category: string
  updatedAt: string
}

export const performanceTrendsColumns: Design2TableColumn<PerformanceTrend>[] = [
  {
    header: 'Metric',
    accessor: (item) => item.metric,
    cellRenderer: (value, item) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white">
          {value}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {item.category}
        </div>
      </div>
    )
  },
  {
    header: 'Current Value',
    accessor: (item) => item.currentValue,
    cellRenderer: (value, item) => (
      <div className="font-medium text-gray-900 dark:text-white">
        {item.metric.includes('Rate') || item.metric.includes('Score') ? `${value}%` : 
         item.metric.includes('Time') ? `${value}ms` : value.toLocaleString()}
      </div>
    )
  },
  {
    header: 'Previous Value',
    accessor: (item) => item.previousValue,
    cellRenderer: (value, item) => (
      <div className="text-gray-600 dark:text-gray-400">
        {item.metric.includes('Rate') || item.metric.includes('Score') ? `${value}%` : 
         item.metric.includes('Time') ? `${value}ms` : value.toLocaleString()}
      </div>
    )
  },
  {
    header: 'Change',
    accessor: (item) => item.change,
    cellRenderer: (value, item) => {
      const isPositive = item.changeType === 'increase'
      const isGoodChange = (item.metric.includes('Error') && !isPositive) || 
                          (item.metric.includes('Response Time') && !isPositive) ||
                          (!item.metric.includes('Error') && !item.metric.includes('Response Time') && isPositive)
      
      return (
        <div className={`flex items-center gap-1 ${
          isGoodChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="font-medium">
            {isPositive ? '+' : ''}{value.toFixed(1)}%
          </span>
        </div>
      )
    }
  }
]
