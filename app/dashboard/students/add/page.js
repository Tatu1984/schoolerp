'use client'

import { useState, useEffect } from 'react'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AddStudentPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [formData, setFormData] = useState({
    admissionNumber: '',
    rollNumber: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    bloodGroup: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    nationality: 'Indian',
    religion: '',
    caste: '',
    motherTongue: '',
    previousSchool: '',
    classId: '',
    sectionId: '',
    admissionDate: new Date().toISOString().split('T')[0],
    schoolId: 'temp-school-id',
  })

  const [guardian, setGuardian] = useState({
    relation: 'Father',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    occupation: '',
    address: '',
    isPrimary: true,
  })

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (formData.classId) {
      fetchSections(formData.classId)
    }
  }, [formData.classId])

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes')
      if (res.ok) {
        const data = await res.json()
        setClasses(data)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }

  const fetchSections = async (classId) => {
    try {
      const res = await fetch(`/api/sections?classId=${classId}`)
      if (res.ok) {
        const data = await res.json()
        setSections(data)
      }
    } catch (error) {
      console.error('Error fetching sections:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const studentData = {
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth),
        admissionDate: new Date(formData.admissionDate),
        guardians: [guardian],
      }

      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      })

      if (res.ok) {
        alert('Student added successfully!')
        router.push('/dashboard/students')
      } else {
        const error = await res.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      alert('Error adding student')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/students" className="text-primary-600 hover:text-primary-700 flex items-center space-x-2 mb-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Students</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Student</h1>
          <p className="text-gray-600 mt-1">Fill in student details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Admission Number *</label>
              <input
                type="text"
                className="input"
                value={formData.admissionNumber}
                onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Roll Number</label>
              <input
                type="text"
                className="input"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Admission Date *</label>
              <input
                type="date"
                className="input"
                value={formData.admissionDate}
                onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                required
              />
            </div>

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
              <label className="label">Blood Group</label>
              <select
                className="input"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              >
                <option value="">Select Blood Group</option>
                <option value="A_POSITIVE">A+</option>
                <option value="A_NEGATIVE">A-</option>
                <option value="B_POSITIVE">B+</option>
                <option value="B_NEGATIVE">B-</option>
                <option value="O_POSITIVE">O+</option>
                <option value="O_NEGATIVE">O-</option>
                <option value="AB_POSITIVE">AB+</option>
                <option value="AB_NEGATIVE">AB-</option>
              </select>
            </div>

            <div>
              <label className="label">Nationality</label>
              <input
                type="text"
                className="input"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="md:col-span-2">
              <label className="label">Address</label>
              <textarea
                className="input"
                rows="2"
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
              <label className="label">Pincode</label>
              <input
                type="text"
                className="input"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Academic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Class *</label>
              <select
                className="input"
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value, sectionId: '' })}
                required
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Section</label>
              <select
                className="input"
                value={formData.sectionId}
                onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                disabled={!formData.classId}
              >
                <option value="">Select Section</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>{section.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Previous School</label>
              <input
                type="text"
                className="input"
                value={formData.previousSchool}
                onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Guardian Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Guardian Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Relation *</label>
              <select
                className="input"
                value={guardian.relation}
                onChange={(e) => setGuardian({ ...guardian, relation: e.target.value })}
                required
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Guardian</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="label">First Name *</label>
              <input
                type="text"
                className="input"
                value={guardian.firstName}
                onChange={(e) => setGuardian({ ...guardian, firstName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Last Name *</label>
              <input
                type="text"
                className="input"
                value={guardian.lastName}
                onChange={(e) => setGuardian({ ...guardian, lastName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Phone *</label>
              <input
                type="tel"
                className="input"
                value={guardian.phone}
                onChange={(e) => setGuardian({ ...guardian, phone: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={guardian.email}
                onChange={(e) => setGuardian({ ...guardian, email: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Occupation</label>
              <input
                type="text"
                className="input"
                value={guardian.occupation}
                onChange={(e) => setGuardian({ ...guardian, occupation: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center space-x-4">
          <button
            type="submit"
            className="btn btn-primary flex items-center space-x-2"
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Add Student'}</span>
          </button>
          <Link href="/dashboard/students" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
