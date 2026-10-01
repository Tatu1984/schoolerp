'use client'

import { useState, useEffect } from 'react'
import { CalendarCheck, Save } from 'lucide-react'

const STATUSES = [
  { value: 'PRESENT', label: 'Present', active: 'bg-green-600 text-white' },
  { value: 'ABSENT', label: 'Absent', active: 'bg-red-600 text-white' },
  { value: 'LATE', label: 'Late', active: 'bg-yellow-500 text-white' },
  { value: 'LEAVE', label: 'Leave', active: 'bg-blue-600 text-white' },
]

export default function StudentAttendancePage() {
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [classId, setClassId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/classes')
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((result) => setClasses(result.data || []))
      .catch(() => setClasses([]))
  }, [])

  useEffect(() => {
    setSectionId('')
    if (!classId) {
      setSections([])
      return
    }
    fetch(`/api/sections?classId=${classId}`)
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((result) => setSections(result.data || []))
      .catch(() => setSections([]))
  }, [classId])

  useEffect(() => {
    if (!classId) {
      setStudents([])
      return
    }
    setLoading(true)
    const params = new URLSearchParams({ classId, date })
    if (sectionId) params.set('sectionId', sectionId)
    fetch(`/api/students/attendance?${params}`)
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((result) => setStudents(result.data || []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false))
  }, [classId, sectionId, date])

  const setStatus = (id, status) =>
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)))

  const markAll = (status) => setStudents((prev) => prev.map((s) => ({ ...s, status })))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/students/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          records: students.filter((s) => s.status).map((s) => ({ studentId: s.id, status: s.status })),
        }),
      })
      const result = await res.json().catch(() => ({}))
      alert(res.ok ? `Attendance saved for ${result.data?.saved ?? 0} students` : `Error: ${result.error || 'Could not save'}`)
    } catch (error) {
      alert('Error saving attendance')
    } finally {
      setSaving(false)
    }
  }

  const marked = students.filter((s) => s.status).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Attendance</h1>
          <p className="text-gray-600 mt-1">Mark daily attendance class-wise. Parents and students see it in their portal.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || marked === 0}
          className="btn btn-primary flex items-center space-x-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
        </button>
      </div>

      <div className="card grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select className="input" value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
          <select className="input" value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId}>
            <option value="">All sections</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input type="date" className="input" value={date} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="card">
        {!classId ? (
          <div className="text-center py-12 text-gray-500">
            <CalendarCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            Select a class to mark attendance
          </div>
        ) : loading ? (
          <div className="text-center py-12 text-gray-500">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No active students in this class</div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">{marked} of {students.length} marked</p>
              <div className="space-x-2">
                <button onClick={() => markAll('PRESENT')} className="btn btn-secondary text-sm">Mark all present</button>
                <button onClick={() => markAll('ABSENT')} className="btn btn-secondary text-sm">Mark all absent</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.rollNumber || '-'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.firstName} {s.lastName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.admissionNumber}</td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          {STATUSES.map((st) => (
                            <button
                              key={st.value}
                              onClick={() => setStatus(s.id, st.value)}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${s.status === st.value ? st.active : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
