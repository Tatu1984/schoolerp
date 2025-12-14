'use client'

import { useState, useEffect } from 'react'
import { Download, TrendingUp, BookOpen, Users, AlertTriangle, BarChart3 } from 'lucide-react'

export default function LibraryReportsPage() {
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('month')

  useEffect(() => {
    fetchReports()
  }, [dateRange])

  const fetchReports = async () => {
    try {
      const res = await fetch(`/api/library/reports?range=${dateRange}`)
      if (res.ok) {
        const result = await res.json()
        setReports(result.data || null)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Library Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive library analytics and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            className="input"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn btn-primary flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading reports...</div>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary-600">
                    {reports?.totalIssues || 0}
                  </div>
                  <div className="text-sm text-gray-600">Books Issued</div>
                </div>
                <BookOpen className="w-10 h-10 text-primary-200" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {reports?.totalReturns || 0}
                  </div>
                  <div className="text-sm text-gray-600">Books Returned</div>
                </div>
                <TrendingUp className="w-10 h-10 text-green-200" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {reports?.overdueCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">Overdue Books</div>
                </div>
                <AlertTriangle className="w-10 h-10 text-red-200" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {reports?.activeMembers || 0}
                  </div>
                  <div className="text-sm text-gray-600">Active Members</div>
                </div>
                <Users className="w-10 h-10 text-blue-200" />
              </div>
            </div>
          </div>

          {/* Most Issued Books */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Most Issued Books</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {reports?.mostIssuedBooks?.map((book, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{book.title}</div>
                    <div className="text-sm text-gray-600">{book.author}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary-600">{book.issueCount}</div>
                    <div className="text-xs text-gray-500">issues</div>
                  </div>
                  <div className="w-32">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{
                          width: `${(book.issueCount / reports.mostIssuedBooks[0].issueCount) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">No data available</div>
              )}
            </div>
          </div>

          {/* Category-wise Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Category-wise Issues</h2>
              <div className="space-y-3">
                {reports?.categoryDistribution?.map((category, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-gray-600">{category.count} books</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${(category.count / reports.totalIssues) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">No data available</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Top Readers</h2>
              <div className="space-y-3">
                {reports?.topReaders?.map((reader, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{reader.name}</div>
                        <div className="text-xs text-gray-500">{reader.class}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary-600">{reader.booksRead}</div>
                      <div className="text-xs text-gray-500">books</div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">No data available</div>
                )}
              </div>
            </div>
          </div>

          {/* Overdue Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Overdue Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">1-7 Days Overdue</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {reports?.overdueStats?.range1 || 0}
                </div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">8-14 Days Overdue</div>
                <div className="text-2xl font-bold text-orange-600">
                  {reports?.overdueStats?.range2 || 0}
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">15+ Days Overdue</div>
                <div className="text-2xl font-bold text-red-600">
                  {reports?.overdueStats?.range3 || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Monthly Issue Trend</h2>
            <div className="h-64 flex items-end justify-between space-x-2">
              {reports?.monthlyTrend?.map((month, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary-500 rounded-t"
                    style={{
                      height: `${(month.count / Math.max(...reports.monthlyTrend.map(m => m.count))) * 100}%`,
                      minHeight: '4px'
                    }}
                  ></div>
                  <div className="text-xs text-gray-600 mt-2">{month.month}</div>
                  <div className="text-xs font-medium text-gray-900">{month.count}</div>
                </div>
              )) || (
                <div className="w-full text-center py-8 text-gray-500">No data available</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
