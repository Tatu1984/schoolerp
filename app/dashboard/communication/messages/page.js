'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Send, Inbox, Mail, Trash2 } from 'lucide-react'

export default function MessagesPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('inbox')
  const [showCompose, setShowCompose] = useState(false)
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: ''
  })

  useEffect(() => {
    fetchMessages()
  }, [activeTab])

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/communication/messages?type=${activeTab}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/communication/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setShowCompose(false)
        setFormData({ to: '', subject: '', message: '' })
        fetchMessages()
        alert('Message sent successfully!')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      const res = await fetch(`/api/communication/messages/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchMessages()
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/communication/messages/${id}/read`, {
        method: 'PUT'
      })
      fetchMessages()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Internal messaging system</p>
      </div>

      {/* Tabs and Compose Button */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeTab === 'inbox'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Inbox</span>
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {messages.filter(m => !m.isRead).length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeTab === 'sent'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Sent</span>
          </button>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5" />
          <span>Compose Message</span>
        </button>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-gray-500 mt-2">No messages in {activeTab}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  !message.isRead && activeTab === 'inbox' ? 'bg-blue-50' : ''
                }`}
                onClick={() => activeTab === 'inbox' && !message.isRead && markAsRead(message.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`text-sm ${!message.isRead && activeTab === 'inbox' ? 'font-bold' : 'font-medium'} text-gray-900`}>
                        {activeTab === 'inbox' ? message.senderName : message.recipientName}
                      </h3>
                      {!message.isRead && activeTab === 'inbox' && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs">New</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">{message.subject}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(message.id)
                    }}
                    className="text-red-600 hover:text-red-900 ml-4"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Compose Message</h2>
            </div>

            <form onSubmit={handleSend} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Recipient name or email"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCompose(false)
                    setFormData({ to: '', subject: '', message: '' })
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
