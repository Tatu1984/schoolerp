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
import { academicYearSchema } from '@/lib/validations'

export const PUT = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    const schoolFilter = getSchoolFilter(session)

    // Check if academic year exists and user has access
    const existingYear = await prisma.academicYear.findFirst({
      where: {
        id: params.id,
        ...schoolFilter
      }
    })

    if (!existingYear) {
      return notFoundResponse('Academic year not found')
    }

    // Validate request body
    const { data, errors } = await validateBody(request, academicYearSchema.partial().omit({ schoolId: true }))
    if (errors) {
      return validationErrorResponse(errors)
    }

    // If this is set as current, unset all others
    if (data!.isCurrent) {
      await prisma.academicYear.updateMany({
        where: { schoolId: existingYear.schoolId },
        data: { isCurrent: false }
      })
    }

    const updateData: any = { ...data }
    if (data!.startDate) {
      updateData.startDate = new Date(data!.startDate)
    }
    if (data!.endDate) {
      updateData.endDate = new Date(data!.endDate)
    }

    const updatedYear = await prisma.academicYear.update({
      where: { id: params.id },
      data: updateData,
      include: {
        school: true
      }
    })

    return successResponse(updatedYear)
  },
  { requireAuth: true, module: 'academic-years' }
)

export const DELETE = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    const schoolFilter = getSchoolFilter(session)

    // Check if academic year exists and user has access
    const existingYear = await prisma.academicYear.findFirst({
      where: {
        id: params.id,
        ...schoolFilter
      }
    })

    if (!existingYear) {
      return notFoundResponse('Academic year not found')
    }

    await prisma.academicYear.delete({
      where: { id: params.id }
    })

    return successResponse({ message: 'Academic year deleted successfully' })
  },
  { requireAuth: true, module: 'academic-years' }
)
