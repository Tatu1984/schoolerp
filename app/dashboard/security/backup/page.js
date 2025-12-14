'use client'

import { useState, useEffect } from 'react'
import { Download, Upload, Database, CheckCircle, Clock } from 'lucide-react'

export default function DataBackupPage() {
  const [backups, setBackups] = useState([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchBackups()
  }, [])

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/security/backups')
      if (res.ok) {
        const result = await res.json()
        setBackups(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching backups:', error)
    }
  }

  const createBackup = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/security/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'MANUAL' })
      })

      if (res.ok) {
        fetchBackups()
        alert('Backup created successfully!')
      }
    } catch (error) {
      console.error('Error creating backup:', error)
      alert('Error creating backup')
    } finally {
      setCreating(false)
    }
  }

  const restoreBackup = async (id) => {
    if (!confirm('Are you sure you want to restore this backup? This will overwrite current data.')) return

    try {
      const res = await fetch(`/api/security/backups/${id}/restore`, {
        method: 'POST'
      })

      if (res.ok) {
        alert('Backup restored successfully!')
      }
    } catch (error) {
      console.error('Error restoring backup:', error)
      alert('Error restoring backup')
    }
  }

  const downloadBackup = async (id) => {
    try {
      const res = await fetch(`/api/security/backups/${id}/download`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `backup-${id}.sql`
        a.click()
      }
    } catch (error) {
      console.error('Error downloading backup:', error)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Backup Management</h1>
        <p className="text-gray-600">Create, restore, and manage database backups</p>
      </div>

      {/* Actions */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={createBackup}
          disabled={creating}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <Database className="w-5 h-5" />
          <span>{creating ? 'Creating Backup...' : 'Create New Backup'}</span>
        </button>
      </div>

      {/* Backup Settings */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Automated Backup Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Daily Backups</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-gray-600">Scheduled at 2:00 AM</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Retention Period</span>
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600">30 days</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Storage Location</span>
              <Database className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xs text-gray-600">Cloud Storage</p>
          </div>
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Backup History</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Backup ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {backups.map((backup) => (
              <tr key={backup.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                  {backup.id.substring(0, 8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {backup.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {backup.size} MB
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(backup.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    backup.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {backup.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadBackup(backup.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => restoreBackup(backup.id)}
                      className="text-green-600 hover:text-green-900"
                      title="Restore"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {backups.length === 0 && (
          <div className="text-center py-12">
            <Database className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-gray-500 mt-2">No backups available.</p>
          </div>
        )}
      </div>
    </div>
  )
}
