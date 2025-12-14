'use client'

import { useState, useEffect } from 'react'
import { Search, Download, Eye, FileText } from 'lucide-react'

export default function ReportCardsPage() {
  const [reportCards, setReportCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('ALL')

  useEffect(() => {
    fetchReportCards()
  }, [])

  const fetchReportCards = async () => {
    try {
      const res = await fetch('/api/lms/report-cards')
      if (res.ok) {
        const result = await res.json()
        setReportCards(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching report cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = reportCards.filter(report => {
    const matchesSearch = report.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.admissionNumber?.includes(searchTerm)
    const matchesClass = filterClass === 'ALL' || report.className === filterClass
    return matchesSearch && matchesClass
  })

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'bg-green-100 text-green-800',
      'A': 'bg-green-100 text-green-700',
      'B+': 'bg-blue-100 text-blue-800',
      'B': 'bg-blue-100 text-blue-700',
      'C': 'bg-yellow-100 text-yellow-700',
      'D': 'bg-orange-100 text-orange-700',
      'F': 'bg-red-100 text-red-700'
    }
    return colors[grade] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading report cards...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Report Cards</h1>
        <p className="text-gray-600">View and download student report cards</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by student name or admission number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="ALL">All Classes</option>
          <option value="Class 1">Class 1</option>
          <option value="Class 2">Class 2</option>
          <option value="Class 3">Class 3</option>
          <option value="Class 4">Class 4</option>
          <option value="Class 5">Class 5</option>
          <option value="Class 6">Class 6</option>
          <option value="Class 7">Class 7</option>
          <option value="Class 8">Class 8</option>
          <option value="Class 9">Class 9</option>
          <option value="Class 10">Class 10</option>
          <option value="Class 11">Class 11</option>
          <option value="Class 12">Class 12</option>
        </select>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{report.studentName}</h3>
                <p className="text-sm text-gray-600">{report.admissionNumber}</p>
                <p className="text-sm text-gray-600">{report.className} - {report.section}</p>
              </div>
              <FileText className="w-8 h-8 text-primary-600" />
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Academic Year:</span>
                <span className="text-sm font-medium">{report.academicYear}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Term:</span>
                <span className="text-sm font-medium">{report.term}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overall Grade:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getGradeColor(report.overallGrade)}`}>
                  {report.overallGrade}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Percentage:</span>
                <span className="text-sm font-medium">{report.percentage}%</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-4 border-t border-gray-200">
              <button
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                title="View"
              >
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>
              <button
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                title="Download"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <p className="text-gray-500 mt-2">No report cards found.</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900">{reportCards.length}</div>
          <div className="text-sm text-gray-600">Total Report Cards</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {reportCards.filter(r => r.overallGrade === 'A+' || r.overallGrade === 'A').length}
          </div>
          <div className="text-sm text-gray-600">Grade A & A+</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">
            {reportCards.filter(r => r.overallGrade === 'B+' || r.overallGrade === 'B').length}
          </div>
          <div className="text-sm text-gray-600">Grade B & B+</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-primary-600">
            {reportCards.length > 0 ? (reportCards.reduce((sum, r) => sum + r.percentage, 0) / reportCards.length).toFixed(1) : 0}%
          </div>
          <div className="text-sm text-gray-600">Average Percentage</div>
        </div>
      </div>
    </div>
  )
}
