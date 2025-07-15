'use client'

import { useState } from 'react'
import FleetOverviewTab from '../(default)/dashboard/fleet/components/FleetOverviewTab'
import FleetManagementTab from '../(default)/dashboard/fleet/components/FleetManagement/FleetManagementTab'
import DeviceMonitoringTab from '../(default)/dashboard/fleet/components/DeviceMonitoringTab'
import AnalyticsTab from '../(default)/dashboard/fleet/components/AnalyticsTab'

export default function FleetDemoPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'management', label: 'Fleet Management', icon: '🚛' },
    { id: 'monitoring', label: 'Device Monitoring', icon: '📱' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <FleetOverviewTab />
      case 'management':
        return <FleetManagementTab />
      case 'monitoring':
        return <DeviceMonitoringTab />
      case 'analytics':
        return <AnalyticsTab />
      default:
        return <FleetOverviewTab />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Fleet Dashboard Demo
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Demo Mode - No Authentication Required
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Fleet Dashboard
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Comprehensive fleet management and monitoring system
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>All Fleets</option>
                <option>Fleet Alpha</option>
                <option>Fleet Beta</option>
                <option>Fleet Gamma</option>
              </select>
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}