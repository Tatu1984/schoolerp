import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  successResponse,
  validationErrorResponse,
  validateBody,
  notFoundResponse,
} from '@/lib/api-utils'
import { routeSchema } from '@/lib/validations'

export const PUT = withApiHandler(
  async (request: NextRequest, context, session) => {
    const { id } = context.params
    const schoolFilter = getSchoolFilter(session)

    // Check if route exists and belongs to user's school
    const existingRoute = await prisma.route.findFirst({
      where: {
        id,
        ...schoolFilter,
      },
    })

    if (!existingRoute) {
      return notFoundResponse('Route not found')
    }

    const { data, errors } = await validateBody(request, routeSchema.partial())

    if (errors) {
      return validationErrorResponse(errors)
    }

    const route = await prisma.route.update({
      where: { id },
      data: data!,
    })

    return successResponse(route)
  },
  { requireAuth: true, module: 'transport' }
)

export const DELETE = withApiHandler(
  async (_request: NextRequest, context, session) => {
    const { id } = context.params
    const schoolFilter = getSchoolFilter(session)

    // Check if route exists and belongs to user's school
    const existingRoute = await prisma.route.findFirst({
      where: {
        id,
        ...schoolFilter,
      },
    })

    if (!existingRoute) {
      return notFoundResponse('Route not found')
    }

    await prisma.route.delete({
      where: { id },
    })

    return successResponse({ message: 'Route deleted successfully' })
  },
  { requireAuth: true, module: 'transport' }
)
