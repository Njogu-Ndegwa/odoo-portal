'use client'

import { useTranslations } from 'next-intl'
import DoughnutChart from '@/components/charts/doughnut-chart'
import { getCssVariable } from '@/components/utils/utils'

interface FleetData {
  name: string
  deviceCount: number
  healthScore: number
  reportingDevices: number
}

interface FleetDistributionChartProps {
  fleetData: FleetData[]
}

export default function FleetDistributionChart({ fleetData }: FleetDistributionChartProps) {
  const t = useTranslations('fleetDashboard')
  const chartData = {
    labels: fleetData.map(fleet => fleet.name),
    datasets: [
      {
        label: 'Fleet Distribution',
        data: fleetData.map(fleet => fleet.deviceCount),
        backgroundColor: [
          getCssVariable('--color-violet-500'),
          getCssVariable('--color-sky-500'),
          getCssVariable('--color-green-500'),
          getCssVariable('--color-orange-500'),
          getCssVariable('--color-purple-500'),
          getCssVariable('--color-pink-500'),
        ],
        hoverBackgroundColor: [
          getCssVariable('--color-violet-600'),
          getCssVariable('--color-sky-600'),
          getCssVariable('--color-green-600'),
          getCssVariable('--color-orange-600'),
          getCssVariable('--color-purple-600'),
          getCssVariable('--color-pink-600'),
        ],
        borderWidth: 0,
      },
    ],
  }

  const totalDevices = fleetData.reduce((sum, fleet) => sum + fleet.deviceCount, 0)

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-1 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">{t('devices')}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Device count by fleet ({totalDevices.toLocaleString()} total)
        </p>
      </header>
      
      {/* Chart */}
      <DoughnutChart data={chartData} width={389} height={260} />
      
      {/* Fleet Summary List */}
      <div className="px-5 pb-4">
        <div className="space-y-2">
          {fleetData.map((fleet, index) => (
            <div key={fleet.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ 
                    backgroundColor: [
                      getCssVariable('--color-violet-500'),
                      getCssVariable('--color-sky-500'),
                      getCssVariable('--color-green-500'),
                      getCssVariable('--color-orange-500'),
                      getCssVariable('--color-purple-500'),
                      getCssVariable('--color-pink-500'),
                    ][index] || getCssVariable('--color-gray-500')
                  }}
                />
                <span className="text-gray-800 dark:text-gray-100 font-medium">
                  {fleet.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-gray-800 dark:text-gray-100 font-semibold">
                  {fleet.deviceCount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {fleet.reportingDevices} reporting
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}