import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  getPaginationParams,
  successResponse,
  validateBody,
  validationErrorResponse,
} from '@/lib/api-utils'
import { assetSchema } from '@/lib/validations'

// GET /api/assets - Get all assets
export const GET = withApiHandler(
  async (request: NextRequest, context, session) => {
    const assets = await prisma.asset.findMany({
      where: getSchoolFilter(session),
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(assets)
  },
  { requireAuth: true, module: 'inventory' }
)

// POST /api/assets - Create a new asset
export const POST = withApiHandler(
  async (request: NextRequest, context, session) => {
    const { data, errors } = await validateBody(request, assetSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    // Ensure schoolId is set from session if not provided
    const schoolId = data!.schoolId || session?.user.schoolId

    if (!schoolId) {
      return validationErrorResponse({
        schoolId: ['School ID is required'],
      })
    }

    const asset = await prisma.asset.create({
      data: {
        schoolId,
        name: data!.name,
        code: data!.code,
        assetType: data!.assetType,
        description: data!.description,
        purchaseDate: data!.purchaseDate ? new Date(data!.purchaseDate) : undefined,
        purchasePrice: data!.purchasePrice,
        currentValue: data!.currentValue,
        location: data!.location,
        condition: data!.condition,
        isDurable: data!.isDurable,
        isActive: data!.isActive,
      },
    })

    return successResponse(asset, 201)
  },
  { requireAuth: true, module: 'inventory' }
)
