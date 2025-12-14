'use client'

import { useState, useEffect } from 'react'
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function StaffAttendancePage() {
  const [staff, setStaff] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchData()
  }, [selectedDate])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [staffRes, attendanceRes] = await Promise.all([
        fetch('/api/staff'),
        fetch(`/api/staff/attendance?date=${selectedDate}`)
      ])

      const [staffResult, attendanceResult] = await Promise.all([
        staffRes.json(),
        attendanceRes.json()
      ])

      setStaff(staffResult.data || [])
      setAttendance(attendanceResult.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAttendance = async (staffId, status) => {
    try {
      const res = await fetch('/api/staff/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId,
          date: selectedDate,
          status,
          checkIn: status === 'PRESENT' ? new Date() : null
        })
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error marking attendance:', error)
    }
  }

  const getAttendanceStatus = (staffId) => {
    return attendance.find(a => a.staffId === staffId)
  }

  const stats = {
    total: staff.length,
    present: attendance.filter(a => a.status === 'PRESENT').length,
    absent: attendance.filter(a => a.status === 'ABSENT').length,
    leave: attendance.filter(a => a.status === 'LEAVE').length
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Attendance</h1>
          <p className="text-gray-600">Track daily staff attendance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-600" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Present</p>
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">On Leave</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.leave}</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Loading attendance...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staff.map(member => {
                const attendanceRecord = getAttendanceStatus(member.id)
                return (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.employeeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{member.designation}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.department || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendanceRecord?.checkIn
                        ? new Date(attendanceRecord.checkIn).toLocaleTimeString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attendanceRecord ? (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          attendanceRecord.status === 'PRESENT'
                            ? 'bg-green-100 text-green-800'
                            : attendanceRecord.status === 'ABSENT'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {attendanceRecord.status}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          Not Marked
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {!attendanceRecord && (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => markAttendance(member.id, 'PRESENT')}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            Present
                          </button>
                          <button
                            onClick={() => markAttendance(member.id, 'ABSENT')}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => markAttendance(member.id, 'LEAVE')}
                            className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                          >
                            Leave
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {staff.length === 0 && (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
              <p className="text-gray-600">Add staff members to track attendance</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
