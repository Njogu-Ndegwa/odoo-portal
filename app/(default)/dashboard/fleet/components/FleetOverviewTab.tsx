// 'use client'

// import { useEffect, useState } from 'react'
// import FleetHealthCard from './FleetHealthCard'
// import FleetDistributionChart from './FleetDistributionChart'
// import ReportingQualityChart from './ReportingQualityChart'
// import FleetMetricsGrid from './FleetMetricsGrid'

// interface OverallFleetSummary {
//   total_expected_devices: number
//   total_currently_reporting: number
//   total_missing_assets: number
//   overall_fleet_health_percent: number
//   reporting_quality: {
//     excellent: number
//     good: number
//     concerning: number
//     poor: number
//   }
// }

// interface FleetData {
//   name: string
//   deviceCount: number
//   healthScore: number
//   reportingDevices: number
// }

// export default function FleetOverviewTab() {
//   const [overallSummary, setOverallSummary] = useState<OverallFleetSummary | null>(null)
//   const [fleetData, setFleetData] = useState<FleetData[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     fetchOverallSummary()
//     fetchFleetData()
//   }, [])

//   const fetchOverallSummary = async () => {
//     try {
//       const response = await fetch('http://127.0.0.1:8001/summary/overall')
//       if (response.ok) {
//         const data = await response.json()
//         setOverallSummary({
//           total_expected_devices: data.overall_fleet_status.total_expected_devices,
//           total_currently_reporting: data.overall_fleet_status.total_currently_reporting,
//           total_missing_assets: data.overall_fleet_status.total_missing_assets,
//           overall_fleet_health_percent: data.overall_fleet_status.overall_fleet_health_percent,
//           reporting_quality: data.overall_reporting_quality_last_24h
//         })
//       }
//     } catch (error) {
//       console.error('Error fetching overall summary:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fetchFleetData = async () => {
//     // Mock fleet data - replace with actual API calls
//     const mockFleetData: FleetData[] = [
//       {
//         name: 'Oves Distributor Fleet',
//         deviceCount: 450,
//         healthScore: 94,
//         reportingDevices: 423
//       },
//       {
//         name: 'Open Token Simulator',
//         deviceCount: 320,
//         healthScore: 87,
//         reportingDevices: 278
//       },
//       {
//         name: 'M400Test fleet',
//         deviceCount: 180,
//         healthScore: 91,
//         reportingDevices: 164
//       },
//       {
//         name: 'Other Fleets',
//         deviceCount: 297,
//         healthScore: 89,
//         reportingDevices: 291
//       }
//     ]
//     setFleetData(mockFleetData)
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
//         <span className="ml-3 text-gray-600 dark:text-gray-400">Loading fleet overview...</span>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       {/* Fleet Health Summary Cards */}
//       {overallSummary && (
//         <FleetMetricsGrid 
//           totalDevices={overallSummary.total_expected_devices}
//           reportingDevices={overallSummary.total_currently_reporting}
//           missingAssets={overallSummary.total_missing_assets}
//           healthScore={overallSummary.overall_fleet_health_percent}
//         />
//       )}

//       {/* Charts Row */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Fleet Distribution Chart */}
//         <FleetDistributionChart fleetData={fleetData} />
        
//         {/* Reporting Quality Chart */}
//         {overallSummary && (
//           <ReportingQualityChart reportingQuality={overallSummary.reporting_quality} />
//         )}
//       </div>

//       {/* Fleet Health Trend Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {fleetData.slice(0, 3).map((fleet, index) => (
//           <FleetHealthCard
//             key={fleet.name}
//             fleetName={fleet.name}
//             healthScore={fleet.healthScore}
//             deviceCount={fleet.deviceCount}
//             reportingDevices={fleet.reportingDevices}
//             trendData={generateMockTrendData(index)}
//             changePercent={generateMockChangePercent(index)}
//           />
//         ))}
//       </div>
//     </div>
//   )
// }

// // Helper function to generate mock trend data with consistent seed
// function generateMockTrendData(seed: number): number[] {
//   const data = []
//   let value = 85 + (seed * 3.7) % 10 // Deterministic starting value
  
