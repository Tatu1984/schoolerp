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

interface AssetWithCategory {
  id: string
  name: string
  quantity: number | null
  minQuantity: number | null
  category: { id: string; name: string } | null
  [key: string]: unknown
}

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
          include: {
            category: true,
          },
          orderBy: { createdAt: 'desc' },
          skip: params.skip,
          take: params.limit,
        }),
        prisma.asset.count({ where })
      ])

      // Calculate stock levels
      const stockReport = assets.map((asset: AssetWithCategory) => {
        const stockLevel = asset.quantity || 0
        const minStock = asset.minQuantity || 0

        return {
          ...asset,
          stockStatus: stockLevel <= minStock ? 'LOW' : stockLevel === 0 ? 'OUT_OF_STOCK' : 'IN_STOCK',
          needsReorder: stockLevel <= minStock
        }
      })

      return paginatedResponse(stockReport, total, params)
    } else {
      const assets = await prisma.asset.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { createdAt: 'desc' }
      })

      // Calculate stock levels
      const stockReport = assets.map((asset: AssetWithCategory) => {
        const stockLevel = asset.quantity || 0
        const minStock = asset.minQuantity || 0

        return {
          ...asset,
          stockStatus: stockLevel <= minStock ? 'LOW' : stockLevel === 0 ? 'OUT_OF_STOCK' : 'IN_STOCK',
          needsReorder: stockLevel <= minStock
        }
      })

      return successResponse(stockReport)
    }
  },
  { requireAuth: true, module: 'inventory' }
)
