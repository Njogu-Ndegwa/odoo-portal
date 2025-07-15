// // 'use client'

// // export default function FleetManagementTab() {
// //   return (
// //     <div className="space-y-6">
// //       <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
// //         <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
// //           Fleet Management
// //         </h3>
// //         <div className="text-center py-12">
// //           <div className="text-gray-400 mb-4">
// //             <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
// //             </svg>
// //           </div>
// //           <h4 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">
// //             Fleet Management Coming Soon
// //           </h4>
// //           <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
// //             This section will include fleet configuration, device assignment, 
// //             bulk operations, and fleet-specific settings management.
// //           </p>
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }

// 'use client'

// import { useState, useEffect } from 'react'
// import { Plus, Edit, Trash2, Settings, Users, MapPin, Clock, AlertTriangle, CheckCircle, Search } from 'lucide-react'

// interface Fleet {
//   id: string
//   name: string
//   description: string
//   deviceCount: number
//   activeDevices: number
//   manager: string
//   location: string
//   createdAt: string
//   status: 'active' | 'inactive' | 'maintenance'
//   healthScore: number
// }

// interface Device {
//   id: string
//   name: string
//   type: string
//   status: 'online' | 'offline' | 'warning'
//   fleet: string
//   batteryLevel: number
//   lastSeen: string
// }

// export default function FleetManagementTab() {
//   const [fleets, setFleets] = useState<Fleet[]>([])
//   const [devices, setDevices] = useState<Device[]>([])
//   const [selectedFleet, setSelectedFleet] = useState<Fleet | null>(null)
//   const [showCreateFleet, setShowCreateFleet] = useState(false)
//   const [showAssignDevices, setShowAssignDevices] = useState(false)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     fetchFleetData()
//   }, [])

//   const fetchFleetData = async () => {
//     setLoading(true)
//     try {
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1000))
      
//       const mockFleets: Fleet[] = [
//         {
//           id: 'fleet_001',
//           name: 'Oves Distributor Fleet',
//           description: 'Main distribution fleet for urban deliveries',
//           deviceCount: 450,
//           activeDevices: 423,
//           manager: 'John Smith',
//           location: 'Nairobi Central',
//           createdAt: '2024-01-15',
//           status: 'active',
//           healthScore: 94
//         },
//         {
//           id: 'fleet_002',
//           name: 'Open Token Simulator',
//           description: 'Testing and simulation fleet',
//           deviceCount: 320,
//           activeDevices: 278,
//           manager: 'Sarah Johnson',
//           location: 'Westlands',
//           createdAt: '2024-02-20',
//           status: 'active',
//           healthScore: 87
//         },
//         {
//           id: 'fleet_003',
//           name: 'M400Test Fleet',
//           description: 'R&D testing fleet for new devices',
//           deviceCount: 180,
//           activeDevices: 164,
//           manager: 'Mike Wilson',
//           location: 'Karen',
//           createdAt: '2024-03-10',
//           status: 'maintenance',
//           healthScore: 91
//         }
//       ]

//       const mockDevices: Device[] = [
//         {
//           id: 'DV001',
//           name: 'Distribution Vehicle 001',
//           type: 'Heavy Duty',
//           status: 'online',
//           fleet: 'fleet_001',
//           batteryLevel: 87,
//           lastSeen: new Date().toISOString()
//         },
//         {
//           id: 'DV002',
//           name: 'Distribution Vehicle 002',
//           type: 'Light Duty',
//           status: 'warning',
//           fleet: 'fleet_001',
//           batteryLevel: 23,
//           lastSeen: new Date(Date.now() - 1000 * 60 * 15).toISOString()
//         },
//         {
//           id: 'OTS001',
//           name: 'Open Token Simulator 001',
//           type: 'Simulator',
//           status: 'online',
//           fleet: 'fleet_002',
//           batteryLevel: 92,
//           lastSeen: new Date(Date.now() - 1000 * 30).toISOString()
//         }
//       ]

