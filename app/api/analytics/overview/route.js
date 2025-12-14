import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId')

    // Fetch all statistics
    const [
      totalStudents,
      totalStaff,
      totalRevenue,
      totalCourses
    ] = await Promise.all([
      prisma.student.count({ where: schoolId ? { schoolId } : {} }),
      prisma.staff.count({ where: schoolId ? { schoolId } : {} }),
      prisma.feePayment.aggregate({
        where: { status: 'PAID', ...(schoolId && { schoolId }) },
        _sum: { paidAmount: true }
      }),
      prisma.course.count({ where: { isActive: true, ...(schoolId && { schoolId }) } })
    ])

    // Mock growth percentages (in production, calculate from historical data)
    const stats = {
      totalStudents,
      totalStaff,
      totalRevenue: totalRevenue._sum.paidAmount || 0,
      totalCourses,
      studentGrowth: 12.5,
      revenueGrowth: 18.3,
      attendanceRate: 94.5,
      feeCollectionRate: 87.2
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
