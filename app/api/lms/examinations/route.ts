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

    // Exams don't have schoolId directly - filter through course
    const exams = await prisma.exam.findMany({
      where: schoolFilter.schoolId ? {
        course: { schoolId: schoolFilter.schoolId }
      } : {},
      include: {
        course: true,
        results: {
          include: {
            student: true,
          }
        }
      },
      orderBy: { examDate: 'desc' }
    })

    return successResponse(exams)
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

    // Verify course exists and belongs to user's school
    const course = await prisma.course.findFirst({
      where: {
        id: data!.courseId,
        ...(session?.user.schoolId && { schoolId: session.user.schoolId }),
      }
    })

    if (!course) {
      return validationErrorResponse({ courseId: ['Course not found'] })
    }

    const exam = await prisma.exam.create({
      data: {
        courseId: data!.courseId,
        title: data!.title,
        description: data!.description,
        examDate: new Date(data!.examDate),
        duration: data!.duration,
        maxScore: data!.maxScore,
        isActive: data!.isActive,
      },
      include: {
        course: true,
      }
    })

    return successResponse(exam, 201)
  },
  { module: 'lms' }
)
