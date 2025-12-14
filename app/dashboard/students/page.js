'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Download, Upload, Eye, Edit, Trash2, Users } from 'lucide-react'
import Link from 'next/link'

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('all')
  const [classes, setClasses] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [studentsRes, classesRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/classes')
      ])

      if (studentsRes.ok) {
        const result = await studentsRes.json()
        setStudents(result.data || [])
      }

      if (classesRes.ok) {
        const result = await classesRes.json()
        setClasses(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this student?')) return

    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
        alert('Student deleted successfully!')
      }
    } catch (error) {
      alert('Error deleting student')
      console.error(error)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesClass = filterClass === 'all' || student.classId === filterClass

    return matchesSearch && matchesClass
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Manage student information</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/dashboard/students/bulk" className="btn btn-secondary flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Bulk Upload</span>
          </Link>
          <Link href="/dashboard/students/add" className="btn btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-primary-600">{students.length}</div>
          <div className="text-sm text-gray-600">Total Students</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {students.filter(s => s.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Active Students</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">
            {students.filter(s => s.gender === 'MALE').length}
          </div>
          <div className="text-sm text-gray-600">Male</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-pink-600">
            {students.filter(s => s.gender === 'FEMALE').length}
          </div>
          <div className="text-sm text-gray-600">Female</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or admission number..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="input"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
          >
            <option value="all">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>

          <button className="btn btn-secondary flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Student List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-600" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{student.admissionNumber}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{student.email || student.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{student.class?.name}</td>
                  <td className="px-6 py-4 text-sm">{student.rollNumber || '-'}</td>
                  <td className="px-6 py-4 text-sm">{student.gender}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      student.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => window.location.href = `/dashboard/students/${student.id}`}
                      className="text-blue-600 hover:text-blue-700"
                      title="View"
                    >
                      <Eye className="w-5 h-5 inline" />
                    </button>
                    <button
                      onClick={() => window.location.href = `/dashboard/students/${student.id}/edit`}
                      className="text-green-600 hover:text-green-700"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No students found</p>
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