//       setFleets(mockFleets)
//       setDevices(mockDevices)
//     } catch (error) {
//       console.error('Error fetching fleet data:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const filteredFleets = fleets.filter(fleet =>
//     fleet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     fleet.manager.toLowerCase().includes(searchTerm.toLowerCase())
//   )

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'active': return 'text-green-600 dark:text-green-400'
//       case 'inactive': return 'text-gray-600 dark:text-gray-400'
//       case 'maintenance': return 'text-yellow-600 dark:text-yellow-400'
//       default: return 'text-gray-600 dark:text-gray-400'
//     }
//   }

//   const getStatusBgColor = (status: string) => {
//     switch (status) {
//       case 'active': return 'bg-green-100 dark:bg-green-900/20'
//       case 'inactive': return 'bg-gray-100 dark:bg-gray-900/20'
//       case 'maintenance': return 'bg-yellow-100 dark:bg-yellow-900/20'
//       default: return 'bg-gray-100 dark:bg-gray-900/20'
//     }
//   }

//   const getHealthColor = (score: number) => {
//     if (score >= 90) return 'text-green-600 dark:text-green-400'
//     if (score >= 75) return 'text-yellow-600 dark:text-yellow-400'
//     return 'text-red-600 dark:text-red-400'
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="flex items-center gap-3">
//           <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin"></div>
//           <span className="text-gray-600 dark:text-gray-400 font-medium">Loading fleet management...</span>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-8">
//       {/* Fleet Management Header */}
//       <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
//               Fleet Management
//             </h2>
//             <p className="text-gray-600 dark:text-gray-400">
//               Configure, manage, and monitor your fleet configurations
//             </p>
//           </div>
          
//           <div className="flex items-center gap-3">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Search fleets..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
//               />
//             </div>
            
//             <button 
//               onClick={() => setShowCreateFleet(true)}
//               className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors duration-200"
//             >
//               <Plus className="w-4 h-4" />
//               Create Fleet
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Fleet Overview Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
//               <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
//             </div>
//             <div>
//               <h3 className="font-semibold text-gray-900 dark:text-white">Total Fleets</h3>
//               <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{fleets.length}</p>
//             </div>
//           </div>
//           <p className="text-sm text-gray-600 dark:text-gray-400">
//             Active fleet configurations
//           </p>
//         </div>

//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-xl">
//               <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
//             </div>
//             <div>
//               <h3 className="font-semibold text-gray-900 dark:text-white">Total Devices</h3>
//               <p className="text-2xl font-bold text-green-600 dark:text-green-400">
//                 {fleets.reduce((sum, fleet) => sum + fleet.deviceCount, 0)}
//               </p>
//             </div>
//           </div>
//           <p className="text-sm text-gray-600 dark:text-gray-400">
//             Across all fleets
//           </p>
//         </div>

//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
//               <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
//             </div>
//             <div>
//               <h3 className="font-semibold text-gray-900 dark:text-white">Active Devices</h3>
//               <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
//                 {fleets.reduce((sum, fleet) => sum + fleet.activeDevices, 0)}
//               </p>
//             </div>
//           </div>
//           <p className="text-sm text-gray-600 dark:text-gray-400">
//             Currently reporting
//           </p>
//         </div>
//       </div>

