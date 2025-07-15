'use client'

import { useState } from 'react'
import FilterButton from '@/components/dropdown-filter'
import Datepicker from '@/components/datepicker'
import FleetOverviewTab from './components/FleetOverviewTab'
import FleetManagementTab from './components/FleetManagementTab'
import DeviceMonitoringTab from './components/DeviceMonitoringTab'
import AnalyticsTab from './components/AnalyticsTab'

type TabType = 'overview' | 'fleets' | 'devices' | 'analytics'

export default function FleetDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const tabs = [
    { id: 'overview', label: 'Fleet Overview', icon: '📊' },
    { id: 'fleets', label: 'Fleet Management', icon: '🚛' },
    { id: 'devices', label: 'Device Monitoring', icon: '📱' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <FleetOverviewTab />
      case 'fleets':
        return <FleetManagementTab />
      case 'devices':
        return <DeviceMonitoringTab />
      case 'analytics':
        return <AnalyticsTab />
      default:
        return <FleetOverviewTab />
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Dashboard Header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-8">
        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            Omnivoltaic Fleet Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage your fleet assets in real-time
          </p>
        </div>
        
        {/* Right: Actions */}
        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          <FilterButton align="right" />
          <Datepicker />
          <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
            <svg className="fill-current shrink-0 xs:hidden" width="16" height="16" viewBox="0 0 16 16">
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
            <span className="max-xs:sr-only">Refresh All</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                  ${activeTab === tab.id
                    ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  )
}