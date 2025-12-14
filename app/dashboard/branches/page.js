'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, MapPin } from 'lucide-react'

export default function BranchesPage() {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    schoolId: 'temp-school-id', // This should come from session
  })

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      const res = await fetch('/api/branches')
      if (res.ok) {
        const result = await res.json()
        setBranches(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching branches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const url = editingBranch ? `/api/branches/${editingBranch.id}` : '/api/branches'
      const method = editingBranch ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        fetchBranches()
        setShowModal(false)
        resetForm()
        alert('Branch saved successfully!')
      } else {
        const error = await res.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      alert('Error saving branch')
      console.error(error)
    }
  }

  const handleEdit = (branch) => {
    setEditingBranch(branch)
    setFormData({
      name: branch.name,
      code: branch.code,
      address: branch.address || '',
      city: branch.city || '',
      state: branch.state || '',
      phone: branch.phone || '',
      email: branch.email || '',
      schoolId: branch.schoolId,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this branch?')) return

    try {
      const res = await fetch(`/api/branches/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchBranches()
        alert('Branch deleted successfully!')
      }
    } catch (error) {
      alert('Error deleting branch')
      console.error(error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      address: '',
      city: '',
      state: '',
      phone: '',
      email: '',
      schoolId: 'temp-school-id',
    })
    setEditingBranch(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Branches</h1>
          <p className="text-gray-600 mt-1">Manage school branches and locations</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Branch</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <div key={branch.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <h3 className="font-bold text-lg">{branch.name}</h3>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  branch.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {branch.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p><span className="font-medium">Code:</span> {branch.code}</p>
                {branch.city && <p><span className="font-medium">City:</span> {branch.city}</p>}
                {branch.phone && <p><span className="font-medium">Phone:</span> {branch.phone}</p>}
                {branch.email && <p><span className="font-medium">Email:</span> {branch.email}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(branch)}
                  className="flex-1 btn btn-secondary text-sm"
                >
                  <Edit className="w-3 h-3 mr-1 inline" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(branch.id)}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {branches.length === 0 && (
            <div className="col-span-full text-center py-12">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No branches found. Add your first branch!</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingBranch ? 'Edit Branch' : 'Add New Branch'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Branch Name *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">Branch Code *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">Address</label>
                  <textarea
                    className="input"
                    rows="2"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">City</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">State</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    className="input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button type="submit" className="btn btn-primary">
                  {editingBranch ? 'Update Branch' : 'Add Branch'}
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
