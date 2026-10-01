'use client'

import { useState } from 'react'
import { usePortal, formatDate } from '@/components/portal/PortalContext'

export default function PortalAssignments() {
  const { data, refresh } = usePortal()
  const isStudent = data.role === 'STUDENT'
  const [openId, setOpenId] = useState(null)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const startSubmit = (a) => {
    setOpenId(a.id)
    setContent(a.submission?.content || '')
  }

  const submit = async (assignmentId) => {
    setSaving(true)
    try {
      const res = await fetch('/api/portal/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId, content }),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(`Error: ${result.error || 'Could not submit'}`)
        return
      }
      setOpenId(null)
      setContent('')
      refresh()
    } catch (e) {
      alert('Error submitting assignment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-600 mt-1">
          {isStudent ? 'Submit your work before the due date.' : 'Track assigned work, submissions and grades.'}
        </p>
      </div>

      {data.assignments.length === 0 ? (
        <div className="card text-center text-gray-500">No assignments yet</div>
      ) : (
        data.assignments.map((a) => {
          const sub = a.submission
          const graded = sub?.gradedAt || (sub && sub.score !== null && sub.score !== undefined)
          const overdue = !sub && new Date(a.dueDate) < new Date()
          return (
            <div key={a.id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{a.title}</h3>
                  <p className="text-sm text-gray-600">{a.course?.name} · Max score {a.maxScore}</p>
                  {a.description && <p className="text-sm text-gray-700 mt-2">{a.description}</p>}
                  <p className={`text-sm mt-2 ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
                    Due {formatDate(a.dueDate)}{overdue ? ' · overdue' : ''}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {graded ? (
                    <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">Graded {sub.score}/{a.maxScore}</span>
                  ) : sub ? (
                    <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">Submitted</span>
                  ) : (
                    <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>
                  )}
                  {isStudent && !graded && openId !== a.id && (
                    <button onClick={() => startSubmit(a)} className="btn btn-primary text-sm">{sub ? 'Edit answer' : 'Submit'}</button>
                  )}
                </div>
              </div>

              {sub && openId !== a.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-sm">
                  <p className="text-gray-500">Submitted on {formatDate(sub.submittedAt)}</p>
                  {sub.content && <p className="text-gray-700 mt-1 whitespace-pre-wrap">{sub.content}</p>}
                  {sub.feedback && <p className="mt-2 text-gray-900"><span className="font-medium">Teacher feedback:</span> {sub.feedback}</p>}
                </div>
              )}

              {openId === a.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="label" htmlFor={`answer-${a.id}`}>Your answer</label>
                  <textarea
                    id={`answer-${a.id}`}
                    rows={5}
                    className="input"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type your answer, or paste a link to your work"
                  />
                  <div className="flex justify-end space-x-3 mt-3">
                    <button onClick={() => setOpenId(null)} className="btn btn-secondary text-sm">Cancel</button>
                    <button onClick={() => submit(a.id)} disabled={saving || !content.trim()} className="btn btn-primary text-sm disabled:opacity-50">
                      {saving ? 'Submitting...' : 'Submit answer'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
