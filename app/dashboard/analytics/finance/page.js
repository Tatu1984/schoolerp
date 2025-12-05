'use client'

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react'

export default function FinancialAnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    feeCollectionRate: 0,
    pendingFees: 0,
    monthlyRevenue: [],
    expenseBreakdown: []
  })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/analytics/finance?period=${period}`)
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
        <h1 className="text-2xl font-bold text-gray-900">Financial Analytics</h1>
        <p className="text-gray-600">Revenue, expenses, and financial insights</p>
      </div>

      {/* Period Selector */}
      <div className="mb-6">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">₹{analytics.totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">₹{analytics.totalExpenses.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Expenses</div>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">₹{analytics.netProfit.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Net Profit</div>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">{analytics.feeCollectionRate}%</div>
              <div className="text-sm text-gray-600">Fee Collection Rate</div>
            </div>
            <PieChart className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Revenue Trend</h2>
          <div className="space-y-3">
            {(analytics.monthlyRevenue || []).map((month, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">{month.month}</span>
                <span className="text-sm font-bold text-green-600">₹{month.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Expense Breakdown</h2>
          <div className="space-y-3">
            {(analytics.expenseBreakdown || []).map((expense, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">{expense.category}</span>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${expense.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-red-600 ml-4">₹{expense.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Fees Summary */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Fee Collection Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ₹{(analytics.totalRevenue - analytics.pendingFees).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Collected</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">₹{analytics.pendingFees.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analytics.feeCollectionRate}%</div>
              <div className="text-sm text-gray-600">Collection Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
