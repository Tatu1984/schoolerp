import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  successResponse,
  getSchoolFilter,
  AuthenticatedSession,
} from '@/lib/api-utils'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const schoolFilter = getSchoolFilter(session)

    // Fetch all statistics
    const [
      totalStudents,
      totalStaff,
      totalRevenue,
      totalCourses
    ] = await Promise.all([
      prisma.student.count({ where: schoolFilter }),
      prisma.staff.count({ where: schoolFilter }),
      prisma.feePayment.aggregate({
        where: { status: 'PAID', ...schoolFilter },
        _sum: { paidAmount: true }
      }),
      prisma.course.count({ where: { isActive: true, ...schoolFilter } })
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

    return successResponse(stats)
  },
  { requireAuth: true, module: 'analytics' }
)
