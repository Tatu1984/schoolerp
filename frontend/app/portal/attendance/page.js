'use client'

import { usePortal, formatDate } from '@/components/portal/PortalContext'

const styles = {
  PRESENT: 'bg-green-100 text-green-800',
  ABSENT: 'bg-red-100 text-red-800',
  LATE: 'bg-yellow-100 text-yellow-800',
  LEAVE: 'bg-blue-100 text-blue-800',
}

export default function PortalAttendance() {
  const { data } = usePortal()
  const { records, summary } = data.attendance

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600 mt-1">Last 90 days</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Attendance</p>
          <p className="text-2xl font-bold text-gray-900">{summary.percentage === null ? '-' : `${summary.percentage}%`}</p>
        </div>
        {['PRESENT', 'ABSENT', 'LATE', 'LEAVE'].map((s) => (
          <div key={s} className="card">
            <p className="text-sm text-gray-600 capitalize">{s.toLowerCase()}</p>
            <p className="text-2xl font-bold text-gray-900">{summary[s]}</p>
          </div>
        ))}
      </div>

      <div className="card">
        {records.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No attendance has been marked yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map((r) => (
                  <tr key={r.date}>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatDate(r.date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(r.date).toLocaleDateString('en-IN', { weekday: 'long' })}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[r.status] || 'bg-gray-100 text-gray-800'}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