//       {/* Fleet List */}
//       <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
//         <div className="p-6 border-b border-gray-200 dark:border-gray-700">
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//             Fleet Configurations
//           </h3>
//         </div>
        
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 dark:bg-gray-700">
//               <tr>
//                 <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Fleet Name</th>
//                 <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Manager</th>
//                 <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Devices</th>
//                 <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Health</th>
//                 <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Status</th>
//                 <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Location</th>
//                 <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredFleets.map((fleet) => (
//                 <tr key={fleet.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
//                   <td className="py-4 px-6">
//                     <div>
//                       <div className="font-medium text-gray-900 dark:text-white">
//                         {fleet.name}
//                       </div>
//                       <div className="text-sm text-gray-600 dark:text-gray-400">
//                         {fleet.description}
//                       </div>
//                     </div>
//                   </td>
//                   <td className="py-4 px-6">
//                     <div className="flex items-center gap-2">
//                       <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/20 rounded-full flex items-center justify-center">
//                         <span className="text-xs font-medium text-violet-600 dark:text-violet-400">
//                           {fleet.manager.split(' ').map(n => n[0]).join('')}
//                         </span>
//                       </div>
//                       <span className="text-gray-900 dark:text-white">{fleet.manager}</span>
//                     </div>
//                   </td>
//                   <td className="py-4 px-6">
//                     <div className="text-sm">
//                       <div className="font-medium text-gray-900 dark:text-white">
//                         {fleet.activeDevices}/{fleet.deviceCount}
//                       </div>
//                       <div className="text-gray-600 dark:text-gray-400">
//                         {((fleet.activeDevices / fleet.deviceCount) * 100).toFixed(1)}% active
//                       </div>
//                     </div>
//                   </td>
//                   <td className="py-4 px-6">
//                     <div className={`text-lg font-bold ${getHealthColor(fleet.healthScore)}`}>
//                       {fleet.healthScore}%
//                     </div>
//                   </td>
//                   <td className="py-4 px-6">
//                     <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBgColor(fleet.status)} ${getStatusColor(fleet.status)}`}>
//                       {fleet.status.charAt(0).toUpperCase() + fleet.status.slice(1)}
//                     </span>
//                   </td>
//                   <td className="py-4 px-6">
//                     <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
//                       <MapPin className="w-4 h-4" />
//                       <span className="text-sm">{fleet.location}</span>
//                     </div>
//                   </td>
//                   <td className="py-4 px-6">
//                     <div className="flex items-center gap-2">
//                       <button 
//                         onClick={() => setSelectedFleet(fleet)}
//                         className="p-2 text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
//                         title="View Details"
//                       >
//                         <Settings className="w-4 h-4" />
//                       </button>
//                       <button 
//                         onClick={() => setShowAssignDevices(true)}
//                         className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
//                         title="Assign Devices"
//                       >
//                         <Plus className="w-4 h-4" />
//                       </button>
//                       <button 
//                         className="p-2 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
//                         title="Edit Fleet"
//                       >
//                         <Edit className="w-4 h-4" />
//                       </button>
//                       <button 
//                         className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
//                         title="Delete Fleet"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Fleet Details Modal */}
//       {selectedFleet && (
//         <FleetDetailsModal 
//           fleet={selectedFleet} 
//           devices={devices.filter(d => d.fleet === selectedFleet.id)}
//           onClose={() => setSelectedFleet(null)} 
//         />
//       )}

//       {/* Create Fleet Modal */}
//       {showCreateFleet && (
//         <CreateFleetModal onClose={() => setShowCreateFleet(false)} />
//       )}

//       {/* Assign Devices Modal */}
//       {showAssignDevices && (
//         <AssignDevicesModal onClose={() => setShowAssignDevices(false)} />
//       )}
//     </div>
//   )
// }

// // Fleet Details Modal Component
// function FleetDetailsModal({ fleet, devices, onClose }: { 
//   fleet: Fleet, 
//   devices: Device[], 
//   onClose: () => void 
// }) {
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="p-6 border-b border-gray-200 dark:border-gray-700">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
//                 {fleet.name}
//               </h2>
//               <p className="text-gray-600 dark:text-gray-400">
//                 Fleet Configuration Details
//               </p>
//             </div>
//             <button 
//               onClick={onClose}
//               className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
//             >
//               ×
//             </button>
//           </div>
//         </div>

//         <div className="p-6 space-y-6">
//           {/* Fleet Info Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
//               <div className="flex items-center gap-2 mb-2">
//                 <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//                 <span className="font-medium text-gray-900 dark:text-white">Manager</span>
//               </div>
//               <p className="text-gray-600 dark:text-gray-400">{fleet.manager}</p>
//             </div>
            
