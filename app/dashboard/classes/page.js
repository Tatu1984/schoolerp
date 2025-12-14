'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react'

export default function ClassesPage() {
  const [classes, setClasses] = useState([])
  const [academicYears, setAcademicYears] = useState([])
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    capacity: '',
    description: '',
    academicYearId: '',
    schoolId: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [classesRes, yearsRes, schoolsRes] = await Promise.all([
        fetch('/api/classes'),
        fetch('/api/academic-years'),
        fetch('/api/schools')
      ])

      if (classesRes.ok) {
        const classesResult = await classesRes.json()
        setClasses(classesResult.data || [])
      }

      if (yearsRes.ok) {
        const yearsResult = await yearsRes.json()
        const yearsData = yearsResult.data || []
        setAcademicYears(yearsData)
        const current = yearsData.find(y => y.isCurrent)
        if (current && !formData.academicYearId) {
          setFormData(prev => ({ ...prev, academicYearId: current.id }))
        }
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const url = editingClass ? `/api/classes/${editingClass.id}` : '/api/classes'
      const method = editingClass ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          grade: parseInt(formData.grade),
          capacity: parseInt(formData.capacity),
        }),
      })

      if (res.ok) {
        fetchData()
        setShowModal(false)
        resetForm()
        alert('Class saved successfully!')
      } else {
        const error = await res.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      alert('Error saving class')
      console.error(error)
    }
  }

  const handleEdit = (classItem) => {
    setEditingClass(classItem)
    setFormData({
      name: classItem.name,
      grade: classItem.grade.toString(),
      capacity: classItem.capacity.toString(),
      description: classItem.description || '',
      academicYearId: classItem.academicYearId,
      schoolId: classItem.schoolId,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this class?')) return

    try {
      const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
        alert('Class deleted successfully!')
      }
    } catch (error) {
      alert('Error deleting class')
      console.error(error)
    }
  }

  const resetForm = () => {
    const current = academicYears.find(y => y.isCurrent)
    setFormData({
      name: '',
      grade: '',
      capacity: '',
      description: '',
      academicYearId: current?.id || '',
      schoolId: schools[0]?.id || '',
    })
    setEditingClass(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-600 mt-1">Manage class grades and sections</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Class</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <div key={classItem.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                  <h3 className="font-bold text-lg">{classItem.name}</h3>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  classItem.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {classItem.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p><span className="font-medium">Grade:</span> {classItem.grade}</p>
                <p><span className="font-medium">Capacity:</span> {classItem.capacity} students</p>
                <p><span className="font-medium">Year:</span> {classItem.academicYear?.name}</p>
                {classItem.description && (
                  <p className="text-xs mt-2">{classItem.description}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(classItem)}
                  className="flex-1 btn btn-secondary text-sm"
                >
                  <Edit className="w-3 h-3 mr-1 inline" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(classItem.id)}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {classes.length === 0 && (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No classes found. Add your first class!</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">
              {editingClass ? 'Edit Class' : 'Add New Class'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Class Name *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Class 1A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Grade *</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="e.g., 1"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    required
                    min="1"
                    max="12"
                  />
                </div>

                <div>
                  <label className="label">Capacity *</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="e.g., 40"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="label">Academic Year *</label>
                <select
                  className="input"
                  value={formData.academicYearId}
                  onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                  required
                >
                  <option value="">Select Year</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name} {year.isCurrent && '(Current)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  className="input"
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button type="submit" className="btn btn-primary">
                  {editingClass ? 'Update Class' : 'Add Class'}
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
