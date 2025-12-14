'use client'

import { useState, useEffect } from 'react'
import { Search, DollarSign, Users, Receipt, Calendar } from 'lucide-react'

export default function FeeCollectionPage() {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMode, setPaymentMode] = useState('CASH')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/finance/fee-due')
      if (res.ok) {
        const result = await res.json()
        setStudents(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCollectPayment = async () => {
    if (!selectedStudent || !paymentAmount) {
      alert('Please select student and enter amount')
      return
    }

    try {
      const res = await fetch('/api/finance/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          amount: parseFloat(paymentAmount),
          mode: paymentMode,
          date: paymentDate
        })
      })

      if (res.ok) {
        alert('Payment collected successfully!')
        fetchStudents()
        setSelectedStudent(null)
        setPaymentAmount('')
      }
    } catch (error) {
      alert('Error collecting payment')
      console.error(error)
    }
  }

  const filteredStudents = students.filter(student =>
    student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalDue = students.reduce((sum, s) => sum + (s.feeDue || 0), 0)
  const totalCollected = students.reduce((sum, s) => sum + (s.feePaid || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Collection</h1>
          <p className="text-gray-600 mt-1">Collect student fees and generate receipts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-primary-600">
                Rs. {totalDue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Due</div>
            </div>
            <DollarSign className="w-10 h-10 text-primary-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">
                Rs. {totalCollected.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Collected</div>
            </div>
            <Receipt className="w-10 h-10 text-green-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {students.filter(s => s.feeDue > 0).length}
              </div>
              <div className="text-sm text-gray-600">Pending Students</div>
            </div>
            <Users className="w-10 h-10 text-yellow-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {((totalCollected / (totalCollected + totalDue)) * 100 || 0).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Collection Rate</div>
            </div>
            <Calendar className="w-10 h-10 text-blue-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Search */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Search Student</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or admission number..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedStudent?.id === student.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {student.admissionNumber} - {student.class?.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Fee Due</div>
                      <div className="font-bold text-red-600">
                        Rs. {student.feeDue?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No students found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-4">Collect Payment</h2>
            {selectedStudent ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="font-semibold">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedStudent.admissionNumber}
                  </div>
                  <div className="mt-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Fee:</span>
                      <span className="font-medium">Rs. {selectedStudent.totalFee?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid:</span>
                      <span className="font-medium text-green-600">Rs. {selectedStudent.feePaid?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 mt-1">
                      <span className="text-gray-600">Due:</span>
                      <span className="font-bold text-red-600">Rs. {selectedStudent.feeDue?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Amount *
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Mode *
                  </label>
                  <select
                    className="input"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="ONLINE">Online Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleCollectPayment}
                  className="btn btn-primary w-full"
                >
                  Collect Payment & Generate Receipt
                </button>

                <button
                  onClick={() => {
                    setSelectedStudent(null)
                    setPaymentAmount('')
                  }}
                  className="btn btn-secondary w-full"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p>Select a student to collect payment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
