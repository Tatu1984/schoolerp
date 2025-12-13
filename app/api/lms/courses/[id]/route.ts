import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  successResponse,
  validationErrorResponse,
  validateBody,
  notFoundResponse
} from '@/lib/api-utils'
import { courseSchema } from '@/lib/validations'

export const GET = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    const schoolFilter = getSchoolFilter(session)

    const course = await prisma.course.findFirst({
      where: {
        id: params.id,
        ...schoolFilter
      },
      include: {
        assignments: true,
        exams: true
      }
    })

    if (!course) {
      return notFoundResponse('Course not found')
    }

    return successResponse(course)
  },
  { module: 'lms' }
)

export const PUT = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    const schoolFilter = getSchoolFilter(session)

    // Check if course exists and user has access
    const existingCourse = await prisma.course.findFirst({
      where: {
        id: params.id,
        ...schoolFilter
      }
    })

    if (!existingCourse) {
      return notFoundResponse('Course not found')
    }

    // Validate request body
    const { data, errors } = await validateBody(request, courseSchema.partial())
    if (errors) {
      return validationErrorResponse(errors)
    }

    const course = await prisma.course.update({
      where: { id: params.id },
      data: data!
    })

    return successResponse(course)
  },
  { module: 'lms' }
)

export const DELETE = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    const schoolFilter = getSchoolFilter(session)

    // Check if course exists and user has access
    const existingCourse = await prisma.course.findFirst({
      where: {
        id: params.id,
        ...schoolFilter
      }
    })

    if (!existingCourse) {
      return notFoundResponse('Course not found')
    }

    await prisma.course.delete({
      where: { id: params.id }
    })

    return successResponse({ success: true })
  },
  { module: 'lms' }
)
