'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Download, Edit, Trash2, FileText, Calendar } from 'lucide-react'

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCourse, setFilterCourse] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    courseId: '',
    dueDate: '',
    totalMarks: '',
    description: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [assignmentsRes, coursesRes] = await Promise.all([
        fetch('/api/lms/assignments'),
        fetch('/api/lms/courses')
      ])

      if (assignmentsRes.ok) {
        const result = await assignmentsRes.json()
        setAssignments(result.data || [])
      }

      if (coursesRes.ok) {
        const result = await coursesRes.json()
        setCourses(result.data || [])
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
      const url = editingAssignment
        ? `/api/lms/assignments/${editingAssignment.id}`
        : '/api/lms/assignments'
      const method = editingAssignment ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        fetchData()
        setShowModal(false)
        resetForm()
        alert(`Assignment ${editingAssignment ? 'updated' : 'created'} successfully!`)
      }
    } catch (error) {
      alert('Error saving assignment')
      console.error(error)
    }
  }

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment)
    setFormData({
      title: assignment.title,
      courseId: assignment.courseId,
      dueDate: assignment.dueDate,
      totalMarks: assignment.totalMarks,
      description: assignment.description
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return

    try {
      const res = await fetch(`/api/lms/assignments/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
        alert('Assignment deleted successfully!')
      }
    } catch (error) {
      alert('Error deleting assignment')
      console.error(error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      courseId: '',
      dueDate: '',
      totalMarks: '',
      description: ''
    })
    setEditingAssignment(null)
  }

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch =
      assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCourse = filterCourse === 'all' || assignment.courseId === filterCourse

    return matchesSearch && matchesCourse
  })

  const isOverdue = (dueDate) => new Date(dueDate) < new Date()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-1">Manage course assignments</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Assignment</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-primary-600">{assignments.length}</div>
          <div className="text-sm text-gray-600">Total Assignments</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {assignments.filter(a => !isOverdue(a.dueDate)).length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600">
            {assignments.filter(a => isOverdue(a.dueDate)).length}
          </div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
          <div className="text-sm text-gray-600">Courses</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search assignments..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="input"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            <option value="all">All Courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>

          <button className="btn btn-secondary flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAssignments.map((assignment) => (
            <div key={assignment.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{assignment.course?.name}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(assignment)}
                    className="text-green-600 hover:text-green-700"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(assignment.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-4 line-clamp-2">{assignment.description}</p>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className={isOverdue(assignment.dueDate) ? 'text-red-600 font-medium' : 'text-gray-600'}>
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm font-semibold text-primary-600">
                  {assignment.totalMarks} marks
                </div>
              </div>

              {isOverdue(assignment.dueDate) && (
                <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-700">
                  This assignment is overdue
                </div>
              )}
            </div>
          ))}

          {filteredAssignments.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No assignments found</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">
              {editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course *
                  </label>
                  <select
                    required
                    className="input"
                    value={formData.courseId}
                    onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Marks *
                  </label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({...formData, totalMarks: e.target.value})}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    rows="4"
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
                  {editingAssignment ? 'Update' : 'Create'} Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
