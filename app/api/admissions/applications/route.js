import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    // Mock data for applications
    const applications = [
      {
        id: '1',
        applicationNumber: 'APP-2024-001',
        studentName: 'Rahul Kumar',
        dateOfBirth: '2010-05-15',
        classAppliedFor: 'Class 9',
        parentName: 'Mr. Suresh Kumar',
        parentPhone: '+91 98765 43210',
        status: 'SUBMITTED',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        applicationNumber: 'APP-2024-002',
        studentName: 'Priya Sharma',
        dateOfBirth: '2011-08-22',
        classAppliedFor: 'Class 8',
        parentName: 'Mrs. Anjali Sharma',
        parentPhone: '+91 98765 43211',
        status: 'UNDER_REVIEW',
        createdAt: new Date().toISOString()
      }
    ]
    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}
