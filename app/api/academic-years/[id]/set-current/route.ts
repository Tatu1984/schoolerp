import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  successResponse,
  notFoundResponse
} from '@/lib/api-utils'

export const POST = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    const schoolFilter = getSchoolFilter(session)

    // Check if academic year exists and user has access
    const year = await prisma.academicYear.findFirst({
      where: {
        id: params.id,
        ...schoolFilter
      }
    })

    if (!year) {
      return notFoundResponse('Academic year not found')
    }

    // Unset all current years for this school
    await prisma.academicYear.updateMany({
      where: { schoolId: year.schoolId },
      data: { isCurrent: false }
    })

    // Set this year as current
    const updatedYear = await prisma.academicYear.update({
      where: { id: params.id },
      data: { isCurrent: true },
      include: {
        school: true
      }
    })

    return successResponse(updatedYear)
  },
  { module: 'academic-years' }
)