//             <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
//               <div className="flex items-center gap-2 mb-2">
//                 <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
//                 <span className="font-medium text-gray-900 dark:text-white">Location</span>
//               </div>
//               <p className="text-gray-600 dark:text-gray-400">{fleet.location}</p>
//             </div>
            
//             <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
//               <div className="flex items-center gap-2 mb-2">
//                 <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
//                 <span className="font-medium text-gray-900 dark:text-white">Created</span>
//               </div>
//               <p className="text-gray-600 dark:text-gray-400">
//                 {new Date(fleet.createdAt).toLocaleDateString()}
//               </p>
//             </div>
//           </div>

//           {/* Fleet Stats */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
//               <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
//                 {fleet.deviceCount}
//               </div>
//               <div className="text-sm text-gray-600 dark:text-gray-400">Total Devices</div>
//             </div>
//             <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
//               <div className="text-2xl font-bold text-green-600 dark:text-green-400">
//                 {fleet.activeDevices}
//               </div>
//               <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
//             </div>
//             <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
//               <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
//                 {fleet.deviceCount - fleet.activeDevices}
//               </div>
//               <div className="text-sm text-gray-600 dark:text-gray-400">Offline</div>
//             </div>
//             <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
//               <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
//                 {fleet.healthScore}%
//               </div>
//               <div className="text-sm text-gray-600 dark:text-gray-400">Health Score</div>
//             </div>
//           </div>

//           {/* Assigned Devices */}
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//               Assigned Devices ({devices.length})
//             </h3>
//             <div className="space-y-3 max-h-60 overflow-y-auto">
//               {devices.map((device) => (
//                 <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                   <div className="flex items-center gap-3">
//                     <div className={`w-3 h-3 rounded-full ${
//                       device.status === 'online' ? 'bg-green-500' :
//                       device.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
//                     }`} />
//                     <div>
//                       <div className="font-medium text-gray-900 dark:text-white">
//                         {device.name}
//                       </div>
//                       <div className="text-sm text-gray-600 dark:text-gray-400">
//                         {device.type} • {device.id}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-sm font-medium text-gray-900 dark:text-white">
//                       {device.batteryLevel}%
//                     </div>
//                     <div className="text-xs text-gray-600 dark:text-gray-400">
//                       {device.status}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
//             <button 
//               onClick={onClose}
//               className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
//             >
//               Close
//             </button>
//             <button className="px-4 py-2 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors">
//               Edit Fleet
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// // Create Fleet Modal Component
// function CreateFleetModal({ onClose }: { onClose: () => void }) {
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     manager: '',
//     location: ''
//   })

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     // Handle fleet creation
//     console.log('Creating fleet:', formData)
//     onClose()
//   }

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
//         <div className="p-6 border-b border-gray-200 dark:border-gray-700">
//           <div className="flex items-center justify-between">
//             <h2 className="text-xl font-bold text-gray-900 dark:text-white">
//               Create New Fleet
//             </h2>
//             <button 
//               onClick={onClose}
//               className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
//             >
//               ×
//             </button>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
//               Fleet Name
//             </label>
//             <input
//               type="text"
//               value={formData.name}
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
//               placeholder="Enter fleet name"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
//               Description
//             </label>
//             <textarea
//               value={formData.description}
//               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
//               placeholder="Fleet description"
//               rows={3}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
//               Fleet Manager
//             </label>
//             <input
//               type="text"
//               value={formData.manager}
//               onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
//               placeholder="Manager name"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
//               Location
//             </label>
//             <input
//               type="text"
//               value={formData.location}
//               onChange={(e) => setFormData({ ...formData, location: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
//               placeholder="Fleet location"
//               required
//             />
//           </div>

