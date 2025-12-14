'use client'

import { useState, useEffect } from 'react'
import { Users, GraduationCap, DollarSign, BookOpen, TrendingUp, TrendingDown } from 'lucide-react'

export default function AnalyticsOverviewPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalRevenue: 0,
    totalCourses: 0,
    studentGrowth: 0,
    revenueGrowth: 0,
    attendanceRate: 0,
    feeCollectionRate: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analytics/overview')
      const result = await res.json()
      setStats(result.data || {
        totalStudents: 0,
        totalStaff: 0,
        totalRevenue: 0,
        totalCourses: 0,
        studentGrowth: 0,
        revenueGrowth: 0,
        attendanceRate: 0,
        feeCollectionRate: 0
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Mock data for demonstration
      setStats({
        totalStudents: 1250,
        totalStaff: 85,
        totalRevenue: 125000,
        totalCourses: 42,
        studentGrowth: 12.5,
        revenueGrowth: 18.3,
        attendanceRate: 94.5,
        feeCollectionRate: 87.2
      })
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'blue',
      growth: stats.studentGrowth
    },
    {
      title: 'Total Staff',
      value: stats.totalStaff,
      icon: GraduationCap,
      color: 'green'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'yellow',
      growth: stats.revenueGrowth
    },
    {
      title: 'Active Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'purple'
    }
  ]

  const performanceMetrics = [
    {
      title: 'Attendance Rate',
      value: `${stats.attendanceRate}%`,
      target: 95,
      current: stats.attendanceRate
    },
    {
      title: 'Fee Collection Rate',
      value: `${stats.feeCollectionRate}%`,
      target: 100,
      current: stats.feeCollectionRate
    }
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
        <p className="text-gray-600">Comprehensive insights and performance metrics</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon
              const colorClasses = {
                blue: 'bg-blue-500',
                green: 'bg-green-500',
                yellow: 'bg-yellow-500',
                purple: 'bg-purple-500'
              }

              return (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {stat.growth !== undefined && (
                      <div className={`flex items-center text-sm ${
                        stat.growth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.growth >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(stat.growth)}%
                      </div>
                    )}
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{metric.title}</h3>
                  <span className="text-2xl font-bold text-blue-600">{metric.value}</span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        metric.current >= metric.target ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${metric.current}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                    <span>Current: {metric.current}%</span>
                    <span>Target: {metric.target}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center py-2 border-b border-gray-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">25 new student admissions this month</span>
                </div>
                <div className="flex items-center py-2 border-b border-gray-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">12 staff members joined</span>
                </div>
                <div className="flex items-center py-2 border-b border-gray-200">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">$15,000 in pending fees</span>
                </div>
                <div className="flex items-center py-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">8 new courses launched</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">94%</p>
                  <p className="text-sm text-gray-600 mt-1">Pass Rate</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">4.2</p>
                  <p className="text-sm text-gray-600 mt-1">Avg GPA</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-3xl font-bold text-yellow-600">18</p>
                  <p className="text-sm text-gray-600 mt-1">Avg Class Size</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">96%</p>
                  <p className="text-sm text-gray-600 mt-1">Parent Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
