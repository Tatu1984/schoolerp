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

    const where = {
      status: 'ISSUED' as const,
      book: schoolFilter.schoolId ? {
        schoolId: schoolFilter.schoolId
      } : undefined
    }

    if (usePagination) {
      const params = getPaginationParams(request)
      const [issuedBooks, total] = await Promise.all([
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
          orderBy: { issueDate: 'desc' },
          skip: params.skip,
          take: params.limit,
        }),
        prisma.bookIssue.count({ where })
      ])

      return paginatedResponse(issuedBooks, total, params)
    } else {
      const issuedBooks = await prisma.bookIssue.findMany({
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
        orderBy: { issueDate: 'desc' }
      })

      return successResponse(issuedBooks)
    }
  },
  { requireAuth: true, module: 'library' }
)
