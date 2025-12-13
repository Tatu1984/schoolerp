import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  successResponse,
  notFoundResponse,
  validateBody,
  validationErrorResponse,
} from '@/lib/api-utils'
import { subjectSchema } from '@/lib/validations'

// GET /api/subjects/[id] - Get a specific subject
export const GET = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    const subject = await prisma.subject.findFirst({
      where: {
        id: params.id,
        ...getSchoolFilter(session),
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
      },
    })

    if (!subject) {
      return notFoundResponse('Subject not found')
    }

    return successResponse(subject)
  },
  { module: 'subjects' }
)

// PUT /api/subjects/[id] - Update a subject
export const PUT = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    const { data, errors } = await validateBody(request, subjectSchema.partial())

    if (errors) {
      return validationErrorResponse(errors)
    }

    // Check if subject exists and belongs to user's school
    const existingSubject = await prisma.subject.findFirst({
      where: {
        id: params.id,
        ...getSchoolFilter(session),
      },
    })

    if (!existingSubject) {
      return notFoundResponse('Subject not found')
    }

    const subject = await prisma.subject.update({
      where: { id: params.id },
      data,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
      },
    })

    return successResponse(subject)
  },
  { module: 'subjects' }
)

// DELETE /api/subjects/[id] - Delete a subject
export const DELETE = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    // Check if subject exists and belongs to user's school
    const subject = await prisma.subject.findFirst({
      where: {
        id: params.id,
        ...getSchoolFilter(session),
      },
    })

    if (!subject) {
      return notFoundResponse('Subject not found')
    }

    await prisma.subject.delete({
      where: { id: params.id },
    })

    return successResponse({ message: 'Subject deleted successfully' })
  },
  { module: 'subjects' }
)
