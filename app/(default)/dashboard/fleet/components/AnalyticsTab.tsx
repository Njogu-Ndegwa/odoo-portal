
'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { BarChart3, TrendingUp, PieChart, Calendar, Download, Filter, ArrowUp, ArrowDown } from 'lucide-react'
import Design2Table from '@/components/table/table2'
import DoughnutChart from '@/components/charts/doughnut-chart'
import { performanceTrendsColumns, PerformanceTrend } from './performanceTrendsColumns'

interface AnalyticsData {
  fleetUtilization: {
    labels: string[]
    data: number[]
  }
  batteryHealth: {
    excellent: number
    good: number
    fair: number
    poor: number
  }
  routeEfficiency: {
    avgDistance: number
    avgSpeed: number
    fuelSaved: number
    co2Reduced: number
  }
  performanceTrends: PerformanceTrend[]
}

export default function AnalyticsTab() {
  const t = useTranslations('fleetDashboard')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedMetric, setSelectedMetric] = useState<'health' | 'utilization' | 'efficiency'>('health')

  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedPeriod])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setAnalyticsData({
        fleetUtilization: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          data: [85, 92, 78, 88, 95, 72, 68]
        },
        batteryHealth: {
          excellent: 67,
          good: 23,
          fair: 8,
          poor: 2
        },
        routeEfficiency: {
          avgDistance: 124.5,
          avgSpeed: 28.3,
          fuelSaved: 2340,
          co2Reduced: 5.8
        },
        performanceTrends: [
          {
            id: 'trend_001',
            metric: 'Fleet Health Score',
            currentValue: 92,
            previousValue: 89,
            change: 3.4,
            changeType: 'increase',
            period: 'Week 1',
            category: 'Health',
            updatedAt: '2024-01-15T10:00:00.000Z'
          },
          {
            id: 'trend_002',
            metric: 'Fleet Utilization Rate',
            currentValue: 87,
            previousValue: 84,
            change: 3.6,
            changeType: 'increase',
            period: 'Week 2',
            category: 'Efficiency',
            updatedAt: '2024-01-15T09:30:00.000Z'
          },
          {
            id: 'trend_003',
            metric: 'Response Time',
            currentValue: 245,
            previousValue: 289,
            change: -15.2,
            changeType: 'decrease',
            period: 'Week 3',
            category: 'Performance',
            updatedAt: '2024-01-15T09:00:00.000Z'
          },
          {
            id: 'trend_004',
            metric: 'Battery Health Score',
            currentValue: 91,
            previousValue: 88,
            change: 3.4,
            changeType: 'increase',
            period: 'Week 4',
            category: 'Health',
            updatedAt: '2024-01-15T08:00:00.000Z'
          }
        ]
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-400 font-medium">Loading analytics...</span>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return <div>Error loading analytics data</div>
  }

  return (
    <div className="space-y-8">
      {/* Analytics Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('analyticsReports')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('performanceInsights')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl border border-gray-200 dark:border-gray-600 p-1">
              {(['7d', '30d', '90d', '1y'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === period
                      ? 'bg-violet-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : period === '90d' ? '90 Days' : '1 Year'}
                </button>
              ))}
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors duration-200">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title={t('averageDistance')}
          value={`${analyticsData.routeEfficiency.avgDistance} km`}
          subtitle={t('perRoute')}
          icon={<BarChart3 className="w-6 h-6" />}
          trend={5.2}
          color="blue"
        />
        <MetricCard
          title={t('averageSpeed')}
          value={`${analyticsData.routeEfficiency.avgSpeed} km/h`}
          subtitle={t('fleetAverage')}
          icon={<TrendingUp className="w-6 h-6" />}
          trend={-2.1}
          color="green"
        />
        <MetricCard
          title={t('fuelSaved')}
          value={`${analyticsData.routeEfficiency.fuelSaved} L`}
          subtitle={t('thisMonth')}
          icon={<PieChart className="w-6 h-6" />}
          trend={12.8}
          color="purple"
        />
        <MetricCard
          title={t('co2Reduced')}
          value={`${analyticsData.routeEfficiency.co2Reduced} tons`}
          subtitle={t('environmentalImpact')}
          icon={<Calendar className="w-6 h-6" />}
          trend={8.5}
          color="emerald"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Fleet Utilization Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Fleet Utilization Trends
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Daily utilization percentage over time
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as any)}
                className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="health">Fleet Health</option>
                <option value="utilization">Utilization</option>
                <option value="efficiency">Efficiency</option>
              </select>
            </div>
          </div>
          
          <UtilizationChart 
            data={analyticsData.fleetUtilization} 
            metric={selectedMetric}
            trends={analyticsData.performanceTrends}
          />
        </div>

        {/* Battery Health Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Battery Health Distribution
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current fleet battery status
            </p>
          </div>
          
          <BatteryHealthChart data={analyticsData.batteryHealth} />
        </div>
      </div>

      {/* Performance Trends Table - Updated to use Design2Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Performance Trends Summary
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Key performance indicators and their changes over time
          </p>
        </div>
        
        <div className="w-full">
          <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
            <Design2Table
              data={analyticsData.performanceTrends}
              columns={performanceTrendsColumns}
              selectable={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Metric Card Component
interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  trend: number
  color: 'blue' | 'green' | 'purple' | 'emerald'
}

function MetricCard({ title, value, subtitle, icon, trend, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
  }

  return (
    <div className={`${colorClasses[color]} border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className={colorClasses[color].split(' ').slice(-2).join(' ')}>
            {icon}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {trend > 0 ? (
            <ArrowUp className="w-4 h-4 text-green-500" />
          ) : (
            <ArrowDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(trend)}%
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {title}
        </div>
        <div className={`text-3xl font-bold ${colorClasses[color].split(' ').slice(-2).join(' ')}`}>
          {value}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {subtitle}
        </div>
      </div>
    </div>
  )
}

// Utilization Chart Component
function UtilizationChart({ data, metric, trends }: { 
  data: AnalyticsData['fleetUtilization'], 
  metric: string,
  trends: AnalyticsData['performanceTrends']
}) {
  const maxValue = Math.max(...data.data)
  
  return (
    <div className="space-y-4">
      <div className="h-64 flex items-end justify-between gap-2">
        {data.labels.map((label, index) => {
          const height = (data.data[index] / maxValue) * 100
          return (
            <div key={label} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden" style={{ height: '200px' }}>
                <div 
                  className="w-full bg-gradient-to-t from-violet-500 to-purple-400 rounded-t-lg transition-all duration-500"
                  style={{ height: `${height}%`, marginTop: `${100 - height}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {label}
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {data.data[index]}%
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Average: {(data.data.reduce((a, b) => a + b, 0) / data.data.length).toFixed(1)}%
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            Peak: {Math.max(...data.data)}%
          </span>
        </div>
      </div>
    </div>
  )
}

// Battery Health Chart Component
function BatteryHealthChart({ data }: { data: AnalyticsData['batteryHealth'] }) {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0)
  
  // Prepare data for Chart.js DoughnutChart
  const chartData = {
    labels: ['Excellent', 'Good', 'Fair', 'Poor'],
    datasets: [
      {
        data: [data.excellent, data.good, data.fair, data.poor],
        backgroundColor: [
          '#10b981', // green-500
          '#3b82f6', // blue-500  
          '#eab308', // yellow-500
          '#ef4444'  // red-500
        ],
        borderWidth: 0,
        cutout: '80%'
      }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Chart.js Doughnut Chart with Center Text */}
      <div className="relative w-48 h-48 mx-auto">
        <DoughnutChart data={chartData} width={192} height={192} />
        {/* Center text overlay - positioned over the chart canvas */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {total}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">
              Total Devices
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {[
          { label: 'Excellent', value: data.excellent, color: 'bg-green-500' },
          { label: 'Good', value: data.good, color: 'bg-blue-500' },
          { label: 'Fair', value: data.fair, color: 'bg-yellow-500' },
          { label: 'Poor', value: data.poor, color: 'bg-red-500' }
        ].map((segment) => {
          const percentage = (segment.value / total) * 100
          return (
            <div key={segment.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${segment.color}`} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {segment.label}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {segment.value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}