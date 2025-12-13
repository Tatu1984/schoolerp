import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  getPaginationParams,
  successResponse,
  validationErrorResponse,
  validateBody,
  paginatedResponse,
  AuthenticatedSession,
} from '@/lib/api-utils'
import { productSchema } from '@/lib/validations'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const schoolFilter = getSchoolFilter(session)
    const pagination = getPaginationParams(request)
    const { searchParams } = new URL(request.url)

    const where: any = { ...schoolFilter }

    // Optional search filters
    const category = searchParams.get('category')
    if (category) {
      where.category = category
    }

    const isActive = searchParams.get('isActive')
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ])

    return paginatedResponse(products, total, pagination)
  },
  { requireAuth: true, module: 'marketplace' }
)

export const POST = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const { data, errors } = await validateBody(request, productSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    const schoolFilter = getSchoolFilter(session)

    // Ensure the product belongs to the user's school
    const productData = {
      ...data!,
      schoolId: session?.user.schoolId || data!.schoolId,
    }

    // Validate school access
    if (schoolFilter.schoolId && productData.schoolId !== schoolFilter.schoolId) {
      return validationErrorResponse({
        schoolId: ['You can only create products for your school'],
      })
    }

    const product = await prisma.product.create({
      data: productData,
    })

    return successResponse(product, 201)
  },
  { requireAuth: true, module: 'marketplace' }
)
