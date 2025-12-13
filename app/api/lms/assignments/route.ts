import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  getPaginationParams,
  successResponse,
  validationErrorResponse,
  validateBody
} from '@/lib/api-utils'
import { assignmentSchema } from '@/lib/validations'

export const GET = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    const schoolFilter = getSchoolFilter(session)

    const assignments = await prisma.assignment.findMany({
      where: schoolFilter,
      include: {
        course: true,
        class: true,
        section: true,
        createdBy: true,
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
  { module: 'lms' }
)

export const POST = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    // Validate request body
    const { data, errors } = await validateBody(request, assignmentSchema)
    if (errors) {
      return validationErrorResponse(errors)
    }

    const schoolFilter = getSchoolFilter(session)

    // Apply school filter
    const assignmentData = {
      ...data!,
      schoolId: session?.user.schoolId,
      createdById: session?.user.id,
      dueDate: data!.dueDate ? new Date(data!.dueDate) : null,
      totalMarks: data!.totalMarks,
    }

    const assignment = await prisma.assignment.create({
      data: assignmentData,
      include: {
        course: true,
        class: true,
        section: true,
        createdBy: true
      }
    })

    return successResponse(assignment, 201)
  },
  { module: 'lms' }
)
