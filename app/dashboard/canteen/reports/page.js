'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Download, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react'

export default function CanteenReportsPage() {
  const [reports, setReports] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    popularItems: [],
    dailySales: [],
    monthlySales: 0
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('today')

  useEffect(() => {
    fetchReports()
  }, [dateRange])

  const fetchReports = async () => {
    try {
      const res = await fetch(`/api/canteen/reports?range=${dateRange}`)
      if (res.ok) {
        const result = await res.json()
        setReports(result.data || {
          totalRevenue: 0,
          totalOrders: 0,
          popularItems: [],
          dailySales: [],
          monthlySales: 0
        })
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading reports...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Canteen Reports</h1>
        <p className="text-gray-600">Sales analytics and performance metrics</p>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">₹{reports.totalRevenue}</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{reports.totalOrders}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                ₹{reports.totalOrders > 0 ? (reports.totalRevenue / reports.totalOrders).toFixed(2) : 0}
              </div>
              <div className="text-sm text-gray-600">Avg Order Value</div>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">₹{reports.monthlySales}</div>
              <div className="text-sm text-gray-600">Monthly Sales</div>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Popular Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Top Selling Items</h2>
            <button className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {reports.popularItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.quantity} sold</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-green-600">₹{item.revenue}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Sales Chart Placeholder */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Daily Sales Trend</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chart visualization coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>
    </div>
  )
}
