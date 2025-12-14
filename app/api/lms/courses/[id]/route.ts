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
  { requireAuth: true, module: 'lms' }
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

    const updateData: Record<string, unknown> = {}
    if (data!.name !== undefined) updateData.name = data!.name
    if (data!.code !== undefined) updateData.code = data!.code
    if (data!.description !== undefined) updateData.description = data!.description
    if (data!.classId !== undefined) updateData.classId = data!.classId
    if (data!.subjectId !== undefined) updateData.subjectId = data!.subjectId
    if (data!.teacherId !== undefined) updateData.teacherId = data!.teacherId
    if (data!.startDate !== undefined) updateData.startDate = data!.startDate ? new Date(data!.startDate) : null
    if (data!.endDate !== undefined) updateData.endDate = data!.endDate ? new Date(data!.endDate) : null
    if (data!.isActive !== undefined) updateData.isActive = data!.isActive

    const course = await prisma.course.update({
      where: { id: params.id },
      data: updateData
    })

    return successResponse(course)
  },
  { requireAuth: true, module: 'lms' }
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
  { requireAuth: true, module: 'lms' }
)
