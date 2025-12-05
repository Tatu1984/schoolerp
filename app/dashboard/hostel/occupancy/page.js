'use client'

import { useState, useEffect } from 'react'
import { Search, Download, Users, Home, Eye } from 'lucide-react'

export default function OccupancyPage() {
  const [occupancy, setOccupancy] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [selectedRoom, setSelectedRoom] = useState(null)

  useEffect(() => {
    fetchOccupancy()
  }, [])

  const fetchOccupancy = async () => {
    try {
      const res = await fetch('/api/hostel/occupancy')
      if (res.ok) {
        const data = await res.json()
        setOccupancy(data)
      }
    } catch (error) {
      console.error('Error fetching occupancy:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOccupancy = occupancy.filter(room => {
    const matchesSearch =
      room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.students?.some(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      )

    const matchesType = filterType === 'all' || room.type === filterType

    return matchesSearch && matchesType
  })

  const totalCapacity = occupancy.reduce((sum, room) => sum + room.capacity, 0)
  const totalOccupied = occupancy.reduce((sum, room) => sum + (room.students?.length || 0), 0)
  const occupancyRate = totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Occupancy</h1>
          <p className="text-gray-600 mt-1">Track student room assignments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-primary-600">{totalCapacity}</div>
          <div className="text-sm text-gray-600">Total Capacity</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">{totalOccupied}</div>
          <div className="text-sm text-gray-600">Students Accommodated</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">{occupancyRate}%</div>
          <div className="text-sm text-gray-600">Occupancy Rate</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {totalCapacity - totalOccupied}
          </div>
          <div className="text-sm text-gray-600">Available Beds</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search room or student..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="input"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="BOYS">Boys</option>
            <option value="GIRLS">Girls</option>
          </select>

          <button className="btn btn-secondary flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Occupancy List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOccupancy.map((room) => (
            <div key={room.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">Room {room.roomNumber}</h3>
                  <p className="text-sm text-gray-600">Floor {room.floorNumber}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    room.type === 'BOYS' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                  }`}>
                    {room.type}
                  </span>
                  <div className="text-sm text-gray-600 mt-1">
                    {room.students?.length || 0} / {room.capacity} beds
                  </div>
                </div>
              </div>

              {/* Occupancy Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Occupancy</span>
                  <span className="font-medium">
                    {room.capacity > 0 ? ((room.students?.length || 0) / room.capacity * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      (room.students?.length || 0) === room.capacity
                        ? 'bg-red-500'
                        : (room.students?.length || 0) > room.capacity * 0.7
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min(((room.students?.length || 0) / room.capacity) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Students List */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Students:</div>
                {room.students && room.students.length > 0 ? (
                  <div className="space-y-2">
                    {room.students.map((student, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{student.name}</div>
                            <div className="text-xs text-gray-500">{student.admissionNumber}</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Bed {student.bedNumber || index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    <Home className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    Room is vacant
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredOccupancy.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No occupancy data found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
