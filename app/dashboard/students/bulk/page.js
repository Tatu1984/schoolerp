'use client'

import { useState } from 'react'
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react'

export default function BulkUploadPage() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)

  const downloadTemplate = () => {
    const headers = [
      'admissionNumber', 'firstName', 'lastName', 'dateOfBirth', 'gender',
      'bloodGroup', 'phone', 'email', 'address', 'city', 'state', 'pincode',
      'nationality', 'religion', 'className', 'sectionName',
      'guardianFirstName', 'guardianLastName', 'guardianRelation', 'guardianPhone', 'guardianEmail'
    ]

    const sampleData = [
      [
        'ADM001', 'John', 'Doe', '2010-05-15', 'MALE',
        'A_POSITIVE', '1234567890', 'john@example.com', '123 Main St', 'City', 'State', '123456',
        'Indian', 'Hindu', 'Class 5', 'A',
        'Robert', 'Doe', 'Father', '9876543210', 'robert@example.com'
      ],
      [
        'ADM002', 'Jane', 'Smith', '2011-08-20', 'FEMALE',
        'B_POSITIVE', '1234567891', 'jane@example.com', '456 Oak Ave', 'City', 'State', '123456',
        'Indian', 'Christian', 'Class 4', 'B',
        'Mary', 'Smith', 'Mother', '9876543211', 'mary@example.com'
      ]
    ]

    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student_bulk_upload_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      setResult(null)
    } else {
      alert('Please select a valid CSV file')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file')
      return
    }

    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/students/bulk-upload', {
        method: 'POST',
        body: formData
      })

      const result = await res.json()
      setResult(result.data || result)

      if (res.ok) {
        setFile(null)
        // Reset file input
        document.getElementById('fileInput').value = ''
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      setResult({
        success: false,
        message: 'Error uploading file',
        errors: ['An unexpected error occurred']
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bulk Student Upload</h1>
        <p className="text-gray-600">Upload multiple students at once using CSV file</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Upload CSV File
          </h2>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <input
                id="fileInput"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="fileInput"
                className="cursor-pointer flex flex-col items-center"
              >
                <FileText className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Click to select CSV file or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  CSV files only
                </p>
              </label>
            </div>

            {file && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-900 font-medium">{file.name}</span>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-5 h-5" />
              <span>{uploading ? 'Uploading...' : 'Upload Students'}</span>
            </button>
          </div>

          {result && (
            <div className={`mt-6 rounded-lg p-4 ${
              result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold mb-2 ${
                    result.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {result.message}
                  </h3>
                  {result.created > 0 && (
                    <p className="text-sm text-green-800 mb-1">
                      Successfully created: {result.created} students
                    </p>
                  )}
                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-red-800 font-medium mb-1">Errors:</p>
                      <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                        {result.errors.slice(0, 10).map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                        {result.errors.length > 10 && (
                          <li>... and {result.errors.length - 10} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Instructions
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">1. Download Template</h3>
              <p className="text-sm text-gray-600 mb-3">
                Download the CSV template with all required columns and sample data
              </p>
              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Download className="w-4 h-4" />
                <span>Download Template</span>
              </button>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-2">2. Fill Student Data</h3>
              <p className="text-sm text-gray-600 mb-2">
                Open the template in Excel or any spreadsheet application and fill in the student details
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-2">3. Required Fields</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Admission Number (must be unique)</li>
                <li>First Name and Last Name</li>
                <li>Date of Birth (YYYY-MM-DD format)</li>
                <li>Gender (MALE, FEMALE, OTHER)</li>
                <li>Class Name and Section Name</li>
                <li>Guardian details (at least one)</li>
              </ul>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-2">4. Upload CSV</h3>
              <p className="text-sm text-gray-600">
                Save the file as CSV and upload it using the form on the left
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-2">Important Notes</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Class and Section must already exist in the system</li>
                <li>Blood Group values: A_POSITIVE, A_NEGATIVE, B_POSITIVE, B_NEGATIVE, O_POSITIVE, O_NEGATIVE, AB_POSITIVE, AB_NEGATIVE</li>
                <li>Date format must be YYYY-MM-DD (e.g., 2010-05-15)</li>
                <li>Duplicate admission numbers will be skipped</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
