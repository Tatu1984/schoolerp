'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, TrendingUp, AlertCircle } from 'lucide-react'

export default function AttendanceAnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    overallAttendance: 0,
    presentToday: 0,
    absentToday: 0,
    defaulters: [],
    classWiseAttendance: [],
    attendanceTrend: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics/attendance')
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Analytics</h1>
        <p className="text-gray-600">Attendance trends and patterns</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{analytics.overallAttendance}%</div>
              <div className="text-sm text-gray-600">Overall Attendance</div>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{analytics.presentToday}</div>
              <div className="text-sm text-gray-600">Present Today</div>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{analytics.absentToday}</div>
              <div className="text-sm text-gray-600">Absent Today</div>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">{analytics.defaulters?.length || 0}</div>
              <div className="text-sm text-gray-600">Defaulters (<75%)</div>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Defaulters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Attendance Defaulters</h2>
          <div className="space-y-3">
            {(analytics.defaulters || []).slice(0, 10).map((student, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">{student.name}</div>
                  <div className="text-xs text-gray-500">{student.className} - {student.admissionNumber}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-red-600">{student.attendancePercentage}%</div>
                  <div className="text-xs text-gray-500">{student.absentDays} days absent</div>
                </div>
              </div>
            ))}
          </div>
          {(analytics.defaulters || []).length === 0 && (
            <p className="text-center text-gray-500 py-8">No attendance defaulters</p>
          )}
        </div>

        {/* Class-wise Attendance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Class-wise Attendance</h2>
          <div className="space-y-3">
            {(analytics.classWiseAttendance || []).map((classData, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{classData.className}</span>
                  <span className={`text-sm font-bold ${classData.percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                    {classData.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${classData.percentage >= 75 ? 'bg-green-600' : 'bg-red-600'}`}
                    style={{ width: `${classData.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Weekly Attendance Trend</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Students</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Absent</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(analytics.attendanceTrend || []).map((day, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{day.day}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{day.total}</td>
                    <td className="px-4 py-3 text-sm text-green-600 font-medium">{day.present}</td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">{day.absent}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        day.percentage >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {day.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
