import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  successResponse,
  validationErrorResponse,
  validateBody
} from '@/lib/api-utils'
import { examSchema } from '@/lib/validations'

export const GET = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    const schoolFilter = getSchoolFilter(session)

    const examinations = await prisma.examination.findMany({
      where: schoolFilter,
      include: {
        course: true,
        class: true,
        section: true,
        results: {
          include: {
            student: true,
          }
        }
      },
      orderBy: { examDate: 'desc' }
    })

    return successResponse(examinations)
  },
  { module: 'lms' }
)

export const POST = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    // Validate request body
    const { data, errors } = await validateBody(request, examSchema)
    if (errors) {
      return validationErrorResponse(errors)
    }

    const examinationData = {
      ...data!,
      schoolId: session?.user.schoolId!,
      examDate: data!.examDate ? new Date(data!.examDate) : new Date(),
      totalMarks: data!.totalMarks,
      duration: data!.duration,
      passingMarks: data!.passingMarks,
    }

    const examination = await prisma.examination.create({
      data: examinationData,
      include: {
        course: true,
        class: true,
        section: true
      }
    })

    return successResponse(examination, 201)
  },
  { module: 'lms' }
)
