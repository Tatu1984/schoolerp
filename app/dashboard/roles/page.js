'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Shield } from 'lucide-react'

export default function RolesPage() {
  const [roles, setRoles] = useState([])
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRole, setEditingRole] = useState(null)

  const [formData, setFormData] = useState({
    schoolId: '',
    name: '',
    description: '',
    permissions: {
      dashboard: { view: false },
      students: { view: false, create: false, edit: false, delete: false },
      staff: { view: false, create: false, edit: false, delete: false },
      admissions: { view: false, create: false, edit: false, delete: false },
      finance: { view: false, create: false, edit: false, delete: false },
      transport: { view: false, create: false, edit: false, delete: false },
      hostel: { view: false, create: false, edit: false, delete: false },
      library: { view: false, create: false, edit: false, delete: false },
      inventory: { view: false, create: false, edit: false, delete: false },
      lms: { view: false, create: false, edit: false, delete: false },
      communication: { view: false, create: false, edit: false, delete: false },
      analytics: { view: false, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false },
    }
  })

  useEffect(() => {
    fetchRoles()
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      const res = await fetch('/api/schools')
      const result = await res.json()
      setSchools(result.data || [])
    } catch (error) {
      console.error('Error fetching schools:', error)
    }
  }

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/roles')
      const result = await res.json()
      setRoles(result.data || [])
    } catch (error) {
      console.error('Error fetching roles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles'
      const method = editingRole ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        fetchRoles()
        resetForm()
      }
    } catch (error) {
      console.error('Error saving role:', error)
    }
  }

  const handleEdit = (role) => {
    setEditingRole(role)
    setFormData({
      schoolId: role.schoolId,
      name: role.name,
      description: role.description || '',
      permissions: role.permissions
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this role?')) return

    try {
      const res = await fetch(`/api/roles/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchRoles()
      }
    } catch (error) {
      console.error('Error deleting role:', error)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingRole(null)
    setFormData({
      schoolId: '',
      name: '',
      description: '',
      permissions: {
        dashboard: { view: false },
        students: { view: false, create: false, edit: false, delete: false },
        staff: { view: false, create: false, edit: false, delete: false },
        admissions: { view: false, create: false, edit: false, delete: false },
        finance: { view: false, create: false, edit: false, delete: false },
        transport: { view: false, create: false, edit: false, delete: false },
        hostel: { view: false, create: false, edit: false, delete: false },
        library: { view: false, create: false, edit: false, delete: false },
        inventory: { view: false, create: false, edit: false, delete: false },
        lms: { view: false, create: false, edit: false, delete: false },
        communication: { view: false, create: false, edit: false, delete: false },
        analytics: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
      }
    })
  }

  const togglePermission = (module, action) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: !prev.permissions[module][action]
        }
      }
    }))
  }

  const modules = [
    'dashboard', 'students', 'staff', 'admissions', 'finance', 'transport',
    'hostel', 'library', 'inventory', 'lms', 'communication', 'analytics', 'settings'
  ]

  const actions = ['view', 'create', 'edit', 'delete']

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-600">Manage user roles and access control</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Add Role</span>
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingRole ? 'Edit Role' : 'Add New Role'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.schoolId}
                    onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                  >
                    <option value="">Select School</option>
                    {schools.map(school => (
                      <option key={school.id} value={school.id}>{school.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Module Permissions
                </h3>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Module</th>
                        {actions.map(action => (
                          <th key={action} className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                            {action}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {modules.map(module => (
                        <tr key={module} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize">
                            {module}
                          </td>
                          {actions.map(action => (
                            <td key={action} className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={formData.permissions[module]?.[action] || false}
                                onChange={() => togglePermission(module, action)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingRole ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Loading roles...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map(role => (
            <div key={role.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                  {role.description && (
                    <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(role)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase">Permissions</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(role.permissions).map(([module, perms]) => {
                    const hasPermissions = Object.values(perms).some(v => v)
                    if (!hasPermissions) return null
                    return (
                      <span key={module} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {module}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  role.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {role.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}

          {roles.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
              <p className="text-gray-600 mb-4">Create your first custom role to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Role
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
