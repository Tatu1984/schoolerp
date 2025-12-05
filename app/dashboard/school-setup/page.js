'use client'

import { useState, useEffect } from 'react'
import { Save, Building2 } from 'lucide-react'

export default function SchoolSetupPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [school, setSchool] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    phone: '',
    email: '',
    website: '',
    principalName: '',
    established: '',
  })

  useEffect(() => {
    fetchSchool()
  }, [])

  const fetchSchool = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/schools')
      if (res.ok) {
        const data = await res.json()
        if (data.length > 0) {
          setSchool(data[0])
          setFormData({
            name: data[0].name || '',
            code: data[0].code || '',
            address: data[0].address || '',
            city: data[0].city || '',
            state: data[0].state || '',
            country: data[0].country || 'India',
            pincode: data[0].pincode || '',
            phone: data[0].phone || '',
            email: data[0].email || '',
            website: data[0].website || '',
            principalName: data[0].principalName || '',
            established: data[0].established ? data[0].established.split('T')[0] : '',
          })
        }
      }
    } catch (error) {
      console.error('Error fetching school:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = school ? `/api/schools/${school.id}` : '/api/schools'
      const method = school ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        alert('School settings saved successfully!')
        fetchSchool()
      } else {
        const error = await res.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      alert('Error saving school settings')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">School Setup</h1>
          <p className="text-gray-600 mt-1">Configure your school information</p>
        </div>
        <Building2 className="w-8 h-8 text-primary-600" />
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">School Name *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">School Code *</label>
            <input
              type="text"
              className="input"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              disabled={!!school}
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Address</label>
            <textarea
              className="input"
              rows="3"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div>
            <label className="label">City</label>
            <input
              type="text"
              className="input"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          <div>
            <label className="label">State</label>
            <input
              type="text"
              className="input"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Country</label>
            <input
              type="text"
              className="input"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Pincode</label>
            <input
              type="text"
              className="input"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Phone</label>
            <input
              type="tel"
              className="input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Website</label>
            <input
              type="url"
              className="input"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Principal Name</label>
            <input
              type="text"
              className="input"
              value={formData.principalName}
              onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Established Date</label>
            <input
              type="date"
              className="input"
              value={formData.established}
              onChange={(e) => setFormData({ ...formData, established: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="btn btn-primary flex items-center space-x-2"
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
