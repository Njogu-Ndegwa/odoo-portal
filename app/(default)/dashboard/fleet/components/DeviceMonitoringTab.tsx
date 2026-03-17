'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Search, Battery, Thermometer, MapPin, Wifi, AlertCircle, Clock, Zap } from 'lucide-react'

interface DeviceData {
  id: string
  name: string
  fleet: string
  status: 'online' | 'offline' | 'warning'
  battery: {
    level: number
    voltage: number
    current: number
    temperature: number
    cycles: number
  }
  location: {
    latitude: number
    longitude: number
    altitude: number
    speed: number
    gpsStrength: number
  }
  lastSeen: string
  firmware: string
}

export default function DeviceMonitoringTab() {
  const t = useTranslations('fleetDashboard')
  const [devices, setDevices] = useState<DeviceData[]>([])
  const [selectedDevice, setSelectedDevice] = useState<DeviceData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'warning'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockDevices: DeviceData[] = [
        {
          id: 'DV001',
          name: 'Distribution Vehicle 001',
          fleet: 'Oves Distributor Fleet',
          status: 'online',
          battery: {
            level: 87,
            voltage: 36.2,
            current: 2.3,
            temperature: 32,
            cycles: 145
          },
          location: {
            latitude: -1.2921,
            longitude: 36.8219,
            altitude: 1795,
            speed: 24,
            gpsStrength: 95
          },
          lastSeen: new Date().toISOString(),
          firmware: 'v2.3.8'
        },
        {
          id: 'DV002',
          name: 'Distribution Vehicle 002',
          fleet: 'Oves Distributor Fleet',
          status: 'warning',
          battery: {
            level: 23,
            voltage: 34.1,
            current: 0.8,
            temperature: 42,
            cycles: 287
          },
          location: {
            latitude: -1.3031,
            longitude: 36.8342,
            altitude: 1820,
            speed: 0,
            gpsStrength: 78
          },
          lastSeen: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          firmware: 'v2.3.7'
        },
        {
          id: 'OTS001',
          name: 'Open Token Simulator 001',
          fleet: 'Open Token Simulator',
          status: 'online',
          battery: {
            level: 92,
            voltage: 37.8,
            current: 1.5,
            temperature: 28,
            cycles: 67
          },
          location: {
            latitude: -1.2845,
            longitude: 36.8156,
            altitude: 1763,
            speed: 45,
            gpsStrength: 92
          },
          lastSeen: new Date(Date.now() - 1000 * 30).toISOString(),
          firmware: 'v2.4.1'
        },
        {
          id: 'M400-001',
          name: 'M400 Test Unit 001',
          fleet: 'M400Test Fleet',
          status: 'offline',
          battery: {
            level: 0,
            voltage: 0,
            current: 0,
            temperature: 0,
            cycles: 198
          },
          location: {
            latitude: -1.2756,
            longitude: 36.8098,
            altitude: 1745,
            speed: 0,
            gpsStrength: 0
          },
          lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          firmware: 'v2.3.5'
        }
      ]
      
      setDevices(mockDevices)
      setSelectedDevice(mockDevices[0])
    } catch (error) {
      console.error('Error fetching devices:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || device.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 dark:text-green-400'
      case 'warning': return 'text-yellow-600 dark:text-yellow-400'
      case 'offline': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 dark:bg-green-900/20'
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-900/20'
      case 'offline': return 'bg-red-100 dark:bg-red-900/20'
      default: return 'bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-600 dark:text-green-400'
    if (level > 20) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-400 font-medium">Loading device data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('searchDevices')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'online', 'warning', 'offline'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  filterStatus === status
                    ? 'bg-violet-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="ml-2 text-xs opacity-75">
                  ({status === 'all' ? devices.length : devices.filter(d => d.status === status).length})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Device List */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Devices ({filteredDevices.length})
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredDevices.map((device) => (
                <div
                  key={device.id}
                  onClick={() => setSelectedDevice(device)}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedDevice?.id === device.id ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusBgColor(device.status)}`}>
                        <div className={`w-full h-full rounded-full ${getStatusColor(device.status)} opacity-80`} />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {device.id}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBgColor(device.status)} ${getStatusColor(device.status)}`}>
                      {device.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {device.name}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                    <span>{device.fleet}</span>
                    <div className="flex items-center gap-1">
                      <Battery className="w-3 h-3" />
                      <span className={getBatteryColor(device.battery.level)}>
                        {device.battery.level}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Device Details */}
        <div className="xl:col-span-2">
          {selectedDevice ? (
            <DeviceDetails device={selectedDevice} />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Battery className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a device to view details
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a device from the list to see its real-time status and metrics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Device Details Component
function DeviceDetails({ device }: { device: DeviceData }) {
  const t = useTranslations('fleetDashboard')
  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-600 dark:text-green-400'
    if (level > 20) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getTemperatureColor = (temp: number) => {
    if (temp < 35) return 'text-blue-600 dark:text-blue-400'
    if (temp < 45) return 'text-green-600 dark:text-green-400'
    if (temp < 55) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Device Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {device.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {device.id} • {device.fleet}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              device.status === 'online' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : device.status === 'warning'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {device.status.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Last Seen</span>
            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(device.lastSeen).toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Firmware</span>
            <div className="font-medium text-gray-900 dark:text-white">
              {device.firmware}
            </div>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">GPS Signal</span>
            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
              <Wifi className="w-4 h-4" />
              {device.location.gpsStrength}%
            </div>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Speed</span>
            <div className="font-medium text-gray-900 dark:text-white">
              {device.location.speed} km/h
            </div>
          </div>
        </div>
      </div>

      {/* Battery Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Battery className="w-6 h-6 text-violet-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Battery Status
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title={t('batteryLevel')}
            value={`${device.battery.level}%`}
            icon={<Battery className="w-5 h-5" />}
            color={getBatteryColor(device.battery.level)}
            progress={device.battery.level}
          />
          <MetricCard
            title={t('voltage')}
            value={`${device.battery.voltage}V`}
            icon={<Zap className="w-5 h-5" />}
            color="text-blue-600 dark:text-blue-400"
          />
          <MetricCard
            title={t('current')}
            value={`${device.battery.current}A`}
            icon={<Zap className="w-5 h-5" />}
            color="text-purple-600 dark:text-purple-400"
          />
          <MetricCard
            title={t('cycles')}
            value={device.battery.cycles.toString()}
            icon={<AlertCircle className="w-5 h-5" />}
            color="text-orange-600 dark:text-orange-400"
          />
        </div>
      </div>

      {/* Temperature and Location */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Thermometer className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Temperature
            </h3>
          </div>
          
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${getTemperatureColor(device.battery.temperature)}`}>
              {device.battery.temperature}°C
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Battery Temperature
            </div>
            {device.battery.temperature > 50 && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">High temperature warning</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Location
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Latitude</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {device.location.latitude.toFixed(6)}
                </div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Longitude</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {device.location.longitude.toFixed(6)}
                </div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Altitude</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {device.location.altitude}m
                </div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">GPS Strength</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {device.location.gpsStrength}%
                </div>
              </div>
            </div>
            
            <button className="w-full mt-4 px-4 py-2 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors duration-200">
              View on Map
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Metric Card Component for Device Details
interface MetricCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: string
  progress?: number
}

function MetricCard({ title, value, icon, color, progress }: MetricCardProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 ${color}`}>
          {icon}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {title}
        </div>
      </div>
      <div className={`text-2xl font-bold ${color} mb-2`}>
        {value}
      </div>
      {progress !== undefined && (
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              progress > 50 ? 'bg-green-500' : progress > 20 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}