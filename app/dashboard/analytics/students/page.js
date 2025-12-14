'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Users, Award, AlertCircle } from 'lucide-react'

export default function StudentAnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    averageAttendance: 0,
    topPerformers: [],
    lowPerformers: [],
    classWisePerformance: [],
    behaviorMetrics: {}
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics/students')
      if (res.ok) {
        const result = await res.json()
        setAnalytics(result.data || {
          totalStudents: 0,
          averageAttendance: 0,
          topPerformers: [],
          lowPerformers: [],
          classWisePerformance: [],
          behaviorMetrics: {}
        })
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
        <h1 className="text-2xl font-bold text-gray-900">Student Performance Analytics</h1>
        <p className="text-gray-600">Comprehensive analysis of student academic performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{analytics.totalStudents}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <Users className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{analytics.averageAttendance}%</div>
              <div className="text-sm text-gray-600">Avg Attendance</div>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{analytics.topPerformers?.length || 0}</div>
              <div className="text-sm text-gray-600">Top Performers</div>
            </div>
            <Award className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{analytics.lowPerformers?.length || 0}</div>
              <div className="text-sm text-gray-600">Need Attention</div>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Top Performers</h2>
          <div className="space-y-3">
            {(analytics.topPerformers || []).slice(0, 5).map((student, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    <div className="text-xs text-gray-500">{student.className}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-600">{student.percentage}%</div>
                  <div className="text-xs text-gray-500">Grade: {student.grade}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Students Needing Attention */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Students Needing Attention</h2>
          <div className="space-y-3">
            {(analytics.lowPerformers || []).slice(0, 5).map((student, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">{student.name}</div>
                  <div className="text-xs text-gray-500">{student.className}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-red-600">{student.percentage}%</div>
                  <div className="text-xs text-gray-500">Attendance: {student.attendance}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Class-wise Performance */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Class-wise Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg Percentage</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg Attendance</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pass Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(analytics.classWisePerformance || []).map((classData, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{classData.className}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{classData.studentCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{classData.avgPercentage}%</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{classData.avgAttendance}%</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{classData.passRate}%</td>
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
