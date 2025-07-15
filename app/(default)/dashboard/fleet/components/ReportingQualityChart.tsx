'use client'

import BarChart01 from '@/components/charts/bar-chart-01'
import { getCssVariable } from '@/components/utils/utils'

interface ReportingQuality {
  excellent: number
  good: number
  concerning: number
  poor: number
}

interface ReportingQualityChartProps {
  reportingQuality: ReportingQuality
}

export default function ReportingQualityChart({ reportingQuality }: ReportingQualityChartProps) {
  // Generate mock time series data for the last 6 months
  const generateTimeSeriesData = (baseValue: number) => {
    const data = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const variation = (Math.random() - 0.5) * 0.2 // ±10% variation
      const value = Math.max(0, Math.round(baseValue * (1 + variation)))
      data.push(value)
    }
    
    return data
  }

  const chartData = {
    labels: [
      '08-01-2024', '09-01-2024', '10-01-2024',
      '11-01-2024', '12-01-2024', '01-01-2025',
    ],
    datasets: [
      {
        label: 'Excellent (< 1h)',
        data: generateTimeSeriesData(reportingQuality.excellent),
        backgroundColor: getCssVariable('--color-green-500'),
        hoverBackgroundColor: getCssVariable('--color-green-600'),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
      {
        label: 'Good (1-6h)',
        data: generateTimeSeriesData(reportingQuality.good),
        backgroundColor: getCssVariable('--color-yellow-500'),
        hoverBackgroundColor: getCssVariable('--color-yellow-600'),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
      {
        label: 'Concerning (6-24h)',
        data: generateTimeSeriesData(reportingQuality.concerning),
        backgroundColor: getCssVariable('--color-orange-500'),
        hoverBackgroundColor: getCssVariable('--color-orange-600'),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
      {
        label: 'Poor (> 24h)',
        data: generateTimeSeriesData(reportingQuality.poor),
        backgroundColor: getCssVariable('--color-red-500'),
        hoverBackgroundColor: getCssVariable('--color-red-600'),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
    ],
  }

  const totalDevices = reportingQuality.excellent + reportingQuality.good + 
                      reportingQuality.concerning + reportingQuality.poor

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-1 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Reporting Quality</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Device reporting frequency (Last 24h)
        </p>
      </header>

      {/* Current Status Summary */}
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700/60">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Excellent:</span>
            <span className="ml-1 font-semibold text-gray-800 dark:text-gray-100">
              {reportingQuality.excellent}
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Good:</span>
            <span className="ml-1 font-semibold text-gray-800 dark:text-gray-100">
              {reportingQuality.good}
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Concerning:</span>
            <span className="ml-1 font-semibold text-gray-800 dark:text-gray-100">
              {reportingQuality.concerning}
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Poor:</span>
            <span className="ml-1 font-semibold text-gray-800 dark:text-gray-100">
              {reportingQuality.poor}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <BarChart01 data={chartData} width={595} height={248} />
    </div>
  )
}