//           <div className="flex justify-end gap-3 pt-6">
//             <button 
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
//             >
//               Cancel
//             </button>
//             <button 
//               type="submit"
//               className="px-4 py-2 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors"
//             >
//               Create Fleet
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }

// // Assign Devices Modal Component
// function AssignDevicesModal({ onClose }: { onClose: () => void }) {
//   const [selectedDevices, setSelectedDevices] = useState<string[]>([])
//   const [selectedFleet, setSelectedFleet] = useState('')

//   const unassignedDevices = [
//     { id: 'DEV001', name: 'Unassigned Device 001', type: 'Heavy Duty' },
//     { id: 'DEV002', name: 'Unassigned Device 002', type: 'Light Duty' },
//     { id: 'DEV003', name: 'Unassigned Device 003', type: 'Simulator' }
//   ]

//   const fleetOptions = [
//     { id: 'fleet_001', name: 'Oves Distributor Fleet' },
//     { id: 'fleet_002', name: 'Open Token Simulator' },
//     { id: 'fleet_003', name: 'M400Test Fleet' }
//   ]

//   const handleDeviceToggle = (deviceId: string) => {
//     setSelectedDevices(prev =>
//       prev.includes(deviceId)
//         ? prev.filter(id => id !== deviceId)
//         : [...prev, deviceId]
//     )
//   }

//   const handleAssign = () => {
//     console.log('Assigning devices:', selectedDevices, 'to fleet:', selectedFleet)
//     onClose()
//   }

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full">
//         <div className="p-6 border-b border-gray-200 dark:border-gray-700">
//           <div className="flex items-center justify-between">
//             <h2 className="text-xl font-bold text-gray-900 dark:text-white">
//               Assign Devices to Fleet
//             </h2>
//             <button 
//               onClick={onClose}
//               className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
//             >
//               ×
//             </button>
//           </div>
//         </div>

//         <div className="p-6 space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
//               Select Fleet
//             </label>
//             <select
//               value={selectedFleet}
//               onChange={(e) => setSelectedFleet(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
//             >
//               <option value="">Choose fleet...</option>
//               {fleetOptions.map(fleet => (
//                 <option key={fleet.id} value={fleet.id}>{fleet.name}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
//               Select Devices ({selectedDevices.length} selected)
//             </label>
//             <div className="space-y-2 max-h-60 overflow-y-auto">
//               {unassignedDevices.map(device => (
//                 <div key={device.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
//                   <input
//                     type="checkbox"
//                     checked={selectedDevices.includes(device.id)}
//                     onChange={() => handleDeviceToggle(device.id)}
//                     className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
//                   />
//                   <div className="flex-1">
//                     <div className="font-medium text-gray-900 dark:text-white">
//                       {device.name}
//                     </div>
//                     <div className="text-sm text-gray-600 dark:text-gray-400">
//                       {device.type} • {device.id}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
//             <button 
//               onClick={onClose}
//               className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
//             >
//               Cancel
//             </button>
//             <button 
//               onClick={handleAssign}
//               disabled={!selectedFleet || selectedDevices.length === 0}
//               className="px-4 py-2 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Assign Devices
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }


'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Users, CheckCircle, Settings } from 'lucide-react'
import Table from '@/components/table/table'
import { SelectedItemsProvider } from '@/app/selected-items-context'
import { useSelectedItems } from '@/app/selected-items-context'
import DynamicDropdown from '@/components/dropdown-dynamic'
import DateSelect from '@/components/date-select'
import FilterButton from '@/components/dropdown-filter'
import SearchForm from '@/components/search-form'
import PaginationClassic from '@/components/pagination-classic'
import { SearchableListModal } from '@/components/seachable-list-modal'
import FeedbackModal from '@/components/feedback-modal'
import { useAlert } from '@/app/contexts/alertContext'
import { usePagination } from '@/components/utils/pagination'
import { columns, dropdownOptions } from './tableColumns'
import { actions } from './tableActions'

