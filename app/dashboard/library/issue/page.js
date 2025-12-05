'use client'

import { useState, useEffect } from 'react'
import { Search, BookOpen, User, Calendar, ArrowRight, ArrowLeft } from 'lucide-react'

export default function IssueReturnPage() {
  const [books, setBooks] = useState([])
  const [students, setStudents] = useState([])
  const [issuedBooks, setIssuedBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookSearch, setBookSearch] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [dueDate, setDueDate] = useState('')
  const [activeTab, setActiveTab] = useState('issue')

  useEffect(() => {
    fetchData()
    // Set default due date to 14 days from now
    const defaultDueDate = new Date()
    defaultDueDate.setDate(defaultDueDate.getDate() + 14)
    setDueDate(defaultDueDate.toISOString().split('T')[0])
  }, [])

  const fetchData = async () => {
    try {
      const [booksRes, studentsRes, issuedRes] = await Promise.all([
        fetch('/api/library/books'),
        fetch('/api/students'),
        fetch('/api/library/issued')
      ])

      if (booksRes.ok) {
        const data = await booksRes.json()
        setBooks(data)
      }

      if (studentsRes.ok) {
        const data = await studentsRes.json()
        setStudents(data)
      }

      if (issuedRes.ok) {
        const data = await issuedRes.json()
        setIssuedBooks(data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleIssue = async () => {
    if (!selectedBook || !selectedStudent || !dueDate) {
      alert('Please select book, student, and due date')
      return
    }

    try {
      const res = await fetch('/api/library/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: selectedBook.id,
          studentId: selectedStudent.id,
          dueDate
        })
      })

      if (res.ok) {
        alert('Book issued successfully!')
        fetchData()
        resetSelection()
      }
    } catch (error) {
      alert('Error issuing book')
      console.error(error)
    }
  }

  const handleReturn = async (issueId) => {
    try {
      const res = await fetch(`/api/library/return/${issueId}`, {
        method: 'POST'
      })

      if (res.ok) {
        alert('Book returned successfully!')
        fetchData()
      }
    } catch (error) {
      alert('Error returning book')
      console.error(error)
    }
  }

  const resetSelection = () => {
    setSelectedBook(null)
    setSelectedStudent(null)
    setBookSearch('')
    setStudentSearch('')
  }

  const filteredBooks = books.filter(book =>
    book.title?.toLowerCase().includes(bookSearch.toLowerCase()) ||
    book.isbn?.toLowerCase().includes(bookSearch.toLowerCase()) ||
    book.author?.toLowerCase().includes(bookSearch.toLowerCase())
  ).filter(book => book.availableCopies > 0)

  const filteredStudents = students.filter(student =>
    student.firstName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.lastName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.admissionNumber?.toLowerCase().includes(studentSearch.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Issue & Return Books</h1>
          <p className="text-gray-600 mt-1">Manage book circulation</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-primary-600">{issuedBooks.length}</div>
          <div className="text-sm text-gray-600">Books Issued</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {books.reduce((sum, book) => sum + book.availableCopies, 0)}
          </div>
          <div className="text-sm text-gray-600">Available Books</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {issuedBooks.filter(b => new Date(b.dueDate) < new Date()).length}
          </div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">
            {issuedBooks.filter(b => new Date(b.dueDate) >= new Date()).length}
          </div>
          <div className="text-sm text-gray-600">Active Loans</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('issue')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === 'issue'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ArrowRight className="w-4 h-4 inline mr-2" />
            Issue Book
          </button>
          <button
            onClick={() => setActiveTab('return')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === 'return'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Return Book
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'issue' ? (
            <div className="space-y-6">
              {/* Book Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Book
                </label>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by title, ISBN, or author..."
                    className="input pl-10"
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                  />
                </div>
                {bookSearch && (
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {filteredBooks.map((book) => (
                      <div
                        key={book.id}
                        onClick={() => {
                          setSelectedBook(book)
                          setBookSearch('')
                        }}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        <div className="font-medium">{book.title}</div>
                        <div className="text-sm text-gray-600">
                          {book.author} - ISBN: {book.isbn} - Available: {book.availableCopies}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedBook && (
                  <div className="mt-2 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{selectedBook.title}</div>
                        <div className="text-sm text-gray-600">{selectedBook.author}</div>
                      </div>
                      <button
                        onClick={() => setSelectedBook(null)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Student Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Student
                </label>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name or admission number..."
                    className="input pl-10"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>
                {studentSearch && (
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => {
                          setSelectedStudent(student)
                          setStudentSearch('')
                        }}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        <div className="font-medium">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {student.admissionNumber} - {student.class?.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedStudent && (
                  <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">
                          {selectedStudent.firstName} {selectedStudent.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedStudent.admissionNumber}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedStudent(null)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  className="input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <button
                onClick={handleIssue}
                disabled={!selectedBook || !selectedStudent}
                className="btn btn-primary w-full"
              >
                Issue Book
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-700 mb-4">
                Currently Issued Books
              </div>
              {issuedBooks.map((issue) => (
                <div key={issue.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold">{issue.book?.title}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Student: {issue.student?.firstName} {issue.student?.lastName} ({issue.student?.admissionNumber})
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            Issued: {new Date(issue.issueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className={`${
                            new Date(issue.dueDate) < new Date()
                              ? 'text-red-600 font-medium'
                              : 'text-gray-600'
                          }`}>
                            Due: {new Date(issue.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleReturn(issue.id)}
                      className="btn btn-primary"
                    >
                      Return Book
                    </button>
                  </div>
                </div>
              ))}

              {issuedBooks.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No books currently issued</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
