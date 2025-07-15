'use client'

interface FleetMetricsGridProps {
  totalDevices: number
  reportingDevices: number
  missingAssets: number
  healthScore: number
}

export default function FleetMetricsGrid({
  totalDevices,
  reportingDevices,
  missingAssets,
  healthScore
}: FleetMetricsGridProps) {
  const reportingPercentage = totalDevices > 0 ? ((reportingDevices / totalDevices) * 100).toFixed(1) : '0'
  
  const metrics = [
    {
      title: 'Total Devices',
      value: totalDevices.toLocaleString(),
      subtitle: 'Expected fleet size',
      color: 'text-gray-800 dark:text-gray-100',
      bgColor: 'bg-gray-50 dark:bg-gray-700/50',
      icon: '📱'
    },
    {
      title: 'Reporting Devices',
      value: reportingDevices.toLocaleString(),
      subtitle: `${reportingPercentage}% of fleet`,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      icon: '✅'
    },
    {
      title: 'Missing Assets',
      value: missingAssets.toLocaleString(),
      subtitle: 'Require attention',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      icon: '⚠️'
    },
    {
      title: 'Fleet Health',
      value: `${healthScore}%`,
      subtitle: 'Overall score',
      color: healthScore >= 90 ? 'text-green-600 dark:text-green-400' : 
             healthScore >= 75 ? 'text-yellow-600 dark:text-yellow-400' : 
             'text-red-600 dark:text-red-400',
      bgColor: healthScore >= 90 ? 'bg-green-50 dark:bg-green-900/20' : 
               healthScore >= 75 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 
               'bg-red-50 dark:bg-red-900/20',
      icon: healthScore >= 90 ? '💚' : healthScore >= 75 ? '💛' : '❤️'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`${metric.bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700/60`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">{metric.icon}</div>
            <div className={`text-xs font-semibold uppercase tracking-wide ${metric.color} opacity-75`}>
              {metric.title}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className={`text-3xl font-bold ${metric.color}`}>
              {metric.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {metric.subtitle}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}