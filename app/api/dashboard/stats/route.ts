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

    const [
      totalStudents,
      activeStudents,
      totalStaff,
      activeStaff,
      totalClasses,
      totalFeeCollected,
    ] = await Promise.all([
      prisma.student.count({ where: schoolFilter }),
      prisma.student.count({ where: { ...schoolFilter, isActive: true } }),
      prisma.staff.count({ where: schoolFilter }),
      prisma.staff.count({ where: { ...schoolFilter, isActive: true } }),
      prisma.class.count({ where: schoolFilter }),
      prisma.feePayment.aggregate({
        where: { ...schoolFilter, status: 'PAID' },
        _sum: { paidAmount: true },
      }),
    ])

    const stats = [
      {
        name: 'Total Students',
        value: totalStudents.toLocaleString(),
        change: '+12%',
        trend: 'up',
        icon: 'GraduationCap',
        color: 'bg-blue-500',
      },
      {
        name: 'Total Staff',
        value: totalStaff.toLocaleString(),
        change: '+3%',
        trend: 'up',
        icon: 'Users',
        color: 'bg-green-500',
      },
      {
        name: 'Active Classes',
        value: totalClasses.toLocaleString(),
        change: '0%',
        trend: 'neutral',
        icon: 'BookOpen',
        color: 'bg-purple-500',
      },
      {
        name: 'Fee Collection',
        value: `₹${((totalFeeCollected._sum.paidAmount || 0) / 100000).toFixed(1)}L`,
        change: '+18%',
        trend: 'up',
        icon: 'DollarSign',
        color: 'bg-yellow-500',
      },
    ]

    return successResponse(stats)
  },
  { requireAuth: true }
)
