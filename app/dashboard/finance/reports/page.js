'use client'

import { useState, useEffect } from 'react'
import { Download, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react'

export default function FinanceReportsPage() {
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('month')

  useEffect(() => {
    fetchReports()
  }, [dateRange])

  const fetchReports = async () => {
    try {
      const res = await fetch(`/api/finance/reports?range=${dateRange}`)
      if (res.ok) {
        const data = await res.json()
        setReports(data)
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
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive financial analytics and insights</p>
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
                  <div className="text-2xl font-bold text-green-600">
                    Rs. {reports?.totalRevenue?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
                <TrendingUp className="w-10 h-10 text-green-200" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    Rs. {reports?.totalExpenses?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Expenses</div>
                </div>
                <TrendingDown className="w-10 h-10 text-red-200" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    Rs. {((reports?.totalRevenue || 0) - (reports?.totalExpenses || 0)).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Net Profit</div>
                </div>
                <DollarSign className="w-10 h-10 text-blue-200" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    Rs. {reports?.pendingFees?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-600">Pending Fees</div>
                </div>
                <PieChart className="w-10 h-10 text-yellow-200" />
              </div>
            </div>
          </div>

          {/* Revenue vs Expenses Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Revenue vs Expenses Trend</h2>
            <div className="h-64 flex items-end justify-between space-x-2">
              {reports?.monthlyData?.map((month, index) => (
                <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                  <div className="w-full flex flex-col items-center space-y-1">
                    <div
                      className="w-full bg-green-500 rounded-t"
                      style={{
                        height: `${(month.revenue / Math.max(...reports.monthlyData.map(m => Math.max(m.revenue, m.expenses)))) * 120}px`,
                        minHeight: '4px'
                      }}
                    ></div>
                    <div
                      className="w-full bg-red-500 rounded-t"
                      style={{
                        height: `${(month.expenses / Math.max(...reports.monthlyData.map(m => Math.max(m.revenue, m.expenses)))) * 120}px`,
                        minHeight: '4px'
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600">{month.month}</div>
                  <div className="text-xs font-medium">
                    <div className="text-green-600">Rs.{month.revenue}</div>
                    <div className="text-red-600">Rs.{month.expenses}</div>
                  </div>
                </div>
              )) || <div className="w-full text-center py-8 text-gray-500">No data available</div>}
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Expenses</span>
              </div>
            </div>
          </div>

          {/* Category-wise Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Revenue Breakdown</h2>
              <div className="space-y-3">
                {reports?.revenueBreakdown?.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium">{item.category}</span>
                      <span className="text-gray-600">Rs. {item.amount.toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(item.amount / reports.totalRevenue) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )) || <div className="text-center py-8 text-gray-500">No data available</div>}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Expense Breakdown</h2>
              <div className="space-y-3">
                {reports?.expenseBreakdown?.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium">{item.category}</span>
                      <span className="text-gray-600">Rs. {item.amount.toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${(item.amount / reports.totalExpenses) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )) || <div className="text-center py-8 text-gray-500">No data available</div>}
              </div>
            </div>
          </div>

          {/* Fee Collection Rate */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Fee Collection Rate</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Collected</div>
                <div className="text-2xl font-bold text-green-600">
                  Rs. {reports?.feeCollected?.toLocaleString() || 0}
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Pending</div>
                <div className="text-2xl font-bold text-yellow-600">
                  Rs. {reports?.pendingFees?.toLocaleString() || 0}
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Collection Rate</div>
                <div className="text-2xl font-bold text-blue-600">
                  {reports?.collectionRate || 0}%
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
