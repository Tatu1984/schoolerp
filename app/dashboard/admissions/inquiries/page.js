'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Phone, Mail, Calendar, Eye, Edit, CheckCircle } from 'lucide-react'

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState([])
  const [schools, setSchools] = useState([])
  const [academicYears, setAcademicYears] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    appliedClass: '',
    notes: '',
    schoolId: '',
    academicYearId: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [inquiriesRes, schoolsRes, yearsRes] = await Promise.all([
        fetch('/api/admissions?status=INQUIRY'),
        fetch('/api/schools'),
        fetch('/api/academic-years')
      ])

      if (inquiriesRes.ok) {
        const result = await inquiriesRes.json()
        setInquiries(result.data || [])
      }

      if (schoolsRes.ok) {
        const schoolsResult = await schoolsRes.json()
        const schoolsData = schoolsResult.data || []
        setSchools(schoolsData)
        if (schoolsData.length > 0 && !formData.schoolId) {
          setFormData(prev => ({ ...prev, schoolId: schoolsData[0].id }))
        }
      }

      if (yearsRes.ok) {
        const yearsResult = await yearsRes.json()
        const yearsData = yearsResult.data || []
        setAcademicYears(yearsData)
        const currentYear = yearsData.find(y => y.isCurrent)
        if (currentYear && !formData.academicYearId) {
          setFormData(prev => ({ ...prev, academicYearId: currentYear.id }))
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Error loading data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/admissions?status=INQUIRY')
      if (res.ok) {
        const result = await res.json()
        setInquiries(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Generate inquiry number
      const inquiryNumber = `INQ${Date.now()}`

      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          inquiryNumber,
          dateOfBirth: new Date(formData.dateOfBirth),
          status: 'INQUIRY',
        }),
      })

      if (res.ok) {
        fetchInquiries()
        setShowModal(false)
        resetForm()
        alert('Inquiry added successfully!')
      } else {
        const error = await res.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      alert('Error adding inquiry')
      console.error(error)
    }
  }

  const handleConvertToProspect = async (id) => {
    if (!confirm('Convert this inquiry to a prospect?')) return

    try {
      const res = await fetch(`/api/admissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PROSPECT' }),
      })

      if (res.ok) {
        fetchInquiries()
        alert('Converted to prospect successfully!')
      }
    } catch (error) {
      alert('Error converting to prospect')
      console.error(error)
    }
  }

  const resetForm = () => {
    const currentYear = academicYears.find(y => y.isCurrent)
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'MALE',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      address: '',
      appliedClass: '',
      notes: '',
      schoolId: schools[0]?.id || '',
      academicYearId: currentYear?.id || '',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admission Inquiries</h1>
          <p className="text-gray-600 mt-1">Manage admission inquiries and leads</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Inquiry</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-primary-600">{inquiries.length}</div>
          <div className="text-sm text-gray-600">Total Inquiries</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-orange-600">
            {inquiries.filter(i => {
              const today = new Date()
              const followUp = i.followUpDate ? new Date(i.followUpDate) : null
              return followUp && followUp <= today
            }).length}
          </div>
          <div className="text-sm text-gray-600">Follow-ups Due</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {inquiries.filter(i => {
              const weekAgo = new Date()
              weekAgo.setDate(weekAgo.getDate() - 7)
              return new Date(i.createdAt) >= weekAgo
            }).length}
          </div>
          <div className="text-sm text-gray-600">This Week</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">
            {inquiries.filter(i => {
              const monthAgo = new Date()
              monthAgo.setMonth(monthAgo.getMonth() - 1)
              return new Date(i.createdAt) >= monthAgo
            }).length}
          </div>
          <div className="text-sm text-gray-600">This Month</div>
        </div>
      </div>

      {/* Inquiry List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inquiry No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{inquiry.inquiryNumber}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {inquiry.firstName} {inquiry.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      DOB: {new Date(inquiry.dateOfBirth).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{inquiry.parentName}</div>
                    <div className="text-xs text-gray-500 flex items-center space-x-2">
                      <Phone className="w-3 h-3" />
                      <span>{inquiry.parentPhone}</span>
                    </div>
                    {inquiry.parentEmail && (
                      <div className="text-xs text-gray-500 flex items-center space-x-2">
                        <Mail className="w-3 h-3" />
                        <span>{inquiry.parentEmail}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">{inquiry.appliedClass}</td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleConvertToProspect(inquiry.id)}
                      className="text-green-600 hover:text-green-700"
                      title="Convert to Prospect"
                    >
                      <CheckCircle className="w-5 h-5 inline" />
                    </button>
                    <button
                      className="text-blue-600 hover:text-blue-700"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}

              {inquiries.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <p className="text-gray-500">No inquiries found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Inquiry</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">Last Name *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">Date of Birth *</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">Gender *</label>
                  <select
                    className="input"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    required
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="label">Parent/Guardian Name *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">Parent Phone *</label>
                  <input
                    type="tel"
                    className="input"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">Parent Email</label>
                  <input
                    type="email"
                    className="input"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Applied Class *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Class 1"
                    value={formData.appliedClass}
                    onChange={(e) => setFormData({ ...formData, appliedClass: e.target.value })}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">Address</label>
                  <textarea
                    className="input"
                    rows="2"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">Notes</label>
                  <textarea
                    className="input"
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button type="submit" className="btn btn-primary">
                  Add Inquiry
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
