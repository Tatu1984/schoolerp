'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Calendar, CheckCircle } from 'lucide-react'

export default function AcademicYearsPage() {
  const [years, setYears] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingYear, setEditingYear] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    schoolId: 'temp-school-id',
  })

  useEffect(() => {
    fetchYears()
  }, [])

  const fetchYears = async () => {
    try {
      const res = await fetch('/api/academic-years')
      if (res.ok) {
        const data = await res.json()
        setYears(data)
      }
    } catch (error) {
      console.error('Error fetching academic years:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const url = editingYear ? `/api/academic-years/${editingYear.id}` : '/api/academic-years'
      const method = editingYear ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        fetchYears()
        setShowModal(false)
        resetForm()
        alert('Academic year saved successfully!')
      } else {
        const error = await res.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      alert('Error saving academic year')
      console.error(error)
    }
  }

  const handleEdit = (year) => {
    setEditingYear(year)
    setFormData({
      name: year.name,
      startDate: year.startDate.split('T')[0],
      endDate: year.endDate.split('T')[0],
      isCurrent: year.isCurrent,
      schoolId: year.schoolId,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this academic year?')) return

    try {
      const res = await fetch(`/api/academic-years/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchYears()
        alert('Academic year deleted successfully!')
      }
    } catch (error) {
      alert('Error deleting academic year')
      console.error(error)
    }
  }

  const handleSetCurrent = async (id) => {
    try {
      const res = await fetch(`/api/academic-years/${id}/set-current`, { method: 'POST' })
      if (res.ok) {
        fetchYears()
        alert('Current academic year updated!')
      }
    } catch (error) {
      alert('Error updating current year')
      console.error(error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      schoolId: 'temp-school-id',
    })
    setEditingYear(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Academic Years</h1>
          <p className="text-gray-600 mt-1">Manage academic sessions and years</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Academic Year</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {years.map((year) => (
                <tr key={year.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-primary-600 mr-2" />
                      <span className="font-medium">{year.name}</span>
                      {year.isCurrent && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(year.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(year.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      year.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {year.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {!year.isCurrent && (
                      <button
                        onClick={() => handleSetCurrent(year.id)}
                        className="text-green-600 hover:text-green-700"
                        title="Set as current"
                      >
                        <CheckCircle className="w-5 h-5 inline" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(year)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-5 h-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(year.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}

              {years.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No academic years found. Add your first year!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">
              {editingYear ? 'Edit Academic Year' : 'Add New Academic Year'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Year Name *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., 2024-2025"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Date *</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">End Date *</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isCurrent"
                  checked={formData.isCurrent}
                  onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isCurrent" className="ml-2 text-sm text-gray-700">
                  Set as current academic year
                </label>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button type="submit" className="btn btn-primary">
                  {editingYear ? 'Update Year' : 'Add Year'}
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
