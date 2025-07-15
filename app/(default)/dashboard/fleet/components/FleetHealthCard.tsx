'use client'

import LineChart01 from '@/components/charts/line-chart-01'
import { getCssVariable } from '@/components/utils/utils'

interface FleetHealthData {
  currentScore: number
  previousScore: number
  trend: 'up' | 'down' | 'stable'
  criticalIssues: number
  warningIssues: number
}

interface FleetHealthCardProps {
  healthData: FleetHealthData
}

export default function FleetHealthCard({ healthData }: FleetHealthCardProps) {
  // Generate mock time series data for the last 30 days
  const generateHealthTrendData = () => {
    const data = []
    const now = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      // Simulate health score fluctuation around current score
      const baseScore = healthData.currentScore
      const variation = (Math.random() - 0.5) * 20 // ±10 points variation
      const score = Math.max(0, Math.min(100, baseScore + variation))
      
      data.push({
        x: date.toISOString().split('T')[0],
        y: Math.round(score)
      })
    }
    
    return data
  }

  const chartData = {
    labels: generateHealthTrendData().map(d => d.x),
    datasets: [
      {
        label: 'Fleet Health Score',
        data: generateHealthTrendData().map(d => d.y),
        borderColor: getCssVariable('--color-blue-500'),
        backgroundColor: getCssVariable('--color-blue-500'),
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: getCssVariable('--color-blue-500'),
        pointHoverBackgroundColor: getCssVariable('--color-blue-500'),
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        clip: 20,
        tension: 0.2,
      },
    ],
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getHealthStatus = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  const getTrendIcon = () => {
    switch (healthData.trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const scoreChange = healthData.currentScore - healthData.previousScore
  const changePercentage = healthData.previousScore > 0 
    ? Math.abs((scoreChange / healthData.previousScore) * 100) 
    : 0

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-1 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Fleet Health Score</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Overall fleet performance and status
        </p>
      </header>

      {/* Current Score */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className={`text-3xl font-bold ${getHealthColor(healthData.currentScore)}`}>
              {healthData.currentScore}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {getHealthStatus(healthData.currentScore)}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${
              scoreChange > 0 ? 'text-green-600 dark:text-green-400' :
              scoreChange < 0 ? 'text-red-600 dark:text-red-400' :
              'text-gray-600 dark:text-gray-400'
            }`}>
              {scoreChange > 0 ? '+' : ''}{scoreChange} ({changePercentage.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Issues Summary */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <div className="text-red-600 dark:text-red-400 text-lg font-semibold">
              {healthData.criticalIssues}
            </div>
            <div className="text-red-600 dark:text-red-400 text-xs">
              Critical Issues
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
            <div className="text-yellow-600 dark:text-yellow-400 text-lg font-semibold">
              {healthData.warningIssues}
            </div>
            <div className="text-yellow-600 dark:text-yellow-400 text-xs">
              Warnings
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="grow">
        <LineChart01 data={chartData} width={389} height={128} />
      </div>
    </div>
  )
}