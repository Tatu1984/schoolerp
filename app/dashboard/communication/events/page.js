'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Calendar, Edit, Trash2, MapPin } from 'lucide-react'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    venue: '',
    targetAudience: 'ALL'
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/communication/events')
      if (res.ok) {
        const result = await res.json()
        setEvents(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const url = editingEvent
      ? `/api/communication/events/${editingEvent.id}`
      : '/api/communication/events'
    const method = editingEvent ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        fetchEvents()
        setShowModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving event:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const res = await fetch(`/api/communication/events/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchEvents()
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const handleEdit = (event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description || '',
      eventDate: event.eventDate?.split('T')[0] || '',
      eventTime: event.eventTime,
      venue: event.venue,
      targetAudience: event.targetAudience
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingEvent(null)
    setFormData({
      title: '',
      description: '',
      eventDate: '',
      eventTime: '',
      venue: '',
      targetAudience: 'ALL'
    })
  }

  const isUpcoming = (eventDate) => new Date(eventDate) >= new Date()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading events...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events Calendar</h1>
        <p className="text-gray-600">Manage school events and activities</p>
      </div>

      {/* Add Event Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900">{events.length}</div>
          <div className="text-sm text-gray-600">Total Events</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {events.filter(e => isUpcoming(e.eventDate)).length}
          </div>
          <div className="text-sm text-gray-600">Upcoming Events</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">
            {events.filter(e => new Date(e.eventDate).getMonth() === new Date().getMonth()).length}
          </div>
          <div className="text-sm text-gray-600">This Month</div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                {isUpcoming(event.eventDate) && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    Upcoming
                  </span>
                )}
              </div>
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(event.eventDate).toLocaleDateString()} at {event.eventTime}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {event.venue}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Audience:</span> {event.targetAudience}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleEdit(event)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(event.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <p className="text-gray-500 mt-2">No events scheduled.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.eventTime}
                    onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Audience *
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="ALL">All</option>
                    <option value="STUDENTS">Students</option>
                    <option value="PARENTS">Parents</option>
                    <option value="STAFF">Staff</option>
                    <option value="TEACHERS">Teachers</option>
                  </select>
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
                  {editingEvent ? 'Update Event' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
