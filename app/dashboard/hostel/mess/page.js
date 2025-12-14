'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Download, Edit, Trash2, UtensilsCrossed, Calendar } from 'lucide-react'

export default function MessPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMealType, setFilterMealType] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    planName: '',
    mealType: 'BREAKFAST',
    menu: '',
    date: '',
    price: ''
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/hostel/mess')
      if (res.ok) {
        const result = await res.json()
        setPlans(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching mess plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingPlan
        ? `/api/hostel/mess/${editingPlan.id}`
        : '/api/hostel/mess'
      const method = editingPlan ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        fetchPlans()
        setShowModal(false)
        resetForm()
        alert(`Mess plan ${editingPlan ? 'updated' : 'added'} successfully!`)
      }
    } catch (error) {
      alert('Error saving mess plan')
      console.error(error)
    }
  }

  const handleEdit = (plan) => {
    setEditingPlan(plan)
    setFormData({
      planName: plan.planName,
      mealType: plan.mealType,
      menu: plan.menu,
      date: plan.date,
      price: plan.price
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this mess plan?')) return

    try {
      const res = await fetch(`/api/hostel/mess/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchPlans()
        alert('Mess plan deleted successfully!')
      }
    } catch (error) {
      alert('Error deleting mess plan')
      console.error(error)
    }
  }

  const resetForm = () => {
    setFormData({
      planName: '',
      mealType: 'BREAKFAST',
      menu: '',
      date: '',
      price: ''
    })
    setEditingPlan(null)
  }

  const filteredPlans = plans.filter(plan => {
    const matchesSearch =
      plan.planName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.menu?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesMealType = filterMealType === 'all' || plan.mealType === filterMealType

    return matchesSearch && matchesMealType
  })

  const getMealTypeColor = (mealType) => {
    switch (mealType) {
      case 'BREAKFAST':
        return 'bg-yellow-100 text-yellow-700'
      case 'LUNCH':
        return 'bg-green-100 text-green-700'
      case 'DINNER':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mess Management</h1>
          <p className="text-gray-600 mt-1">Manage hostel mess plans and menu</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Mess Plan</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-primary-600">{plans.length}</div>
          <div className="text-sm text-gray-600">Total Plans</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {plans.filter(p => p.mealType === 'BREAKFAST').length}
          </div>
          <div className="text-sm text-gray-600">Breakfast Plans</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {plans.filter(p => p.mealType === 'LUNCH').length}
          </div>
          <div className="text-sm text-gray-600">Lunch Plans</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">
            {plans.filter(p => p.mealType === 'DINNER').length}
          </div>
          <div className="text-sm text-gray-600">Dinner Plans</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search plans or menu..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="input"
            value={filterMealType}
            onChange={(e) => setFilterMealType(e.target.value)}
          >
            <option value="all">All Meal Types</option>
            <option value="BREAKFAST">Breakfast</option>
            <option value="LUNCH">Lunch</option>
            <option value="DINNER">Dinner</option>
          </select>

          <button className="btn btn-secondary flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Menu</span>
          </button>
        </div>
      </div>

      {/* Mess Plans List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meal Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Menu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{plan.planName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getMealTypeColor(plan.mealType)}`}>
                      {plan.mealType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm max-w-xs truncate">{plan.menu}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{new Date(plan.date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">Rs. {plan.price}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="text-green-600 hover:text-green-700"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredPlans.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <UtensilsCrossed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No mess plans found</p>
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
              {editingPlan ? 'Edit Mess Plan' : 'Add Mess Plan'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.planName}
                    onChange={(e) => setFormData({...formData, planName: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meal Type *
                  </label>
                  <select
                    required
                    className="input"
                    value={formData.mealType}
                    onChange={(e) => setFormData({...formData, mealType: e.target.value})}
                  >
                    <option value="BREAKFAST">Breakfast</option>
                    <option value="LUNCH">Lunch</option>
                    <option value="DINNER">Dinner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    className="input"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Menu *
                  </label>
                  <textarea
                    required
                    rows="4"
                    className="input"
                    placeholder="Enter menu items..."
                    value={formData.menu}
                    onChange={(e) => setFormData({...formData, menu: e.target.value})}
                  />
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
                  {editingPlan ? 'Update' : 'Add'} Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
