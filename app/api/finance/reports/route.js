import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Calculate total fees collected
    const totalCollected = await prisma.feeCollection.aggregate({
      _sum: {
        amountPaid: true
      },
      where: {
        status: {
          in: ['PAID', 'PARTIAL']
        }
      }
    })

    // Calculate total fees pending
    const totalPending = await prisma.feeCollection.aggregate({
      _sum: {
        amount: true,
        amountPaid: true
      },
      where: {
        status: {
          in: ['PENDING', 'PARTIAL']
        }
      }
    })

    const pendingAmount = (totalPending._sum.amount || 0) - (totalPending._sum.amountPaid || 0)

    // Calculate total expenses
    const totalExpenses = await prisma.expense.aggregate({
      _sum: {
        amount: true
      }
    })

    // Get monthly collection trends (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyCollections = await prisma.feeCollection.groupBy({
      by: ['paymentDate'],
      _sum: {
        amountPaid: true
      },
      where: {
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
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      }
    })

    const report = {
      totalCollected: totalCollected._sum.amountPaid || 0,
      totalPending: pendingAmount,
      totalExpenses: totalExpenses._sum.amount || 0,
      netRevenue: (totalCollected._sum.amountPaid || 0) - (totalExpenses._sum.amount || 0),
      monthlyTrends: monthlyCollections,
      categoryExpenses
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error fetching finance reports:', error)
    return NextResponse.json({ error: 'Failed to fetch finance reports' }, { status: 500 })
  }
}