//   for (let i = 0; i < 26; i++) {
//     // Use deterministic pseudo-random based on seed and index
//     const pseudoRandom = ((seed * 17 + i * 23) % 100) / 100 - 0.5
//     value += pseudoRandom * 5
//     value = Math.max(70, Math.min(100, value))
//     data.push(Math.round(value))
//   }
  
//   return data
// }

// // Helper function to generate mock change percentage with consistent seed
// function generateMockChangePercent(seed: number): number {
//   // Deterministic change percentage based on seed
//   return ((seed * 13.7) % 20) - 10 // Range: -10 to +10
// }

'use client'

import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface OverallFleetSummary {
  total_expected_devices: number
  total_currently_reporting: number
  total_missing_assets: number
  overall_fleet_health_percent: number
  reporting_quality: {
    excellent: number
    good: number
    concerning: number
    poor: number
  }
}

interface FleetData {
  name: string
  deviceCount: number
  healthScore: number
  reportingDevices: number
  trendData: number[]
  changePercent: number
}

export default function FleetOverviewTab() {
  const [overallSummary, setOverallSummary] = useState<OverallFleetSummary | null>(null)
  const [fleetData, setFleetData] = useState<FleetData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setOverallSummary({
        total_expected_devices: 1247,
        total_currently_reporting: 1156,
        total_missing_assets: 91,
        overall_fleet_health_percent: 92.7,
        reporting_quality: {
          excellent: 892,
          good: 264,
          concerning: 67,
          poor: 24
        }
      })

      setFleetData([
        {
          name: 'Oves Distributor Fleet',
          deviceCount: 450,
          healthScore: 94,
          reportingDevices: 423,
          trendData: generateTrendData(94),
          changePercent: 2.3
        },
        {
          name: 'Open Token Simulator',
          deviceCount: 320,
          healthScore: 87,
          reportingDevices: 278,
          trendData: generateTrendData(87),
          changePercent: -1.2
        },
        {
          name: 'M400Test Fleet',
          deviceCount: 180,
          healthScore: 91,
          reportingDevices: 164,
          trendData: generateTrendData(91),
          changePercent: 0.5
        },
        {
          name: 'Distribution Network',
          deviceCount: 297,
          healthScore: 89,
          reportingDevices: 291,
          trendData: generateTrendData(89),
          changePercent: 1.8
        }
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateTrendData = (baseValue: number) => {
    const data = []
    let value = baseValue
    for (let i = 0; i < 30; i++) {
      value += (Math.random() - 0.5) * 4
      value = Math.max(70, Math.min(100, value))
      data.push(Math.round(value))
    }
    return data
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-400 font-medium">Loading fleet overview...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Fleet Metrics Grid */}
      {overallSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Devices"
            value={overallSummary.total_expected_devices.toLocaleString()}
            subtitle="Expected fleet size"
            icon={<Activity className="w-6 h-6" />}
            color="blue"
          />
          <MetricCard
            title="Active Devices"
            value={overallSummary.total_currently_reporting.toLocaleString()}
            subtitle={`${((overallSummary.total_currently_reporting / overallSummary.total_expected_devices) * 100).toFixed(1)}% reporting`}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
          />
          <MetricCard
            title="Missing Assets"
            value={overallSummary.total_missing_assets.toLocaleString()}
            subtitle="Require attention"
            icon={<AlertTriangle className="w-6 h-6" />}
            color="red"
          />
          <MetricCard
            title="Fleet Health"
            value={`${overallSummary.overall_fleet_health_percent}%`}
            subtitle="Overall performance"
            icon={<TrendingUp className="w-6 h-6" />}
            color={overallSummary.overall_fleet_health_percent >= 90 ? 'green' : 
                   overallSummary.overall_fleet_health_percent >= 75 ? 'yellow' : 'red'}
          />
        </div>
      )}

      {/* Charts and Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Fleet Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fleet Distribution</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Device count by fleet</p>
            </div>
          </div>
          <FleetDistributionChart fleetData={fleetData} />
        </div>

        {/* Reporting Quality Chart */}
        {overallSummary && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reporting Quality</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Device reporting frequency (Last 24h)</p>
              </div>
            </div>
            <ReportingQualityChart reportingQuality={overallSummary.reporting_quality} />
          </div>
        )}
      </div>

      {/* Fleet Health Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {fleetData.map((fleet) => (
          <FleetHealthCard key={fleet.name} fleet={fleet} />
        ))}
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
  color: 'blue' | 'green' | 'red' | 'yellow'
}

function MetricCard({ title, value, subtitle, icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      text: 'text-blue-900 dark:text-blue-100'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      icon: 'text-green-600 dark:text-green-400',
      text: 'text-green-900 dark:text-green-100'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      text: 'text-red-900 dark:text-red-100'
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
      text: 'text-yellow-900 dark:text-yellow-100'
    }
  }

  const classes = colorClasses[color]

  return (
    <div className={`${classes.bg} ${classes.border} border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`${classes.icon} p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm`}>
          {icon}
        </div>
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {title}
        </div>
      </div>
      <div className="space-y-2">
        <div className={`text-3xl font-bold ${classes.text}`}>
          {value}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {subtitle}
        </div>
      </div>
    </div>
  )
}

// Fleet Distribution Chart Component
function FleetDistributionChart({ fleetData }: { fleetData: FleetData[] }) {
  const total = fleetData.reduce((sum, fleet) => sum + fleet.deviceCount, 0)
  
  return (
    <div className="space-y-4">
      {fleetData.map((fleet, index) => {
        const percentage = (fleet.deviceCount / total) * 100
        const colors = ['bg-violet-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500']
        
        return (
          <div key={fleet.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {fleet.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {fleet.deviceCount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {percentage.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${colors[index % colors.length]}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Reporting Quality Chart Component
function ReportingQualityChart({ reportingQuality }: { reportingQuality: any }) {
  const total = Object.values(reportingQuality).reduce((sum: number, value: any) => sum + value, 0)
  
  const qualities = [
    { label: 'Excellent', value: reportingQuality.excellent, color: 'bg-green-500', textColor: 'text-green-600' },
    { label: 'Good', value: reportingQuality.good, color: 'bg-blue-500', textColor: 'text-blue-600' },
    { label: 'Concerning', value: reportingQuality.concerning, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
    { label: 'Poor', value: reportingQuality.poor, color: 'bg-red-500', textColor: 'text-red-600' }
  ]

  return (
    <div className="space-y-4">
      {qualities.map((quality) => {
        const percentage = (quality.value / total) * 100
        
        return (
          <div key={quality.label} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${quality.color}`} />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {quality.label}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {quality.value.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {percentage.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${quality.color}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Fleet Health Card Component
function FleetHealthCard({ fleet }: { fleet: FleetData }) {
  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400'
    if (score >= 75) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getHealthBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 dark:bg-green-900/20'
    if (score >= 75) return 'bg-yellow-50 dark:bg-yellow-900/20'
    return 'bg-red-50 dark:bg-red-900/20'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{fleet.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {fleet.reportingDevices}/{fleet.deviceCount} devices active
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getTrendIcon(fleet.changePercent)}
          <span className={`text-sm font-medium ${
            fleet.changePercent > 0 ? 'text-green-600' : 
            fleet.changePercent < 0 ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {fleet.changePercent > 0 ? '+' : ''}{fleet.changePercent.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className={`${getHealthBgColor(fleet.healthScore)} rounded-xl p-4 mb-4`}>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-3xl font-bold ${getHealthColor(fleet.healthScore)}`}>
              {fleet.healthScore}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Fleet Health Score
            </div>
          </div>
          <div className={`w-16 h-16 rounded-full ${getHealthColor(fleet.healthScore)} flex items-center justify-center`}>
            <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {fleet.reportingDevices}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Active
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {fleet.deviceCount - fleet.reportingDevices}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Offline
          </div>
        </div>
      </div>
    </div>
  )
}