'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

const BLOOD_GROUPS = ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE']
const FIELDS = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender', 'bloodGroup', 'nationality', 'religion', 'address', 'classId', 'sectionId', 'rollNumber', 'previousSchool', 'isActive']

export default function EditStudentPage() {
  const { id } = useParams()
  const router = useRouter()
  const [form, setForm] = useState(null)
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([fetch(`/api/students/${id}`), fetch('/api/classes')])
      .then(async ([studentRes, classesRes]) => {
        const student = await studentRes.json().catch(() => ({}))
        if (!studentRes.ok) throw new Error(student.error || 'Could not load the student')
        const s = student.data
        setForm({
          ...Object.fromEntries(FIELDS.map((f) => [f, s[f] ?? ''])),
          dateOfBirth: s.dateOfBirth ? s.dateOfBirth.slice(0, 10) : '',
          isActive: s.isActive,
        })
        if (classesRes.ok) setClasses((await classesRes.json()).data || [])
      })
      .catch((e) => setError(e.message))
  }, [id])

  useEffect(() => {
    if (!form?.classId) return
    fetch(`/api/sections?classId=${form.classId}`)
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((result) => setSections(result.data || []))
      .catch(() => setSections([]))
  }, [form?.classId])

  const set = (name) => (e) => setForm({ ...form, [name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      // Blank optional fields are sent as null so they are cleared rather than rejected
      const body = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === '' ? null : v]))
      const res = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) {
        const details = result.details ? ' ' + Object.entries(result.details).map(([k, v]) => `${k}: ${[].concat(v).join(', ')}`).join('; ') : ''
        setError((result.error || 'Could not save') + details)
        return
      }
      router.push(`/dashboard/students/${id}`)
    } catch (err) {
      setError('Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (error && !form) return <div className="card text-center text-red-600">{error}</div>
  if (!form) return <div className="text-center py-20 text-gray-500">Loading...</div>

  const input = (name, label, props = {}) => (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} className="input" value={form[name] ?? ''} onChange={set(name)} {...props} />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/dashboard/students/${id}`} className="text-sm text-primary-600 hover:underline inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to student
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Edit student</h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {input('firstName', 'First name *', { required: true })}
          {input('lastName', 'Last name *', { required: true })}
          {input('dateOfBirth', 'Date of birth *', { type: 'date', required: true })}
          <div>
            <label className="label" htmlFor="gender">Gender *</label>
            <select id="gender" className="input" value={form.gender} onChange={set('gender')} required>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="bloodGroup">Blood group</label>
            <select id="bloodGroup" className="input" value={form.bloodGroup ?? ''} onChange={set('bloodGroup')}>
              <option value="">Not recorded</option>
              {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b.replace('_', ' ')}</option>)}
            </select>
          </div>
          {input('rollNumber', 'Roll number')}
          <div>
            <label className="label" htmlFor="classId">Class *</label>
            <select id="classId" className="input" value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value, sectionId: '' })} required>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="sectionId">Section</label>
            <select id="sectionId" className="input" value={form.sectionId ?? ''} onChange={set('sectionId')}>
              <option value="">No section</option>
              {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          {input('phone', 'Phone')}
          {input('email', 'Email', { type: 'email' })}
          {input('nationality', 'Nationality')}
          {input('religion', 'Religion')}
          {input('previousSchool', 'Previous school')}
          <div className="md:col-span-2">{input('address', 'Address')}</div>
        </div>

        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={!!form.isActive} onChange={set('isActive')} />
          <span className="text-sm text-gray-700">Active student</span>
        </label>

        <div className="flex justify-end space-x-3">
          <Link href={`/dashboard/students/${id}`} className="btn btn-secondary">Cancel</Link>
          <button type="submit" disabled={saving} className="btn btn-primary disabled:opacity-50">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
