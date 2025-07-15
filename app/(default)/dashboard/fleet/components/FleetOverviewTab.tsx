'use client'

import { useEffect, useState } from 'react'
import FleetHealthCard from './FleetHealthCard'
import FleetDistributionChart from './FleetDistributionChart'
import ReportingQualityChart from './ReportingQualityChart'
import FleetMetricsGrid from './FleetMetricsGrid'

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
}

export default function FleetOverviewTab() {
  const [overallSummary, setOverallSummary] = useState<OverallFleetSummary | null>(null)
  const [fleetData, setFleetData] = useState<FleetData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOverallSummary()
    fetchFleetData()
  }, [])

  const fetchOverallSummary = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8001/summary/overall')
      if (response.ok) {
        const data = await response.json()
        setOverallSummary({
          total_expected_devices: data.overall_fleet_status.total_expected_devices,
          total_currently_reporting: data.overall_fleet_status.total_currently_reporting,
          total_missing_assets: data.overall_fleet_status.total_missing_assets,
          overall_fleet_health_percent: data.overall_fleet_status.overall_fleet_health_percent,
          reporting_quality: data.overall_reporting_quality_last_24h
        })
      }
    } catch (error) {
      console.error('Error fetching overall summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFleetData = async () => {
    // Mock fleet data - replace with actual API calls
    const mockFleetData: FleetData[] = [
      {
        name: 'Oves Distributor Fleet',
        deviceCount: 450,
        healthScore: 94,
        reportingDevices: 423
      },
      {
        name: 'Open Token Simulator',
        deviceCount: 320,
        healthScore: 87,
        reportingDevices: 278
      },
      {
        name: 'M400Test fleet',
        deviceCount: 180,
        healthScore: 91,
        reportingDevices: 164
      },
      {
        name: 'Other Fleets',
        deviceCount: 297,
        healthScore: 89,
        reportingDevices: 291
      }
    ]
    setFleetData(mockFleetData)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading fleet overview...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Fleet Health Summary Cards */}
      {overallSummary && (
        <FleetMetricsGrid 
          totalDevices={overallSummary.total_expected_devices}
          reportingDevices={overallSummary.total_currently_reporting}
          missingAssets={overallSummary.total_missing_assets}
          healthScore={overallSummary.overall_fleet_health_percent}
        />
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Distribution Chart */}
        <FleetDistributionChart fleetData={fleetData} />
        
        {/* Reporting Quality Chart */}
        {overallSummary && (
          <ReportingQualityChart reportingQuality={overallSummary.reporting_quality} />
        )}
      </div>

      {/* Fleet Health Trend Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {fleetData.slice(0, 3).map((fleet, index) => (
          <FleetHealthCard
            key={fleet.name}
            fleetName={fleet.name}
            healthScore={fleet.healthScore}
            deviceCount={fleet.deviceCount}
            reportingDevices={fleet.reportingDevices}
            trendData={generateMockTrendData()}
            changePercent={Math.random() * 10 - 5} // Mock change percentage
          />
        ))}
      </div>
    </div>
  )
}

// Helper function to generate mock trend data
function generateMockTrendData(): number[] {
  const data = []
  let value = 85 + Math.random() * 10
  
  for (let i = 0; i < 26; i++) {
    value += (Math.random() - 0.5) * 5
    value = Math.max(70, Math.min(100, value))
    data.push(Math.round(value))
  }
  
  return data
}