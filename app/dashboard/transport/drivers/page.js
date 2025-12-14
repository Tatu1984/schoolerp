'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Download, Edit, Trash2, User, AlertCircle } from 'lucide-react'

export default function DriversPage() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingDriver, setEditingDriver] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    experience: '',
    status: 'ACTIVE'
  })

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const res = await fetch('/api/transport/drivers')
      if (res.ok) {
        const result = await res.json()
        setDrivers(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching drivers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingDriver
        ? `/api/transport/drivers/${editingDriver.id}`
        : '/api/transport/drivers'
      const method = editingDriver ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        fetchDrivers()
        setShowModal(false)
        resetForm()
        alert(`Driver ${editingDriver ? 'updated' : 'added'} successfully!`)
      }
    } catch (error) {
      alert('Error saving driver')
      console.error(error)
    }
  }

  const handleEdit = (driver) => {
    setEditingDriver(driver)
    setFormData({
      name: driver.name,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry,
      experience: driver.experience,
      status: driver.status
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this driver?')) return

    try {
      const res = await fetch(`/api/transport/drivers/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchDrivers()
        alert('Driver deleted successfully!')
      }
    } catch (error) {
      alert('Error deleting driver')
      console.error(error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      licenseNumber: '',
      licenseExpiry: '',
      experience: '',
      status: 'ACTIVE'
    })
    setEditingDriver(null)
  }

  const isLicenseExpiring = (expiryDate) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0
  }

  const isLicenseExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date()
  }

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch =
      driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || driver.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    return status === 'ACTIVE'
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Drivers</h1>
          <p className="text-gray-600 mt-1">Manage transportation drivers</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Driver</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-primary-600">{drivers.length}</div>
          <div className="text-sm text-gray-600">Total Drivers</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {drivers.filter(d => d.status === 'ACTIVE').length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {drivers.filter(d => isLicenseExpiring(d.licenseExpiry)).length}
          </div>
          <div className="text-sm text-gray-600">License Expiring Soon</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600">
            {drivers.filter(d => isLicenseExpired(d.licenseExpiry)).length}
          </div>
          <div className="text-sm text-gray-600">License Expired</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search drivers..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <button className="btn btn-secondary flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Driver List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{driver.name}</td>
                  <td className="px-6 py-4 text-sm">{driver.phone}</td>
                  <td className="px-6 py-4 text-sm">{driver.licenseNumber}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span>{new Date(driver.licenseExpiry).toLocaleDateString()}</span>
                      {isLicenseExpired(driver.licenseExpiry) && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      {isLicenseExpiring(driver.licenseExpiry) && !isLicenseExpired(driver.licenseExpiry) && (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{driver.experience} years</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(driver.status)}`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(driver)}
                      className="text-green-600 hover:text-green-700"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(driver.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredDrivers.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No drivers found</p>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingDriver ? 'Edit Driver' : 'Add Driver'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    className="input"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Expiry *
                  </label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={formData.licenseExpiry}
                    onChange={(e) => setFormData({...formData, licenseExpiry: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (years) *
                  </label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    required
                    className="input"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
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
                  {editingDriver ? 'Update' : 'Add'} Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
