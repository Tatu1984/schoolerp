'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Calendar, Edit, Trash2, Users } from 'lucide-react'

export default function EntranceTestsPage() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTest, setEditingTest] = useState(null)
  const [formData, setFormData] = useState({
    schoolId: '',
    testName: '',
    testDate: '',
    testTime: '',
    duration: '60',
    venue: '',
    maxSeats: '50',
    classLevel: '',
    syllabus: '',
    instructions: ''
  })

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/admissions/tests')
      if (res.ok) {
        const result = await res.json()
        setTests(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const url = editingTest
      ? `/api/admissions/tests/${editingTest.id}`
      : '/api/admissions/tests'
    const method = editingTest ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          duration: parseInt(formData.duration),
          maxSeats: parseInt(formData.maxSeats)
        })
      })

      if (res.ok) {
        fetchTests()
        setShowModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving test:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this test?')) return

    try {
      const res = await fetch(`/api/admissions/tests/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchTests()
      }
    } catch (error) {
      console.error('Error deleting test:', error)
    }
  }

  const handleEdit = (test) => {
    setEditingTest(test)
    setFormData({
      schoolId: test.schoolId,
      testName: test.testName,
      testDate: test.testDate.split('T')[0],
      testTime: test.testTime,
      duration: test.duration.toString(),
      venue: test.venue,
      maxSeats: test.maxSeats.toString(),
      classLevel: test.classLevel,
      syllabus: test.syllabus || '',
      instructions: test.instructions || ''
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingTest(null)
    setFormData({
      schoolId: '',
      testName: '',
      testDate: '',
      testTime: '',
      duration: '60',
      venue: '',
      maxSeats: '50',
      classLevel: '',
      syllabus: '',
      instructions: ''
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading entrance tests...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Entrance Tests</h1>
        <p className="text-gray-600">Schedule and manage entrance examinations</p>
      </div>

      {/* Actions */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5" />
          <span>Schedule Test</span>
        </button>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <div key={test.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{test.testName}</h3>
              <p className="text-sm text-gray-600">Class: {test.classLevel}</p>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(test.testDate).toLocaleDateString()} at {test.testTime}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                Max Seats: {test.maxSeats}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Duration:</span> {test.duration} minutes
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Venue:</span> {test.venue}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleEdit(test)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(test.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {tests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No entrance tests scheduled. Schedule your first test to get started.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTest ? 'Edit Test' : 'Schedule New Test'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.testName}
                    onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.testDate}
                    onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.testTime}
                    onChange={(e) => setFormData({ ...formData, testTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Seats *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxSeats}
                    onChange={(e) => setFormData({ ...formData, maxSeats: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Level *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.classLevel}
                    onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Syllabus
                  </label>
                  <textarea
                    value={formData.syllabus}
                    onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingTest ? 'Update Test' : 'Schedule Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
