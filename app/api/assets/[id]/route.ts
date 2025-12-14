import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  successResponse,
  notFoundResponse,
  validateBody,
  validationErrorResponse,
} from '@/lib/api-utils'
import { assetSchema } from '@/lib/validations'

// GET /api/assets/[id] - Get a specific asset
export const GET = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    const asset = await prisma.asset.findFirst({
      where: {
        id: params.id,
        ...getSchoolFilter(session),
      },
    })

    if (!asset) {
      return notFoundResponse('Asset not found')
    }

    return successResponse(asset)
  },
  { requireAuth: true, module: 'inventory' }
)

// PUT /api/assets/[id] - Update an asset
export const PUT = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    const { data, errors } = await validateBody(request, assetSchema.partial())

    if (errors) {
      return validationErrorResponse(errors)
    }

    // Check if asset exists and belongs to user's school
    const existingAsset = await prisma.asset.findFirst({
      where: {
        id: params.id,
        ...getSchoolFilter(session),
      },
    })

    if (!existingAsset) {
      return notFoundResponse('Asset not found')
    }

    const asset = await prisma.asset.update({
      where: { id: params.id },
      data: {
        ...(data!.name && { name: data!.name }),
        ...(data!.code && { code: data!.code }),
        ...(data!.assetType && { assetType: data!.assetType }),
        ...(data!.description !== undefined && { description: data!.description }),
        ...(data!.purchaseDate && { purchaseDate: new Date(data!.purchaseDate) }),
        ...(data!.purchasePrice !== undefined && { purchasePrice: data!.purchasePrice }),
        ...(data!.currentValue !== undefined && { currentValue: data!.currentValue }),
        ...(data!.location !== undefined && { location: data!.location }),
        ...(data!.condition !== undefined && { condition: data!.condition }),
        ...(data!.isDurable !== undefined && { isDurable: data!.isDurable }),
        ...(data!.isActive !== undefined && { isActive: data!.isActive }),
      },
    })

    return successResponse(asset)
  },
  { requireAuth: true, module: 'inventory' }
)

// DELETE /api/assets/[id] - Delete an asset
export const DELETE = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    // Check if asset exists and belongs to user's school
    const asset = await prisma.asset.findFirst({
      where: {
        id: params.id,
        ...getSchoolFilter(session),
      },
    })

    if (!asset) {
      return notFoundResponse('Asset not found')
    }

    await prisma.asset.delete({
      where: { id: params.id },
    })

    return successResponse({ success: true, message: 'Asset deleted successfully' })
  },
  { requireAuth: true, module: 'inventory' }
)
