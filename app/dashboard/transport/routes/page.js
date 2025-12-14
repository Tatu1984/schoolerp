'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, MapPin, Navigation } from 'lucide-react'

export default function RoutesPage() {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRoute, setEditingRoute] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    schoolId: 'temp-school-id',
  })

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      const res = await fetch('/api/routes')
      if (res.ok) {
        const result = await res.json()
        setRoutes(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching routes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const url = editingRoute ? `/api/routes/${editingRoute.id}` : '/api/routes'
      const method = editingRoute ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        fetchRoutes()
        setShowModal(false)
        resetForm()
        alert('Route saved successfully!')
      } else {
        const error = await res.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      alert('Error saving route')
      console.error(error)
    }
  }

  const handleEdit = (route) => {
    setEditingRoute(route)
    setFormData({
      name: route.name,
      code: route.code,
      description: route.description || '',
      schoolId: route.schoolId,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this route?')) return

    try {
      const res = await fetch(`/api/routes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchRoutes()
        alert('Route deleted successfully!')
      }
    } catch (error) {
      alert('Error deleting route')
      console.error(error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      schoolId: 'temp-school-id',
    })
    setEditingRoute(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transport Routes</h1>
          <p className="text-gray-600 mt-1">Manage school transport routes and stops</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Route</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <div key={route.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Navigation className="w-5 h-5 text-primary-600" />
                  <h3 className="font-bold text-lg">{route.name}</h3>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  route.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {route.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p><span className="font-medium">Code:</span> {route.code}</p>
                <p><span className="font-medium">Stops:</span> {route._count?.stops || 0}</p>
                <p><span className="font-medium">Vehicles:</span> {route._count?.vehicles || 0}</p>
                <p><span className="font-medium">Students:</span> {route._count?.students || 0}</p>
                {route.description && (
                  <p className="text-xs mt-2">{route.description}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(route)}
                  className="flex-1 btn btn-secondary text-sm"
                >
                  <Edit className="w-3 h-3 mr-1 inline" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(route.id)}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {routes.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No routes found. Add your first route!</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">
              {editingRoute ? 'Edit Route' : 'Add New Route'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Route Name *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Route Code *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  className="input"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button type="submit" className="btn btn-primary">
                  {editingRoute ? 'Update Route' : 'Add Route'}
                </button>
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
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
