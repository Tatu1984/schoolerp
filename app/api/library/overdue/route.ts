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
    const today = new Date()

    const where = {
      status: 'ISSUED' as const,
      dueDate: {
        lt: today
      },
      book: schoolFilter.schoolId ? {
        schoolId: schoolFilter.schoolId
      } : undefined
    }

    if (usePagination) {
      const params = getPaginationParams(request)
      const [overdueBooks, total] = await Promise.all([
        prisma.bookIssue.findMany({
          where,
          include: {
            book: true,
            student: {
              include: {
                class: true,
                section: true,
              }
            },
            issuedBy: true,
          },
          orderBy: { dueDate: 'asc' },
          skip: params.skip,
          take: params.limit,
        }),
        prisma.bookIssue.count({ where })
      ])

      return paginatedResponse(overdueBooks, total, params)
    } else {
      const overdueBooks = await prisma.bookIssue.findMany({
        where,
        include: {
          book: true,
          student: {
            include: {
              class: true,
              section: true,
            }
          },
          issuedBy: true,
        },
        orderBy: { dueDate: 'asc' }
      })

      return successResponse(overdueBooks)
    }
  },
  { requireAuth: true, module: 'library' }
)
