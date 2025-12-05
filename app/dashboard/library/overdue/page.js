'use client'

import { useState, useEffect } from 'react'
import { Search, Download, AlertTriangle, Calendar, DollarSign } from 'lucide-react'

export default function OverduePage() {
  const [overdueBooks, setOverdueBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [finePerDay] = useState(5) // Rs. 5 per day fine

  useEffect(() => {
    fetchOverdueBooks()
  }, [])

  const fetchOverdueBooks = async () => {
    try {
      const res = await fetch('/api/library/overdue')
      if (res.ok) {
        const data = await res.json()
        setOverdueBooks(data)
      }
    } catch (error) {
      console.error('Error fetching overdue books:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateFine = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const daysOverdue = Math.floor((today - due) / (1000 * 60 * 60 * 24))
    return daysOverdue > 0 ? daysOverdue * finePerDay : 0
  }

  const calculateDaysOverdue = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    return Math.floor((today - due) / (1000 * 60 * 60 * 24))
  }

  const filteredOverdueBooks = overdueBooks.filter(item => {
    const searchLower = searchTerm.toLowerCase()
    return (
      item.book?.title?.toLowerCase().includes(searchLower) ||
      item.student?.firstName?.toLowerCase().includes(searchLower) ||
      item.student?.lastName?.toLowerCase().includes(searchLower) ||
      item.student?.admissionNumber?.toLowerCase().includes(searchLower)
    )
  })

  const totalFine = filteredOverdueBooks.reduce((sum, item) => sum + calculateFine(item.dueDate), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Overdue Books</h1>
          <p className="text-gray-600 mt-1">Track and manage overdue library books</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600">{overdueBooks.length}</div>
          <div className="text-sm text-gray-600">Overdue Books</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">Rs. {totalFine}</div>
          <div className="text-sm text-gray-600">Total Fine Amount</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-primary-600">
            Rs. {finePerDay}
          </div>
          <div className="text-sm text-gray-600">Fine Per Day</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">
            {new Set(overdueBooks.map(b => b.studentId)).size}
          </div>
          <div className="text-sm text-gray-600">Students Affected</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by book title or student name..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="btn btn-secondary flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Overdue Report</span>
          </button>
        </div>
      </div>

      {/* Overdue List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Overdue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fine Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOverdueBooks.map((item) => {
                const daysOverdue = calculateDaysOverdue(item.dueDate)
                const fine = calculateFine(item.dueDate)

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.book?.title}</div>
                      <div className="text-xs text-gray-500">ISBN: {item.book?.isbn}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.student?.firstName} {item.student?.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{item.student?.admissionNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(item.issueDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-1 text-red-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(item.dueDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        daysOverdue > 30
                          ? 'bg-red-100 text-red-700'
                          : daysOverdue > 14
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {daysOverdue} days
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1 text-sm font-semibold text-red-600">
                        <DollarSign className="w-4 h-4" />
                        <span>Rs. {fine}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredOverdueBooks.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {searchTerm ? 'No overdue books match your search' : 'No overdue books'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Fine Calculation Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-900">Fine Calculation</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Fine is calculated at Rs. {finePerDay} per day for each overdue book.
              Please return books on time to avoid fines.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
