'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Download, Edit, Trash2, Home, Filter } from 'lucide-react'

export default function RoomsPage() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [formData, setFormData] = useState({
    roomNumber: '',
    floorNumber: '',
    capacity: '',
    type: 'BOYS',
    status: 'AVAILABLE'
  })

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/hostel/rooms')
      if (res.ok) {
        const result = await res.json()
        setRooms(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingRoom
        ? `/api/hostel/rooms/${editingRoom.id}`
        : '/api/hostel/rooms'
      const method = editingRoom ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        fetchRooms()
        setShowModal(false)
        resetForm()
        alert(`Room ${editingRoom ? 'updated' : 'added'} successfully!`)
      }
    } catch (error) {
      alert('Error saving room')
      console.error(error)
    }
  }

  const handleEdit = (room) => {
    setEditingRoom(room)
    setFormData({
      roomNumber: room.roomNumber,
      floorNumber: room.floorNumber,
      capacity: room.capacity,
      type: room.type,
      status: room.status
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this room?')) return

    try {
      const res = await fetch(`/api/hostel/rooms/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchRooms()
        alert('Room deleted successfully!')
      }
    } catch (error) {
      alert('Error deleting room')
      console.error(error)
    }
  }

  const resetForm = () => {
    setFormData({
      roomNumber: '',
      floorNumber: '',
      capacity: '',
      type: 'BOYS',
      status: 'AVAILABLE'
    })
    setEditingRoom(null)
  }

  const filteredRooms = rooms.filter(room => {
    const matchesSearch =
      room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || room.status === filterStatus
    const matchesType = filterType === 'all' || room.type === filterType

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-700'
      case 'OCCUPIED':
        return 'bg-blue-100 text-blue-700'
      case 'MAINTENANCE':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hostel Rooms</h1>
          <p className="text-gray-600 mt-1">Manage hostel room inventory</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-primary-600">{rooms.length}</div>
          <div className="text-sm text-gray-600">Total Rooms</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {rooms.filter(r => r.status === 'AVAILABLE').length}
          </div>
          <div className="text-sm text-gray-600">Available</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">
            {rooms.filter(r => r.status === 'OCCUPIED').length}
          </div>
          <div className="text-sm text-gray-600">Occupied</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600">
            {rooms.filter(r => r.status === 'MAINTENANCE').length}
          </div>
          <div className="text-sm text-gray-600">Maintenance</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search room number..."
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

          <select
            className="input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          <button className="btn btn-secondary flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Room List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Floor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Occupancy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRooms.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{room.roomNumber}</td>
                  <td className="px-6 py-4 text-sm">Floor {room.floorNumber}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      room.type === 'BOYS' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                    }`}>
                      {room.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{room.capacity}</td>
                  <td className="px-6 py-4 text-sm">
                    {room.currentOccupancy || 0} / {room.capacity}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(room.status)}`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(room)}
                      className="text-green-600 hover:text-green-700"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRooms.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No rooms found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">
              {editingRoom ? 'Edit Room' : 'Add Room'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor Number *
                  </label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.floorNumber}
                    onChange={(e) => setFormData({...formData, floorNumber: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    required
                    className="input"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="BOYS">Boys</option>
                    <option value="GIRLS">Girls</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    required
                    className="input"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRoom ? 'Update' : 'Add'} Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
