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

    // Get all fee collections that are not fully paid
    const where = {
      ...schoolFilter,
      status: {
        in: ['PENDING', 'PARTIAL'] as const
      }
    }

    if (usePagination) {
      const params = getPaginationParams(request)
      const [feeCollections, total] = await Promise.all([
        prisma.feeCollection.findMany({
          where,
          include: {
            student: {
              include: {
                class: true,
                section: true,
              }
            },
            feeStructure: true,
          },
          orderBy: { dueDate: 'asc' },
          skip: params.skip,
          take: params.limit,
        }),
        prisma.feeCollection.count({ where })
      ])

      return paginatedResponse(feeCollections, total, params)
    } else {
      const feeCollections = await prisma.feeCollection.findMany({
        where,
        include: {
          student: {
            include: {
              class: true,
              section: true,
            }
          },
          feeStructure: true,
        },
        orderBy: { dueDate: 'asc' }
      })

      return successResponse(feeCollections)
    }
  },
  { requireAuth: true, module: 'finance' }
)
