'use client'

import { useState, useEffect } from 'react'
import { Search, Download, Package, AlertTriangle, TrendingDown } from 'lucide-react'

export default function StockPage() {
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState('all')

  useEffect(() => {
    fetchStock()
  }, [])

  const fetchStock = async () => {
    try {
      const res = await fetch('/api/inventory/stock')
      if (res.ok) {
        const result = await res.json()
        setStock(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching stock:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStockLevel = (item) => {
    if (item.quantity === 0) return 'OUT_OF_STOCK'
    if (item.quantity <= item.reorderLevel) return 'LOW'
    return 'ADEQUATE'
  }

  const filteredStock = stock.filter(item => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase())

    const stockLevel = getStockLevel(item)
    const matchesLevel = filterLevel === 'all' || stockLevel === filterLevel

    return matchesSearch && matchesLevel
  })

  const outOfStock = stock.filter(item => item.quantity === 0).length
  const lowStock = stock.filter(item => item.quantity > 0 && item.quantity <= item.reorderLevel).length
  const totalValue = stock.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

  const getLevelColor = (level) => {
    switch (level) {
      case 'OUT_OF_STOCK':
        return 'bg-red-100 text-red-700'
      case 'LOW':
        return 'bg-yellow-100 text-yellow-700'
      case 'ADEQUATE':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600 mt-1">Monitor inventory stock levels</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-primary-600">{stock.length}</div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600">{outOfStock}</div>
          <div className="text-sm text-gray-600">Out of Stock</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">{lowStock}</div>
          <div className="text-sm text-gray-600">Low Stock</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">Rs. {totalValue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
      </div>

      {/* Alerts */}
      {(outOfStock > 0 || lowStock > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-900">Stock Alerts</h3>
              <p className="text-sm text-yellow-700 mt-1">
                {outOfStock > 0 && `${outOfStock} items out of stock. `}
                {lowStock > 0 && `${lowStock} items running low. `}
                Please reorder soon.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search items..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="input"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="LOW">Low Stock</option>
            <option value="ADEQUATE">Adequate</option>
          </select>

          <button className="btn btn-secondary flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Stock Report</span>
          </button>
        </div>
      </div>

      {/* Stock List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStock.map((item) => {
                const level = getStockLevel(item)
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.sku}</td>
                    <td className="px-6 py-4 text-sm">{item.category}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${
                          item.quantity === 0 ? 'text-red-600' :
                          item.quantity <= item.reorderLevel ? 'text-yellow-600' :
                          'text-gray-900'
                        }`}>
                          {item.quantity}
                        </span>
                        {item.quantity <= item.reorderLevel && (
                          <TrendingDown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{item.reorderLevel}</td>
                    <td className="px-6 py-4 text-sm">Rs. {item.unitPrice}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getLevelColor(level)}`}>
                        {level.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                )
              })}

              {filteredStock.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No stock items found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
