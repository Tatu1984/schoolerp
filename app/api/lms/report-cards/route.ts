import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  successResponse,
  validationErrorResponse,
  validateBody
} from '@/lib/api-utils'
import { reportCardSchema } from '@/lib/validations'

export const GET = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    const schoolFilter = getSchoolFilter(session)

    const reportCards = await prisma.reportCard.findMany({
      where: {
        student: schoolFilter
      },
      include: {
        student: true,
        academicYear: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return successResponse(reportCards)
  },
  { module: 'lms' }
)

export const POST = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    // Validate request body
    const { data, errors } = await validateBody(request, reportCardSchema)
    if (errors) {
      return validationErrorResponse(errors)
    }

    const reportCard = await prisma.reportCard.create({
      data: data!,
      include: {
        student: true,
        academicYear: true
      }
    })

    return successResponse(reportCard, 201)
  },
  { module: 'lms' }
)
