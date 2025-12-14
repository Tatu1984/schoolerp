import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  getPaginationParams,
  paginatedResponse,
  successResponse,
  AuthenticatedSession,
} from '@/lib/api-utils'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const schoolFilter = getSchoolFilter(session)
    const { searchParams } = new URL(request.url)
    const usePagination = searchParams.get('paginate') === 'true'

    const where = {
      ...schoolFilter
    }

    if (usePagination) {
      const params = getPaginationParams(request)
      const [assets, total] = await Promise.all([
        prisma.asset.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: params.skip,
          take: params.limit,
        }),
        prisma.asset.count({ where })
      ])

      return paginatedResponse(assets, total, params)
    } else {
      const assets = await prisma.asset.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      })

      return successResponse(assets)
    }
  },
  { requireAuth: true, module: 'inventory' }
)
