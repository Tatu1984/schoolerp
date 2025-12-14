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
import { Prisma } from '@prisma/client'

export const GET = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    const schoolFilter = getSchoolFilter(session)

    const reportCards = await prisma.reportCard.findMany({
      where: schoolFilter.schoolId ? {
        student: { schoolId: schoolFilter.schoolId }
      } : {},
      include: {
        student: true,
        academicYear: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return successResponse(reportCards)
  },
  { requireAuth: true, module: 'lms' }
)

export const POST = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    // Validate request body
    const { data, errors } = await validateBody(request, reportCardSchema)
    if (errors) {
      return validationErrorResponse(errors)
    }

    // Verify student exists and belongs to user's school
    const student = await prisma.student.findFirst({
      where: {
        id: data!.studentId,
        ...(session?.user.schoolId && { schoolId: session.user.schoolId }),
      }
    })

    if (!student) {
      return validationErrorResponse({ studentId: ['Student not found'] })
    }

    const reportCard = await prisma.reportCard.create({
      data: {
        studentId: data!.studentId,
        academicYearId: data!.academicYearId,
        term: data!.term,
        grades: data!.grades as Prisma.InputJsonValue,
        overallScore: data!.overallScore,
        remarks: data!.remarks,
        isPublished: data!.isPublished,
      },
      include: {
        student: true,
        academicYear: true
      }
    })

    return successResponse(reportCard, 201)
  },
  { requireAuth: true, module: 'lms' }
)
