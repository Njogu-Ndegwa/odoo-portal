'use client'

export default function DeviceMonitoringTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Device Monitoring
        </h3>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">
            Device Monitoring Coming Soon
          </h4>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            This section will include real-time device status, battery monitoring, 
            temperature tracking, connectivity status, and device health metrics.
          </p>
        </div>
      </div>
    </div>
  )
}