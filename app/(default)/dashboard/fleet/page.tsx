// 'use client'

// import { useState } from 'react'
// import FilterButton from '@/components/dropdown-filter'
// import Datepicker from '@/components/datepicker'
// import FleetOverviewTab from './components/FleetOverviewTab'
// import FleetManagementTab from './components/FleetManagementTab'
// import DeviceMonitoringTab from './components/DeviceMonitoringTab'
// import AnalyticsTab from './components/AnalyticsTab'

// type TabType = 'overview' | 'fleets' | 'devices' | 'analytics'

// export default function FleetDashboard() {
//   const [activeTab, setActiveTab] = useState<TabType>('overview')

//   const tabs = [
//     { id: 'overview', label: 'Fleet Overview', icon: '📊' },
//     { id: 'fleets', label: 'Fleet Management', icon: '🚛' },
//     { id: 'devices', label: 'Device Monitoring', icon: '📱' },
//     { id: 'analytics', label: 'Analytics', icon: '📈' },
//   ]

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case 'overview':
//         return <FleetOverviewTab />
//       case 'fleets':
//         return <FleetManagementTab />
//       case 'devices':
//         return <DeviceMonitoringTab />
//       case 'analytics':
//         return <AnalyticsTab />
//       default:
//         return <FleetOverviewTab />
//     }
//   }

//   return (
//     <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
//       {/* Dashboard Header */}
//       <div className="sm:flex sm:justify-between sm:items-center mb-8">
//         {/* Left: Title */}
//         <div className="mb-4 sm:mb-0">
//           <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
//             Omnivoltaic Fleet Dashboard
//           </h1>
//           <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//             Monitor and manage your fleet assets in real-time
//           </p>
//         </div>
        
//         {/* Right: Actions */}
//         <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
//           <FilterButton align="right" />
//           <Datepicker />
//           <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
//             <svg className="fill-current shrink-0 xs:hidden" width="16" height="16" viewBox="0 0 16 16">
//               <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
//             </svg>
//             <span className="max-xs:sr-only">Refresh All</span>
//           </button>
//         </div>
//       </div>

//       {/* Tab Navigation */}
//       <div className="mb-8">
//         <div className="border-b border-gray-200 dark:border-gray-700">
//           <nav className="-mb-px flex space-x-8" aria-label="Tabs">
//             {tabs.map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id as TabType)}
//                 className={`
//                   whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2
//                   ${activeTab === tab.id
//                     ? 'border-violet-500 text-violet-600 dark:text-violet-400'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
//                   }
//                 `}
//               >
//                 <span className="text-base">{tab.icon}</span>
//                 {tab.label}
//               </button>
//             ))}
//           </nav>
//         </div>
//       </div>

//       {/* Tab Content */}
//       <div className="min-h-[600px]">
//         {renderTabContent()}
//       </div>
//     </div>
//   )
// }


'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Calendar, Filter, RefreshCw, BarChart3, Truck, Smartphone, TrendingUp } from 'lucide-react'

// Import components (these would be separate files in your project)
import FleetOverviewTab from './components/FleetOverviewTab'
import FleetManagementTab from './components/FleetManagement/FleetManagementTab' 
import DeviceMonitoringTab from './components/DeviceMonitoringTab'
import AnalyticsTab from './components/AnalyticsTab'

type TabType = 'overview' | 'fleets' | 'devices' | 'analytics'

export default function FleetDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const t = useTranslations('fleetDashboard')

  const tabs = [
    { 
      id: 'overview', 
      label: t('fleetOverview'), 
      icon: BarChart3,
      description: t('realTimeStatus')
    },
    { 
      id: 'fleets', 
      label: t('fleetManagement'), 
      icon: Truck,
      description: t('manageConfigurations')
    },
    { 
      id: 'devices', 
      label: t('deviceMonitoring'), 
      icon: Smartphone,
      description: t('monitorPerformance')
    },
    { 
      id: 'analytics', 
      label: t('analyticsReports'), 
      icon: TrendingUp,
      description: t('performanceInsights')
    },
  ]

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh action
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRefreshing(false)
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-violet-900">
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left: Title and Subtitle */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {t('title')}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {t('subtitle')}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm">
                <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('filter')}</span>
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm">
                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('dateRange')}</span>
              </button>
              
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">
                  {isRefreshing ? t('refreshing') : t('refreshAll')}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-2">
            <nav className="flex space-x-2" aria-label="Tabs">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                const isActive = activeTab === tab.id
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`
                      flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium text-sm transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg transform scale-[1.02]'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <IconComponent className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">{tab.label}</div>
                      <div className={`text-xs ${isActive ? 'text-violet-100' : 'text-gray-500 dark:text-gray-500'}`}>
                        {tab.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}