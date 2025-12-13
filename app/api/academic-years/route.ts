import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  successResponse,
  validationErrorResponse,
  validateBody
} from '@/lib/api-utils'
import { academicYearSchema } from '@/lib/validations'

export const GET = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    const schoolFilter = getSchoolFilter(session)

    const years = await prisma.academicYear.findMany({
      where: schoolFilter,
      include: {
        school: true
      },
      orderBy: { startDate: 'desc' }
    })

    return successResponse(years)
  },
  { module: 'academic-years' }
)

export const POST = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    // Validate request body
    const { data, errors } = await validateBody(request, academicYearSchema)
    if (errors) {
      return validationErrorResponse(errors)
    }

    // Apply school filter - use provided schoolId or user's schoolId
    const schoolId = data!.schoolId || session?.user.schoolId!

    // If this is set as current, unset all others
    if (data!.isCurrent) {
      await prisma.academicYear.updateMany({
        where: { schoolId },
        data: { isCurrent: false }
      })
    }

    const yearData = {
      ...data!,
      schoolId,
      startDate: new Date(data!.startDate),
      endDate: new Date(data!.endDate),
    }

    const year = await prisma.academicYear.create({
      data: yearData,
      include: {
        school: true
      }
    })

    return successResponse(year, 201)
  },
  { module: 'academic-years' }
)
