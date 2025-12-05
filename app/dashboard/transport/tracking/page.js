'use client'

import { useState, useEffect } from 'react'
import { MapPin, Navigation, Activity, Clock, Truck } from 'lucide-react'

export default function TrackingPage() {
  const [vehicles, setVehicles] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVehicles()
    // Simulate real-time updates every 10 seconds
    const interval = setInterval(fetchVehicles, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/transport/tracking')
      if (res.ok) {
        const data = await res.json()
        setVehicles(data)
        if (!selectedVehicle && data.length > 0) {
          setSelectedVehicle(data[0])
        }
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSpeedColor = (speed) => {
    if (speed === 0) return 'text-gray-500'
    if (speed < 30) return 'text-green-500'
    if (speed < 50) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GPS Tracking</h1>
          <p className="text-gray-600 mt-1">Real-time vehicle location tracking</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Activity className="w-4 h-4 text-green-500 animate-pulse" />
          <span>Live Tracking</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-primary-600">{vehicles.length}</div>
          <div className="text-sm text-gray-600">Total Vehicles</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {vehicles.filter(v => v.status === 'MOVING').length}
          </div>
          <div className="text-sm text-gray-600">Moving</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {vehicles.filter(v => v.status === 'IDLE').length}
          </div>
          <div className="text-sm text-gray-600">Idle</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600">
            {vehicles.filter(v => v.status === 'STOPPED').length}
          </div>
          <div className="text-sm text-gray-600">Stopped</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading tracking data...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map View */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Map View</h2>
              <div className="bg-gray-100 rounded-lg h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Map integration would go here</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Integration with Google Maps, Leaflet, or Mapbox
                  </p>
                  {selectedVehicle && (
                    <div className="mt-4 p-4 bg-white rounded-lg shadow-sm inline-block">
                      <div className="font-semibold">{selectedVehicle.vehicleNumber}</div>
                      <div className="text-sm text-gray-600">
                        {selectedVehicle.currentLocation}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Speed: {selectedVehicle.speed} km/h
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Route Info */}
              {selectedVehicle && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Route Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">Start:</span>
                      <span className="font-medium">{selectedVehicle.routeStart}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span className="text-gray-600">End:</span>
                      <span className="font-medium">{selectedVehicle.routeEnd}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Navigation className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600">Distance:</span>
                      <span className="font-medium">{selectedVehicle.totalDistance} km</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Vehicles</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedVehicle?.id === vehicle.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{vehicle.vehicleNumber}</div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        vehicle.status === 'MOVING' ? 'bg-green-100 text-green-700' :
                        vehicle.status === 'IDLE' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {vehicle.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{vehicle.currentLocation}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Activity className={`w-4 h-4 ${getSpeedColor(vehicle.speed)}`} />
                        <span>{vehicle.speed} km/h</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Updated: {new Date(vehicle.lastUpdate).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {vehicle.driver && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-sm">
                        <span className="text-gray-600">Driver: </span>
                        <span className="font-medium">{vehicle.driver}</span>
                      </div>
                    )}
                  </div>
                ))}

                {vehicles.length === 0 && (
                  <div className="text-center py-8">
                    <Truck className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No vehicles tracking</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
