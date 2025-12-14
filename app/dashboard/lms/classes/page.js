'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Video, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function OnlineClassesPage() {
  const [classes, setClasses] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    courseId: '',
    scheduledTime: '',
    meetingLink: '',
    duration: '',
    status: 'SCHEDULED'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [classesRes, coursesRes] = await Promise.all([
        fetch('/api/lms/classes'),
        fetch('/api/lms/courses')
      ])

      if (classesRes.ok) {
        const result = await classesRes.json()
        setClasses(result.data || [])
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
      const url = editingClass
        ? `/api/lms/classes/${editingClass.id}`
        : '/api/lms/classes'
      const method = editingClass ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        fetchData()
        setShowModal(false)
        resetForm()
        alert(`Class ${editingClass ? 'updated' : 'scheduled'} successfully!`)
      }
    } catch (error) {
      alert('Error saving class')
      console.error(error)
    }
  }

  const handleEdit = (cls) => {
    setEditingClass(cls)
    setFormData({
      title: cls.title,
      courseId: cls.courseId,
      scheduledTime: cls.scheduledTime,
      meetingLink: cls.meetingLink,
      duration: cls.duration,
      status: cls.status
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this class?')) return

    try {
      const res = await fetch(`/api/lms/classes/${id}`, { method: 'DELETE' })
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
    setFormData({
      title: '',
      courseId: '',
      scheduledTime: '',
      meetingLink: '',
      duration: '',
      status: 'SCHEDULED'
    })
    setEditingClass(null)
  }

  const filteredClasses = classes.filter(cls => {
    const matchesSearch =
      cls.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.course?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || cls.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-700'
      case 'LIVE':
        return 'bg-green-100 text-green-700'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Online Classes</h1>
          <p className="text-gray-600 mt-1">Manage virtual class sessions</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Class</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-primary-600">{classes.length}</div>
          <div className="text-sm text-gray-600">Total Classes</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">
            {classes.filter(c => c.status === 'SCHEDULED').length}
          </div>
          <div className="text-sm text-gray-600">Scheduled</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {classes.filter(c => c.status === 'LIVE').length}
          </div>
          <div className="text-sm text-gray-600">Live Now</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-600">
            {classes.filter(c => c.status === 'COMPLETED').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search classes..."
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
            <option value="SCHEDULED">Scheduled</option>
            <option value="LIVE">Live</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Classes List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClasses.map((cls) => (
            <div key={cls.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{cls.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(cls.status)}`}>
                      {cls.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{cls.course?.name}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {new Date(cls.scheduledTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Video className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{cls.duration} minutes</span>
                    </div>
                    {cls.meetingLink && (
                      <a
                        href={cls.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 underline"
                      >
                        Join Meeting
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(cls)}
                    className="text-green-600 hover:text-green-700"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cls.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredClasses.length === 0 && (
            <div className="text-center py-12">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No classes found</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">
              {editingClass ? 'Edit Class' : 'Schedule Class'}
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
                    Scheduled Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="input"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
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
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="LIVE">Live</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Link *
                  </label>
                  <input
                    type="url"
                    required
                    className="input"
                    placeholder="https://meet.google.com/..."
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({...formData, meetingLink: e.target.value})}
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
                  {editingClass ? 'Update' : 'Schedule'} Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
