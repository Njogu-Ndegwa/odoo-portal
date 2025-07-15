'use client'

export default function FleetManagementTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Fleet Management
        </h3>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">
            Fleet Management Coming Soon
          </h4>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            This section will include fleet configuration, device assignment, 
            bulk operations, and fleet-specific settings management.
          </p>
        </div>
      </div>
    </div>
  )
}