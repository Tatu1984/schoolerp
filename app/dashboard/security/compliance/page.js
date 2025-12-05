'use client'

import { useState, useEffect } from 'react'
import { Shield, CheckCircle, AlertCircle, FileText } from 'lucide-react'

export default function CompliancePage() {
  const [compliance, setCompliance] = useState({
    gdprCompliance: [],
    dataRetentionPolicies: [],
    complianceScore: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompliance()
  }, [])

  const fetchCompliance = async () => {
    try {
      const res = await fetch('/api/security/compliance')
      if (res.ok) {
        const data = await res.json()
        setCompliance(data)
      }
    } catch (error) {
      console.error('Error fetching compliance:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateChecklistItem = async (id, status) => {
    try {
      const res = await fetch(`/api/security/compliance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (res.ok) {
        fetchCompliance()
      }
    } catch (error) {
      console.error('Error updating checklist:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading compliance data...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Compliance & Data Protection</h1>
        <p className="text-gray-600">GDPR compliance and data protection tracking</p>
      </div>

      {/* Compliance Score */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Overall Compliance Score</h2>
            <p className="text-sm text-gray-600">Based on GDPR and data protection standards</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-1">{compliance.complianceScore}%</div>
            <div className="text-sm text-gray-600">Compliant</div>
          </div>
        </div>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full ${compliance.complianceScore >= 80 ? 'bg-green-600' : 'bg-yellow-600'}`}
            style={{ width: `${compliance.complianceScore}%` }}
          />
        </div>
      </div>

      {/* GDPR Compliance Checklist */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">GDPR Compliance Checklist</h2>
        <div className="space-y-3">
          {(compliance.gdprCompliance || []).map((item, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <button
                onClick={() => updateChecklistItem(item.id, !item.completed)}
                className="mt-0.5"
              >
                {item.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                )}
              </button>
              <div className="flex-1">
                <h3 className={`text-sm font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                  {item.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1">{item.description}</p>
              </div>
              {item.priority === 'HIGH' && !item.completed && (
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                  High Priority
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Data Retention Policies */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Data Retention Policies</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Retention Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(compliance.dataRetentionPolicies || []).map((policy, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {policy.dataType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {policy.retentionPeriod}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                    {policy.purpose}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      policy.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {policy.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Documents */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Compliance Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Privacy Policy</h3>
                <p className="text-xs text-gray-600">Last updated: 2024-01-01</p>
              </div>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Terms of Service</h3>
                <p className="text-xs text-gray-600">Last updated: 2024-01-01</p>
              </div>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Data Processing Agreement</h3>
                <p className="text-xs text-gray-600">Last updated: 2024-01-01</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