interface Fleet {
  id: string
  name: string
  description: string
  deviceCount: number
  activeDevices: number
  manager: string
  location: string
  createdAt: string
  status: 'active' | 'inactive' | 'maintenance'
  healthScore: number
}

interface Device {
  id: string
  name: string
  type: string
  status: 'online' | 'offline' | 'warning'
  fleet: string
  batteryLevel: number
  lastSeen: string
}

export default function FleetManagementTabWrapper() {
  return (
    <SelectedItemsProvider>
      <FleetManagementTab />
    </SelectedItemsProvider>
  )
}

function FleetManagementTab() {
  const [fleets, setFleets] = useState<Fleet[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [selectedFleet, setSelectedFleet] = useState<Fleet | null>(null)
  const [showCreateFleet, setShowCreateFleet] = useState(false)
  const [showAssignDevices, setShowAssignDevices] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setSelectedItems, selectedItems } = useSelectedItems()
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null)
  const [dangerModalOpen, setDangerModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const { alert } = useAlert()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  const {
    currentCursor,
    cursorHistory,
    handleNext,
    handlePrevious,
    itemsPerPage,
    setItemsPerPage,
    hasPreviousPage,
    currentPage,
  } = usePagination()

  useEffect(() => {
    fetchFleetData()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchFleetData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockFleets: Fleet[] = [
        {
          id: 'fleet_001',
          name: 'Oves Distributor Fleet',
          description: 'Main distribution fleet for urban deliveries',
          deviceCount: 450,
          activeDevices: 423,
          manager: 'John Smith',
          location: 'Nairobi Central',
          createdAt: '2024-01-15',
          status: 'active',
          healthScore: 94
        },
        {
          id: 'fleet_002',
          name: 'Open Token Simulator',
          description: 'Testing and simulation fleet',
          deviceCount: 320,
          activeDevices: 278,
          manager: 'Sarah Johnson',
          location: 'Westlands',
          createdAt: '2024-02-20',
          status: 'active',
          healthScore: 87
        },
        {
          id: 'fleet_003',
          name: 'M400Test Fleet',
          description: 'R&D testing fleet for new devices',
          deviceCount: 180,
          activeDevices: 164,
          manager: 'Mike Wilson',
          location: 'Karen',
          createdAt: '2024-03-10',
          status: 'maintenance',
          healthScore: 91
        }
      ]

      const mockDevices: Device[] = [
        {
          id: 'DV001',
          name: 'Distribution Vehicle 001',
          type: 'Heavy Duty',
          status: 'online',
          fleet: 'fleet_001',
          batteryLevel: 87,
          lastSeen: new Date().toISOString()
        },
        {
          id: 'DV002',
          name: 'Distribution Vehicle 002',
          type: 'Light Duty',
          status: 'warning',
          fleet: 'fleet_001',
          batteryLevel: 23,
          lastSeen: new Date(Date.now() - 1000 * 60 * 15).toISOString()
        },
        {
          id: 'OTS001',
          name: 'Open Token Simulator 001',
          type: 'Simulator',
          status: 'online',
          fleet: 'fleet_002',
          batteryLevel: 92,
          lastSeen: new Date(Date.now() - 1000 * 30).toISOString()
        }
      ]

      setFleets(mockFleets)
      setDevices(mockDevices)
    } catch (error) {
      console.error('Error fetching fleet data:', error)
      setError('Failed to fetch fleet data')
    } finally {
      setLoading(false)
    }
  }

  const filteredFleets = fleets.filter(fleet =>
    fleet.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    fleet.manager.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  )

  const handleSelectionChange = (selectedIds: any[]) => {
    setSelectedItems(selectedIds)
  }

  const handleAgentSelect = (agent: any) => {
    setSelectedAgentId(agent.id)
  }

  const handleDropdownItemSelect = (option: any) => {
    setSelectedOption(option.id)
    if (option.id === 0) {
      setDangerModalOpen(true)
    } else if (option.id === 1 || option.id === 2) {
      setIsOpen(true)
    }
  }

  const loadData = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    fetchFleetData()
    setSelectedItems([])
  }

  const handleActionClick = async (actor: string) => {
    if (selectedAgentId) {
      if (actor === "assign") {
        alert({ text: "Fleet Assignment started Successfully", type: "success" })
        loadData()
      } else if (actor === "reAssign") {
        alert({ text: "Fleet ReAssignment started Successfully", type: "success" })
        loadData()
      }
    } else {
      alert({ text: "Select an Agent First", type: "error" })
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const mockAgents = [
    { id: 1, email: 'john.smith@example.com' },
    { id: 2, email: 'sarah.johnson@example.com' },
    { id: 3, email: 'mike.wilson@example.com' }
  ]

  const filteredAgents = mockAgents.filter(agent =>
    agent.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Mock pagination data
  const pageInfo = {
    hasNextPage: false,
    hasPreviousPage: false,
    endCursor: null
  }

  const totalCount = filteredFleets.length

  const handleNextPage = () => {
    if (pageInfo.hasNextPage && pageInfo.endCursor) {
      handleNext(pageInfo.endCursor)
    }
  }

  const handlePreviousPage = () => {
    handlePrevious()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-400 font-medium">Loading fleet management...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      <FeedbackModal
        isOpen={dangerModalOpen}
        setIsOpen={setDangerModalOpen}
        variant="danger"
        title={`Delete ${selectedItems.length} fleet(s)?`}
        content="Are you sure you want to delete the selected fleet(s)? This action cannot be undone."
        confirmButtonLabel="Yes, Delete"
      />

      <SearchableListModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title="Select an Agent"
        items={filteredAgents}
        searchPlaceholder="Search for an agent..."
        searchValue={searchQuery}
        onSearch={setSearchQuery}
        renderItem={(agent) => agent.email}
        onSelect={handleAgentSelect}
        selectedItemId={selectedAgentId}
        actionLabel={selectedOption === 1 ? 'Assign Fleet' : 'Re-assign Fleet'}
        onAction={() => handleActionClick(selectedOption === 1 ? 'assign' : 'reAssign')}
      />

      {/* Create Fleet Modal */}
      {showCreateFleet && (
        <CreateFleetModal onClose={() => setShowCreateFleet(false)} />
      )}

      {/* Assign Devices Modal */}
      {showAssignDevices && (
        <AssignDevicesModal onClose={() => setShowAssignDevices(false)} />
      )}

      {/* Fleet Details Modal */}
      {selectedFleet && (
        <FleetDetailsModal 
          fleet={selectedFleet} 
          devices={devices.filter(d => d.fleet === selectedFleet.id)}
          onClose={() => setSelectedFleet(null)} 
        />
      )}

      {/* Header section */}
      <div className="sm:flex sm:justify-between sm:items-center mb-5">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            Fleet Management
          </h1>
        </div>

        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          <SearchForm
            placeholder="Search fleets..." 
            searchTerm={searchTerm}
            setSearchTerm={handleSearch}
          />
          <button 
            onClick={() => setShowCreateFleet(true)}
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white flex items-center justify-center"
          >
            <svg
              className="fill-current shrink-0 xs:hidden"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
            <span className="max-xs:sr-only">Add</span>
          </button>
        </div>
      </div>

      {/* Fleet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Total Fleets</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{fleets.length}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Active fleet configurations
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Total Devices</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {fleets.reduce((sum, fleet) => sum + fleet.deviceCount, 0)}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Across all fleets
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
              <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Active Devices</h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {fleets.reduce((sum, fleet) => sum + fleet.activeDevices, 0)}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Currently reporting
          </p>
        </div>
      </div>

      <div className="sm:flex sm:justify-between sm:items-center mb-5">
        {/* Left side */}
        <div className="mb-4 sm:mb-0">
          <ul className="flex flex-wrap -m-1">
            <li className="m-1">
              <button className="inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border border-transparent shadow-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-800 transition">
                All <span className="ml-1 text-gray-400 dark:text-gray-500">{totalCount}</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Right side */}
        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          {/* Delete button */}
          <DynamicDropdown options={dropdownOptions} onDropdownItemSelect={handleDropdownItemSelect} />
          {/* Dropdown */}
          <DateSelect />
          {/* Filter button */}
          <FilterButton align="right" />
        </div>
      </div>

      {/* Table section */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
        <Table
          data={filteredFleets}
          columns={columns}
          totalCount={filteredFleets.length}
          selectable
          actions={(row) => actions({ 
            row, 
            onDelete: loadData,
            onViewDetails: (fleet) => setSelectedFleet(fleet),
            onAssignDevices: () => setShowAssignDevices(true)
          })}
          onSelectionChange={handleSelectionChange}
          isLoading={loading}
        />
      </div>

      <div className="mt-8">
        <PaginationClassic 
          currentPage={currentPage}
          totalItems={totalCount}
          itemsPerPage={itemsPerPage}
          hasNextPage={pageInfo.hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
        />
      </div> 
    </div>
  )
}

// Fleet Details Modal Component
function FleetDetailsModal({ fleet, devices, onClose }: { 
  fleet: Fleet, 
  devices: Device[], 
  onClose: () => void 
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {fleet.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Fleet Configuration Details
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Fleet Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-gray-900 dark:text-white">Manager</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{fleet.manager}</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900 dark:text-white">Location</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{fleet.location}</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900 dark:text-white">Created</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {new Date(fleet.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Fleet Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {fleet.deviceCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Devices</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {fleet.activeDevices}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {fleet.deviceCount - fleet.activeDevices}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Offline</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {fleet.healthScore}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Health Score</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors">
              Edit Fleet
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Create Fleet Modal Component
function CreateFleetModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager: '',
    location: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Creating fleet:', formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Create New Fleet
            </h2>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Fleet Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Enter fleet name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Fleet description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Fleet Manager
            </label>
            <input
              type="text"
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Manager name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Fleet location"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors"
            >
              Create Fleet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Assign Devices Modal Component
function AssignDevicesModal({ onClose }: { onClose: () => void }) {
  const [selectedDevices, setSelectedDevices] = useState<string[]>([])
  const [selectedFleet, setSelectedFleet] = useState('')

  const unassignedDevices = [
    { id: 'DEV001', name: 'Unassigned Device 001', type: 'Heavy Duty' },
    { id: 'DEV002', name: 'Unassigned Device 002', type: 'Light Duty' },
    { id: 'DEV003', name: 'Unassigned Device 003', type: 'Simulator' }
  ]

  const fleetOptions = [
    { id: 'fleet_001', name: 'Oves Distributor Fleet' },
    { id: 'fleet_002', name: 'Open Token Simulator' },
    { id: 'fleet_003', name: 'M400Test Fleet' }
  ]

  const handleDeviceToggle = (deviceId: string) => {
    setSelectedDevices(prev =>
      prev.includes(deviceId)
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    )
  }

  const handleAssign = () => {
    console.log('Assigning devices:', selectedDevices, 'to fleet:', selectedFleet)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Assign Devices to Fleet
            </h2>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Select Fleet
            </label>
            <select
              value={selectedFleet}
              onChange={(e) => setSelectedFleet(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Choose fleet...</option>
              {fleetOptions.map(fleet => (
                <option key={fleet.id} value={fleet.id}>{fleet.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Select Devices ({selectedDevices.length} selected)
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {unassignedDevices.map(device => (
                <div key={device.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedDevices.includes(device.id)}
                    onChange={() => handleDeviceToggle(device.id)}
                    className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {device.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {device.type} • {device.id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button 
              onClick={handleAssign}
              disabled={!selectedFleet || selectedDevices.length === 0}
              className="px-4 py-2 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Assign Devices
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}