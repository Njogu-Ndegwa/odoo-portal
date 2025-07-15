'use client'

export default function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Analytics & Reports
        </h3>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">
            Analytics Coming Soon
          </h4>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            This section will include performance analytics, usage trends, 
            historical reports, route optimization insights, and custom dashboards.
          </p>
        </div>
      </div>
    </div>
  )
}