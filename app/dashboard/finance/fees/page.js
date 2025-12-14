'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react'

export default function FeesPage() {
  const [fees, setFees] = useState([])
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingFee, setEditingFee] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'TUITION',
    amount: '',
    frequency: 'MONTHLY',
    description: '',
    schoolId: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [feesRes, schoolsRes] = await Promise.all([
        fetch('/api/fees'),
        fetch('/api/schools')
      ])

      if (feesRes.ok) {
        const result = await feesRes.json()
        setFees(result.data || [])
      }

      if (schoolsRes.ok) {
        const schoolsResult = await schoolsRes.json()
        const schoolsData = schoolsResult.data || []
        setSchools(schoolsData)
        if (schoolsData.length > 0 && !formData.schoolId) {
          setFormData(prev => ({ ...prev, schoolId: schoolsData[0].id }))
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFees = async () => {
    try {
      const res = await fetch('/api/fees')
      if (res.ok) {
        const result = await res.json()
        setFees(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching fees:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const url = editingFee ? `/api/fees/${editingFee.id}` : '/api/fees'
      const method = editingFee ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      })

      if (res.ok) {
        fetchFees()
        setShowModal(false)
        resetForm()
        alert('Fee saved successfully!')
      } else {
        const error = await res.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      alert('Error saving fee')
      console.error(error)
    }
  }

  const handleEdit = (fee) => {
    setEditingFee(fee)
    setFormData({
      name: fee.name,
      type: fee.type,
      amount: fee.amount.toString(),
      frequency: fee.frequency,
      description: fee.description || '',
      schoolId: fee.schoolId,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this fee?')) return

    try {
      const res = await fetch(`/api/fees/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchFees()
        alert('Fee deleted successfully!')
      }
    } catch (error) {
      alert('Error deleting fee')
      console.error(error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'TUITION',
      amount: '',
      frequency: 'MONTHLY',
      description: '',
      schoolId: schools[0]?.id || '',
    })
    setEditingFee(null)
  }

  const feeTypes = {
    TUITION: 'Tuition Fee',
    ADMISSION: 'Admission Fee',
    EXAMINATION: 'Examination Fee',
    TRANSPORT: 'Transport Fee',
    HOSTEL: 'Hostel Fee',
    LIBRARY: 'Library Fee',
    SPORTS: 'Sports Fee',
    LABORATORY: 'Laboratory Fee',
    UNIFORM: 'Uniform Fee',
    BOOKS: 'Books Fee',
    OTHER: 'Other',
  }

  const frequencies = {
    ONE_TIME: 'One Time',
    MONTHLY: 'Monthly',
    QUARTERLY: 'Quarterly',
    HALF_YEARLY: 'Half-Yearly',
    YEARLY: 'Yearly',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Structure</h1>
          <p className="text-gray-600 mt-1">Manage fee types and amounts</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Fee</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fees.map((fee) => (
            <div key={fee.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-lg">{fee.name}</h3>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  fee.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {fee.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p className="text-2xl font-bold text-primary-600">₹{fee.amount.toFixed(2)}</p>
                <p><span className="font-medium">Type:</span> {feeTypes[fee.type]}</p>
                <p><span className="font-medium">Frequency:</span> {frequencies[fee.frequency]}</p>
                {fee.description && (
                  <p className="text-xs mt-2">{fee.description}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(fee)}
                  className="flex-1 btn btn-secondary text-sm"
                >
                  <Edit className="w-3 h-3 mr-1 inline" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(fee.id)}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {fees.length === 0 && (
            <div className="col-span-full text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No fees found. Add your first fee!</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">
              {editingFee ? 'Edit Fee' : 'Add New Fee'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Fee Name *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Type *</label>
                  <select
                    className="input"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    {Object.entries(feeTypes).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Frequency *</label>
                  <select
                    className="input"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    required
                  >
                    {Object.entries(frequencies).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
                  {editingFee ? 'Update Fee' : 'Add Fee'}
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
