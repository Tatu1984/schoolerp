'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, FileText, Calendar } from 'lucide-react'

export default function ExaminationsPage() {
  const [examinations, setExaminations] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingExam, setEditingExam] = useState(null)
  const [formData, setFormData] = useState({
    examName: '',
    courseId: '',
    date: '',
    duration: '',
    totalMarks: '',
    passingMarks: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [examsRes, coursesRes] = await Promise.all([
        fetch('/api/lms/examinations'),
        fetch('/api/lms/courses')
      ])

      if (examsRes.ok) {
        const result = await examsRes.json()
        setExaminations(result.data || [])
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
      const url = editingExam
        ? `/api/lms/examinations/${editingExam.id}`
        : '/api/lms/examinations'
      const method = editingExam ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        fetchData()
        setShowModal(false)
        resetForm()
        alert(`Examination ${editingExam ? 'updated' : 'created'} successfully!`)
      }
    } catch (error) {
      alert('Error saving examination')
      console.error(error)
    }
  }

  const handleEdit = (exam) => {
    setEditingExam(exam)
    setFormData({
      examName: exam.examName,
      courseId: exam.courseId,
      date: exam.date,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this examination?')) return

    try {
      const res = await fetch(`/api/lms/examinations/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
        alert('Examination deleted successfully!')
      }
    } catch (error) {
      alert('Error deleting examination')
      console.error(error)
    }
  }

  const resetForm = () => {
    setFormData({
      examName: '',
      courseId: '',
      date: '',
      duration: '',
      totalMarks: '',
      passingMarks: ''
    })
    setEditingExam(null)
  }

  const filteredExaminations = examinations.filter(exam =>
    exam.examName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.course?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Examinations</h1>
          <p className="text-gray-600 mt-1">Manage examinations and tests</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Examination</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-primary-600">{examinations.length}</div>
          <div className="text-sm text-gray-600">Total Examinations</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">
            {examinations.filter(e => new Date(e.date) > new Date()).length}
          </div>
          <div className="text-sm text-gray-600">Upcoming</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {examinations.filter(e => new Date(e.date) <= new Date()).length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">{courses.length}</div>
          <div className="text-sm text-gray-600">Courses</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search examinations..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Examinations List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Marks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passing Marks</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredExaminations.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{exam.examName}</td>
                  <td className="px-6 py-4 text-sm">{exam.course?.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{new Date(exam.date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{exam.duration} minutes</td>
                  <td className="px-6 py-4 text-sm font-semibold">{exam.totalMarks}</td>
                  <td className="px-6 py-4 text-sm">{exam.passingMarks}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(exam)}
                      className="text-green-600 hover:text-green-700"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(exam.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredExaminations.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No examinations found</p>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">
              {editingExam ? 'Edit Examination' : 'Create Examination'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.examName}
                    onChange={(e) => setFormData({...formData, examName: e.target.value})}
                  />
                </div>

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
                    Passing Marks *
                  </label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.passingMarks}
                    onChange={(e) => setFormData({...formData, passingMarks: e.target.value})}
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
                  {editingExam ? 'Update' : 'Create'} Examination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
