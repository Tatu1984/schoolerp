'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Edit, KeyRound } from 'lucide-react'

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-')

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase">{label}</p>
      <p className="text-gray-900">{value || '-'}</p>
    </div>
  )
}

export default function StudentDetailPage() {
  const { id } = useParams()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [logins, setLogins] = useState(null)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    fetch(`/api/students/${id}`)
      .then(async (res) => {
        const result = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(result.error || 'Could not load the student')
        setStudent(result.data)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const resetLogin = async () => {
    if (!confirm('Give this student and their guardians new temporary passwords? Their current passwords stop working immediately.')) return
    setResetting(true)
    try {
      const res = await fetch(`/api/students/${id}/reset-login`, { method: 'POST' })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(`Error: ${result.error || 'Could not reset the logins'}`)
        return
      }
      setLogins(result.data.logins)
    } finally {
      setResetting(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>
  if (error) return <div className="card text-center text-red-600">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link href="/dashboard/students" className="text-sm text-primary-600 hover:underline inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" /> All students
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{student.firstName} {student.lastName}</h1>
          <p className="text-gray-600">
            {student.class?.name}{student.section ? ` - ${student.section.name}` : ''} · Adm. No. {student.admissionNumber}
          </p>
        </div>
        <div className="flex space-x-3">
          <button onClick={resetLogin} disabled={resetting} className="btn btn-secondary flex items-center space-x-2 disabled:opacity-50">
            <KeyRound className="w-4 h-4" />
            <span>{resetting ? 'Resetting...' : 'Reset portal logins'}</span>
          </button>
          <Link href={`/dashboard/students/${id}/edit`} className="btn btn-primary flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </Link>
        </div>
      </div>

      {logins && (
        <div className="card border border-yellow-300 bg-yellow-50">
          <h2 className="font-bold text-gray-900">New temporary passwords</h2>
          <p className="text-sm text-gray-700 mb-3">
            Note these down now; they are not shown again. Each person must choose their own password at first sign-in.
          </p>
          {logins.length === 0 ? (
            <p className="text-sm text-gray-700">No portal logins exist for this student. Add a guardian with a phone number first.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-1 pr-4">Who</th>
                  <th className="py-1 pr-4">Email</th>
                  <th className="py-1">Temporary password</th>
                </tr>
              </thead>
              <tbody>
                {logins.map((l) => (
                  <tr key={l.email}>
                    <td className="py-1 pr-4">{l.who}</td>
                    <td className="py-1 pr-4 font-mono">{l.email}</td>
                    <td className="py-1 font-mono">{l.temporaryPassword}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Student details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Roll number" value={student.rollNumber} />
          <Field label="Date of birth" value={formatDate(student.dateOfBirth)} />
          <Field label="Gender" value={student.gender} />
          <Field label="Blood group" value={student.bloodGroup?.replace('_', ' ')} />
          <Field label="Phone" value={student.phone} />
          <Field label="Email" value={student.email} />
          <Field label="Admission date" value={formatDate(student.admissionDate)} />
          <Field label="Status" value={student.isActive ? 'Active' : 'Inactive'} />
          <Field label="Address" value={[student.address, student.city, student.state, student.pincode].filter(Boolean).join(', ')} />
          <Field label="Nationality" value={student.nationality} />
          <Field label="Previous school" value={student.previousSchool} />
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Guardians</h2>
        {!student.guardians?.length ? (
          <p className="text-gray-500">No guardians recorded</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {student.guardians.map((g) => (
              <div key={g.id} className="border border-gray-200 rounded-lg p-4">
                <p className="font-medium text-gray-900">{g.firstName} {g.lastName} <span className="text-sm text-gray-500">({g.relation})</span></p>
                <p className="text-sm text-gray-600">{g.phone}{g.email ? ` · ${g.email}` : ''}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
