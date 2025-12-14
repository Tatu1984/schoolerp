'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Download, Edit, Trash2, TrendingDown } from 'lucide-react'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [formData, setFormData] = useState({
    expenseType: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    approvedBy: ''
  })

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/finance/expenses')
      if (res.ok) {
        const result = await res.json()
        setExpenses(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingExpense
        ? `/api/finance/expenses/${editingExpense.id}`
        : '/api/finance/expenses'
      const method = editingExpense ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        fetchExpenses()
        setShowModal(false)
        resetForm()
        alert(`Expense ${editingExpense ? 'updated' : 'added'} successfully!`)
      }
    } catch (error) {
      alert('Error saving expense')
      console.error(error)
    }
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setFormData({
      expenseType: expense.expenseType,
      amount: expense.amount,
      date: expense.date,
      category: expense.category,
      description: expense.description,
      approvedBy: expense.approvedBy
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    try {
      const res = await fetch(`/api/finance/expenses/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchExpenses()
        alert('Expense deleted successfully!')
      }
    } catch (error) {
      alert('Error deleting expense')
      console.error(error)
    }
  }

  const resetForm = () => {
    setFormData({
      expenseType: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
      approvedBy: ''
    })
    setEditingExpense(null)
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch =
      expense.expenseType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory

    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(expenses.map(e => e.category).filter(Boolean))]
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">Track and manage school expenses</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600">Rs. {totalExpenses.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Expenses</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-primary-600">{expenses.length}</div>
          <div className="text-sm text-gray-600">Total Records</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">
            Rs. {(totalExpenses / expenses.length || 0).toFixed(0)}
          </div>
          <div className="text-sm text-gray-600">Average Expense</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search expenses..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="input"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <button className="btn btn-secondary flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Expenses List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved By</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm font-medium">{expense.expenseType}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm max-w-xs truncate">{expense.description}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-red-600">
                    Rs. {expense.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">{expense.approvedBy}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="text-green-600 hover:text-green-700"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No expenses found</p>
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
              {editingExpense ? 'Edit Expense' : 'Add Expense'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expense Type *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.expenseType}
                    onChange={(e) => setFormData({...formData, expenseType: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g., Utilities, Salaries"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    className="input"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
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
                    Approved By *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.approvedBy}
                    onChange={(e) => setFormData({...formData, approvedBy: e.target.value})}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    rows="3"
                    className="input"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
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
                  {editingExpense ? 'Update' : 'Add'} Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
