import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  getPaginationParams,
  paginatedResponse,
} from '@/lib/api-utils'

export const GET = withApiHandler(
  async (request: NextRequest, context, session) => {
    const schoolFilter = getSchoolFilter(session)
    const { page, limit, skip } = getPaginationParams(request)

    const [approved, total] = await Promise.all([
      prisma.admission.findMany({
        where: {
          ...schoolFilter,
          status: 'APPROVED',
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.admission.count({
        where: {
          ...schoolFilter,
          status: 'APPROVED',
        },
      }),
    ])

    return paginatedResponse(approved, total, { page, limit, skip })
  },
  { requireAuth: true, module: 'admissions' }
)
