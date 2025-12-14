import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  successResponse
} from '@/lib/api-utils'

export const GET = withApiHandler(
  async (request: NextRequest, context, session) => {
    const schoolFilter = getSchoolFilter(session)

    // Calculate total fees collected
    const totalCollected = await prisma.feePayment.aggregate({
      _sum: {
        paidAmount: true
      },
      where: {
        ...schoolFilter,
        status: {
          in: ['PAID', 'PARTIAL']
        }
      }
    })

    // Calculate total fees pending
    const totalPending = await prisma.feePayment.aggregate({
      _sum: {
        amount: true,
        paidAmount: true
      },
      where: {
        ...schoolFilter,
        status: {
          in: ['PENDING', 'PARTIAL']
        }
      }
    })

    const pendingAmount = (totalPending._sum.amount || 0) - (totalPending._sum.paidAmount || 0)

    // Calculate total expenses
    const totalExpenses = await prisma.expense.aggregate({
      _sum: {
        amount: true
      },
      where: schoolFilter
    })

    // Get monthly collection trends (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyCollections = await prisma.feePayment.groupBy({
      by: ['paymentDate'],
      _sum: {
        paidAmount: true
      },
      where: {
        ...schoolFilter,
        paymentDate: {
          gte: sixMonthsAgo
        },
        status: {
          in: ['PAID', 'PARTIAL']
        }
      }
    })

    // Get category-wise expenses
    const categoryExpenses = await prisma.expense.groupBy({
      by: ['category'],
      _sum: {
        amount: true
      },
      where: schoolFilter,
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      }
    })

    const report = {
      totalCollected: totalCollected._sum.paidAmount || 0,
      totalPending: pendingAmount,
      totalExpenses: totalExpenses._sum.amount || 0,
      netRevenue: (totalCollected._sum.paidAmount || 0) - (totalExpenses._sum.amount || 0),
      monthlyTrends: monthlyCollections,
      categoryExpenses
    }

    return successResponse(report)
  },
  { requireAuth: true, module: 'finance' }
)
