import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  getPaginationParams,
  successResponse,
  validationErrorResponse,
  validateBody,
  AuthenticatedSession,
  paginatedResponse,
  getSortParams,
} from '@/lib/api-utils'
import { menuItemSchema } from '@/lib/validations'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const schoolFilter = getSchoolFilter(session)
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isAvailable = searchParams.get('isAvailable')
    const pagination = getPaginationParams(request)
    const sort = getSortParams(request, ['category', 'name', 'price', 'createdAt'])

    const where: any = {
      ...schoolFilter,
      isActive: true,
    }

    if (category) {
      where.category = category
    }

    if (isAvailable !== null) {
      where.isAvailable = isAvailable === 'true'
    }

    const [menuItems, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        orderBy: sort,
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.menuItem.count({ where }),
    ])

    return paginatedResponse(menuItems, total, pagination)
  },
  { requireAuth: true, module: 'canteen' }
)

export const POST = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const { data, errors } = await validateBody(request, menuItemSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        ...data!,
        schoolId: session!.user.schoolId || data!.schoolId,
      },
    })

    return successResponse(menuItem, 201)
  },
  { requireAuth: true, module: 'canteen' }
)
