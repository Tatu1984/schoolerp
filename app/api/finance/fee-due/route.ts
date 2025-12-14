import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  getPaginationParams,
  paginatedResponse,
  successResponse
} from '@/lib/api-utils'

export const GET = withApiHandler(
  async (request: NextRequest, context, session) => {
    const schoolFilter = getSchoolFilter(session)
    const { searchParams } = new URL(request.url)
    const usePagination = searchParams.get('paginate') === 'true'

    // Get all fee payments that are not fully paid
    const where = {
      ...schoolFilter,
      status: {
        in: ['PENDING', 'PARTIAL'] as ('PENDING' | 'PARTIAL')[]
      }
    }

    if (usePagination) {
      const params = getPaginationParams(request)
      const [feePayments, total] = await Promise.all([
        prisma.feePayment.findMany({
          where,
          include: {
            student: {
              include: {
                class: true,
                section: true,
              }
            },
            fee: true,
          },
          orderBy: { dueDate: 'asc' },
          skip: params.skip,
          take: params.limit,
        }),
        prisma.feePayment.count({ where })
      ])

      return paginatedResponse(feePayments, total, params)
    } else {
      const feePayments = await prisma.feePayment.findMany({
        where,
        include: {
          student: {
            include: {
              class: true,
              section: true,
            }
          },
          fee: true,
        },
        orderBy: { dueDate: 'asc' }
      })

      return successResponse(feePayments)
    }
  },
  { requireAuth: true, module: 'finance' }
)
