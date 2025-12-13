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
import { sectionSchema } from '@/lib/validations'

// GET /api/sections/[id] - Get a specific section
export const GET = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    const section = await prisma.section.findFirst({
      where: {
        id: params.id,
        ...getSchoolFilter(session),
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    if (!section) {
      return notFoundResponse('Section not found')
    }

    return successResponse(section)
  },
  { module: 'sections' }
)

// PUT /api/sections/[id] - Update a section
export const PUT = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    const { data, errors } = await validateBody(request, sectionSchema.partial())

    if (errors) {
      return validationErrorResponse(errors)
    }

    // Check if section exists and belongs to user's school
    const existingSection = await prisma.section.findFirst({
      where: {
        id: params.id,
        ...getSchoolFilter(session),
      },
    })

    if (!existingSection) {
      return notFoundResponse('Section not found')
    }

    const section = await prisma.section.update({
      where: { id: params.id },
      data: {
        ...data,
        capacity: data?.capacity ? parseInt(String(data.capacity)) : undefined,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    return successResponse(section)
  },
  { module: 'sections' }
)

// DELETE /api/sections/[id] - Delete a section
export const DELETE = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    // Check if section exists and belongs to user's school
    const section = await prisma.section.findFirst({
      where: {
        id: params.id,
        ...getSchoolFilter(session),
      },
    })

    if (!section) {
      return notFoundResponse('Section not found')
    }

    await prisma.section.delete({
      where: { id: params.id },
    })

    return successResponse({ message: 'Section deleted successfully' })
  },
  { module: 'sections' }
)
