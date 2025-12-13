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
import { hostelSchema } from '@/lib/validations'

export const GET = withApiHandler(
  async (_request: NextRequest, context, session) => {
    const { id } = context.params
    const schoolFilter = getSchoolFilter(session)

    const hostel = await prisma.hostel.findFirst({
      where: {
        id,
        ...schoolFilter,
      },
      include: {
        floors: {
          include: {
            rooms: {
              include: {
                beds: true,
              },
            },
          },
        },
        students: true,
      },
    })

    if (!hostel) {
      return notFoundResponse('Hostel not found')
    }

    return successResponse(hostel)
  },
  { requireAuth: true, module: 'hostel' }
)

export const PUT = withApiHandler(
  async (request: NextRequest, context, session) => {
    const { id } = context.params
    const schoolFilter = getSchoolFilter(session)

    // Check if hostel exists and belongs to user's school
    const existingHostel = await prisma.hostel.findFirst({
      where: {
        id,
        ...schoolFilter,
      },
    })

    if (!existingHostel) {
      return notFoundResponse('Hostel not found')
    }

    const { data, errors } = await validateBody(request, hostelSchema.partial())

    if (errors) {
      return validationErrorResponse(errors)
    }

    const hostel = await prisma.hostel.update({
      where: { id },
      data: data!,
    })

    return successResponse(hostel)
  },
  { requireAuth: true, module: 'hostel' }
)

export const DELETE = withApiHandler(
  async (_request: NextRequest, context, session) => {
    const { id } = context.params
    const schoolFilter = getSchoolFilter(session)

    // Check if hostel exists and belongs to user's school
    const existingHostel = await prisma.hostel.findFirst({
      where: {
        id,
        ...schoolFilter,
      },
    })

    if (!existingHostel) {
      return notFoundResponse('Hostel not found')
    }

    await prisma.hostel.delete({
      where: { id },
    })

    return successResponse({ success: true })
  },
  { requireAuth: true, module: 'hostel' }
)
