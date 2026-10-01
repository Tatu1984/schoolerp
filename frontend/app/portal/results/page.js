'use client'

import { usePortal, formatDate, formatDateTime } from '@/components/portal/PortalContext'

export default function PortalResults() {
  const { data } = usePortal()
  const { exams, examResults, reportCards } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Exams & Results</h1>
        <p className="text-gray-600 mt-1">Upcoming exams, marks and published report cards.</p>
      </div>

      <section className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming exams</h2>
        {exams.length === 0 ? (
          <p className="text-gray-500">No upcoming exams</p>
        ) : (
          <div className="divide-y divide-gray-200">
            {exams.map((e) => (
              <div key={e.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{e.title}</p>
                  <p className="text-sm text-gray-600">{e.course?.name} · Max score {e.maxScore}{e.duration ? ` · ${e.duration} min` : ''}</p>
                </div>
                <p className="text-sm font-medium text-indigo-600">{formatDateTime(e.examDate)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Exam results</h2>
        {examResults.length === 0 ? (
          <p className="text-gray-500">No results published yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Exam', 'Course', 'Date', 'Score', '%', 'Remarks'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {examResults.map((r) => {
                  const pct = r.exam.maxScore ? Math.round((r.score / r.exam.maxScore) * 100) : null
                  return (
                    <tr key={r.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.exam.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{r.exam.course?.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(r.exam.examDate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{r.score} / {r.exam.maxScore}</td>
                      <td className="px-4 py-3">
                        {pct !== null && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${pct >= 75 ? 'bg-green-100 text-green-800' : pct >= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{pct}%</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{r.remarks || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Report cards</h2>
        {reportCards.length === 0 ? (
          <p className="text-gray-500">No report cards published yet</p>
        ) : (
          <div className="space-y-4">
            {reportCards.map((rc) => {
              const grades = rc.grades && typeof rc.grades === 'object' ? rc.grades : {}
              const rows = Array.isArray(grades) ? grades.map((g, i) => [g.subject || `Subject ${i + 1}`, g.grade ?? g.score ?? '-']) : Object.entries(grades)
              return (
                <div key={rc.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{rc.term}</p>
                      <p className="text-sm text-gray-500">{rc.academicYear?.name} · Published {formatDate(rc.publishedAt)}</p>
                    </div>
                    {rc.overallScore !== null && rc.overallScore !== undefined && (
                      <p className="text-2xl font-bold text-indigo-600">{rc.overallScore}%</p>
                    )}
                  </div>
                  {rows.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                      {rows.map(([subject, grade]) => (
                        <div key={subject} className="bg-gray-50 rounded p-2">
                          <p className="text-xs text-gray-500">{subject}</p>
                          <p className="font-medium text-gray-900">{typeof grade === 'object' ? JSON.stringify(grade) : String(grade)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {rc.remarks && <p className="text-sm text-gray-700 mt-3">{rc.remarks}</p>}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
