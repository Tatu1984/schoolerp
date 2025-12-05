'use client'

import { useState, useEffect } from 'react'
import { ArrowUpCircle, CheckCircle, XCircle } from 'lucide-react'

export default function StudentPromotionsPage() {
  const [academicYears, setAcademicYears] = useState([])
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [promoting, setPromoting] = useState(false)

  const [filters, setFilters] = useState({
    currentAcademicYearId: '',
    currentClassId: '',
    currentSectionId: '',
    nextAcademicYearId: '',
    nextClassId: '',
    nextSectionId: ''
  })

  const [selectedStudents, setSelectedStudents] = useState(new Set())

  useEffect(() => {
    fetchAcademicYears()
    fetchClasses()
    fetchSections()
  }, [])

  const fetchAcademicYears = async () => {
    try {
      const res = await fetch('/api/academic-years')
      const data = await res.json()
      setAcademicYears(data)
    } catch (error) {
      console.error('Error fetching academic years:', error)
    }
  }

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes')
      const data = await res.json()
      setClasses(data)
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }

  const fetchSections = async () => {
    try {
      const res = await fetch('/api/sections')
      const data = await res.json()
      setSections(data)
    } catch (error) {
      console.error('Error fetching sections:', error)
    }
  }

  const loadStudents = async () => {
    if (!filters.currentClassId) {
      alert('Please select current class')
      return
    }

    setLoading(true)
    try {
      let url = `/api/students?classId=${filters.currentClassId}`
      if (filters.currentSectionId) {
        url += `&sectionId=${filters.currentSectionId}`
      }

      const res = await fetch(url)
      const data = await res.json()
      setStudents(data)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStudent = (studentId) => {
    const newSelected = new Set(selectedStudents)
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId)
    } else {
      newSelected.add(studentId)
    }
    setSelectedStudents(newSelected)
  }

  const toggleAll = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set())
    } else {
      setSelectedStudents(new Set(students.map(s => s.id)))
    }
  }

  const promoteStudents = async () => {
    if (selectedStudents.size === 0) {
      alert('Please select at least one student')
      return
    }

    if (!filters.nextAcademicYearId || !filters.nextClassId) {
      alert('Please select next academic year and class')
      return
    }

    if (!confirm(`Promote ${selectedStudents.size} students?`)) return

    setPromoting(true)
    try {
      const res = await fetch('/api/students/bulk-promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: Array.from(selectedStudents),
          nextClassId: filters.nextClassId,
          nextSectionId: filters.nextSectionId || null
        })
      })

      if (res.ok) {
        alert('Students promoted successfully!')
        loadStudents()
        setSelectedStudents(new Set())
      } else {
        alert('Error promoting students')
      }
    } catch (error) {
      console.error('Error promoting students:', error)
      alert('Error promoting students')
    } finally {
      setPromoting(false)
    }
  }

  const currentSections = sections.filter(s => s.classId === filters.currentClassId)
  const nextSections = sections.filter(s => s.classId === filters.nextClassId)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Promotions</h1>
        <p className="text-gray-600">Promote students to next class/academic year</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Class</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filters.currentAcademicYearId}
              onChange={(e) => setFilters({ ...filters, currentAcademicYearId: e.target.value })}
            >
              <option value="">Select Academic Year</option>
              {academicYears.map(year => (
                <option key={year.id} value={year.id}>
                  {year.name} {year.isCurrent ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filters.currentClassId}
              onChange={(e) => setFilters({ ...filters, currentClassId: e.target.value })}
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filters.currentSectionId}
              onChange={(e) => setFilters({ ...filters, currentSectionId: e.target.value })}
            >
              <option value="">All Sections</option>
              {currentSections.map(section => (
                <option key={section.id} value={section.id}>{section.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={loadStudents}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Load Students
        </button>
      </div>

      {students.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Promote To</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Academic Year *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filters.nextAcademicYearId}
                  onChange={(e) => setFilters({ ...filters, nextAcademicYearId: e.target.value })}
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>{year.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Class *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filters.nextClassId}
                  onChange={(e) => setFilters({ ...filters, nextClassId: e.target.value })}
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Section
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filters.nextSectionId}
                  onChange={(e) => setFilters({ ...filters, nextSectionId: e.target.value })}
                >
                  <option value="">Select Section</option>
                  {nextSections.map(section => (
                    <option key={section.id} value={section.id}>{section.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Students ({students.length})
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedStudents.size} selected for promotion
                </p>
              </div>
              <button
                onClick={promoteStudents}
                disabled={promoting || selectedStudents.size === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowUpCircle className="w-5 h-5" />
                <span>{promoting ? 'Promoting...' : 'Promote Selected'}</span>
              </button>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedStudents.size === students.length && students.length > 0}
                      onChange={toggleAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Admission No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Current Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedStudents.has(student.id)}
                        onChange={() => toggleStudent(student.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.admissionNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.class?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.section?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        student.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && students.length === 0 && filters.currentClassId && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <XCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-600">No students in the selected class and section</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Loading students...</p>
        </div>
      )}
    </div>
  )
}
