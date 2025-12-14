import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  validateBody,
  AuthenticatedSession,
} from '@/lib/api-utils'
import { admissionSchema } from '@/lib/validations'

export const PUT = withApiHandler(
  async (request: NextRequest, context, session: AuthenticatedSession | null) => {
    const { id } = await context.params
    const schoolFilter = getSchoolFilter(session)
    const { data, errors } = await validateBody(request, admissionSchema.partial())

    if (errors) {
      return validationErrorResponse(errors)
    }

    // Check if test record exists and belongs to user's school
    const existing = await prisma.admission.findFirst({
      where: { id, ...schoolFilter },
    })

    if (!existing) {
      return notFoundResponse('Test record not found')
    }

    const test = await prisma.admission.update({
      where: { id },
      data: {
        ...(data!.firstName && { firstName: data!.firstName }),
        ...(data!.lastName && { lastName: data!.lastName }),
        ...(data!.dateOfBirth && { dateOfBirth: new Date(data!.dateOfBirth) }),
        ...(data!.gender && { gender: data!.gender }),
        ...(data!.parentName && { parentName: data!.parentName }),
        ...(data!.parentPhone && { parentPhone: data!.parentPhone }),
        ...(data!.parentEmail !== undefined && { parentEmail: data!.parentEmail }),
        ...(data!.address !== undefined && { address: data!.address }),
        ...(data!.appliedClass && { appliedClass: data!.appliedClass }),
        ...(data!.previousSchool !== undefined && { previousSchool: data!.previousSchool }),
        ...(data!.status && { status: data!.status }),
        ...(data!.testDate && { testDate: new Date(data!.testDate) }),
        ...(data!.testScore !== undefined && { testScore: data!.testScore }),
        ...(data!.interviewDate && { interviewDate: new Date(data!.interviewDate) }),
        ...(data!.interviewNotes !== undefined && { interviewNotes: data!.interviewNotes }),
      },
    })

    return successResponse(test)
  },
  { requireAuth: true, module: 'admissions' }
)

export const DELETE = withApiHandler(
  async (_request: NextRequest, context, session: AuthenticatedSession | null) => {
    const { id } = await context.params
    const schoolFilter = getSchoolFilter(session)

    // Check if test record exists and belongs to user's school
    const existing = await prisma.admission.findFirst({
      where: { id, ...schoolFilter },
    })

    if (!existing) {
      return notFoundResponse('Test record not found')
    }

    await prisma.admission.delete({
      where: { id },
    })

    return successResponse({ success: true })
  },
  { requireAuth: true, module: 'admissions' }
)
