'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Megaphone, Send } from 'lucide-react'

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([])
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)

  const priorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT']
  const targets = ['ALL', 'STUDENTS', 'PARENTS', 'STAFF', 'TEACHERS']

  const [formData, setFormData] = useState({
    schoolId: '',
    title: '',
    content: '',
    targetRole: 'ALL',
    priority: 'NORMAL'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [announcementsRes, schoolsRes] = await Promise.all([
        fetch('/api/communication/announcements'),
        fetch('/api/schools')
      ])

      const [announcementsResult, schoolsResult] = await Promise.all([
        announcementsRes.json(),
        schoolsRes.json()
      ])

      setAnnouncements(announcementsResult.data || [])
      setSchools(schoolsResult.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingAnnouncement ? `/api/communication/announcements/${editingAnnouncement.id}` : '/api/communication/announcements'
      const method = editingAnnouncement ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          publishedAt: new Date()
        })
      })

      if (res.ok) {
        fetchData()
        resetForm()
      }
    } catch (error) {
      console.error('Error saving announcement:', error)
    }
  }

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      schoolId: announcement.schoolId,
      title: announcement.title,
      content: announcement.content,
      targetRole: announcement.targetRole || 'ALL',
      priority: announcement.priority || 'NORMAL'
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    try {
      const res = await fetch(`/api/communication/announcements/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting announcement:', error)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingAnnouncement(null)
    setFormData({
      schoolId: '',
      title: '',
      content: '',
      targetRole: 'ALL',
      priority: 'NORMAL'
    })
  }

  const getPriorityColor = (priority) => {
    const colors = {
      'LOW': 'bg-gray-100 text-gray-800',
      'NORMAL': 'bg-blue-100 text-blue-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'URGENT': 'bg-red-100 text-red-800'
    }
    return colors[priority] || colors['NORMAL']
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600">Create and manage school announcements</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>New Announcement</span>
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.schoolId}
                    onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                  >
                    <option value="">Select School</option>
                    {schools.map(school => (
                      <option key={school.id} value={school.id}>{school.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                  </label>
                  <textarea
                    required
                    rows="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Audience
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.targetRole}
                      onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                    >
                      {targets.map(target => (
                        <option key={target} value={target}>{target}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      {priorities.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                  <span>{editingAnnouncement ? 'Update' : 'Publish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Loading announcements...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(announcement => (
            <div key={announcement.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start flex-1">
                  <Megaphone className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{announcement.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Target: {announcement.targetRole}</span>
                      <span>•</span>
                      <span>{announcement.publishedAt ? new Date(announcement.publishedAt).toLocaleString() : 'Draft'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {announcements.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Megaphone className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements yet</h3>
              <p className="text-gray-600 mb-4">Create your first announcement to inform everyone</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Announcement
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
