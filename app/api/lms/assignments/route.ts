import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  successResponse,
  validationErrorResponse,
  validateBody
} from '@/lib/api-utils'
import { assignmentSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'

export const GET = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    const schoolFilter = getSchoolFilter(session)

    const assignments = await prisma.assignment.findMany({
      where: schoolFilter.schoolId ? {
        course: { schoolId: schoolFilter.schoolId }
      } : {},
      include: {
        course: true,
        submissions: {
          include: {
            student: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return successResponse(assignments)
  },
  { requireAuth: true, module: 'lms' }
)

export const POST = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    // Validate request body
    const { data, errors } = await validateBody(request, assignmentSchema)
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

    const assignment = await prisma.assignment.create({
      data: {
        courseId: data!.courseId,
        title: data!.title,
        description: data!.description,
        dueDate: new Date(data!.dueDate),
        maxScore: data!.maxScore,
        attachments: data!.attachments as Prisma.InputJsonValue | undefined,
        isActive: data!.isActive,
      },
      include: {
        course: true,
      }
    })

    return successResponse(assignment, 201)
  },
  { requireAuth: true, module: 'lms' }
)
