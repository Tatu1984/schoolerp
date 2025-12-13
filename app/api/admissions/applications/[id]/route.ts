import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  validateBody,
} from '@/lib/api-utils'
import { admissionSchema } from '@/lib/validations'

export const PUT = withApiHandler(
  async (request: NextRequest, context, session) => {
    const { id } = context.params
    const schoolFilter = getSchoolFilter(session)
    const { data, errors } = await validateBody(request, admissionSchema.partial())

    if (errors) {
      return validationErrorResponse(errors)
    }

    // Check if application exists and belongs to user's school
    const existing = await prisma.admissionProspect.findFirst({
      where: { id, ...schoolFilter },
    })

    if (!existing) {
      return notFoundResponse('Application not found')
    }

    const application = await prisma.admissionProspect.update({
      where: { id },
      data: {
        firstName: data!.firstName,
        lastName: data!.lastName,
        dateOfBirth: data!.dateOfBirth ? new Date(data!.dateOfBirth) : undefined,
        gender: data!.gender,
        parentName: data!.parentName,
        parentPhone: data!.parentPhone,
        parentEmail: data!.parentEmail,
        address: data!.address,
        classAppliedFor: data!.classAppliedFor,
        previousSchool: data!.previousSchool,
        status: data!.status,
        email: data!.email,
        phone: data!.phone,
        testDate: data!.testDate ? new Date(data!.testDate) : undefined,
        testScore: data!.testScore,
        interviewDate: data!.interviewDate ? new Date(data!.interviewDate) : undefined,
        interviewNotes: data!.interviewNotes,
        documents: data!.documents,
      },
    })

    return successResponse(application)
  },
  { requireAuth: true, module: 'admissions' }
)

export const DELETE = withApiHandler(
  async (request: NextRequest, context, session) => {
    const { id } = context.params
    const schoolFilter = getSchoolFilter(session)

    // Check if application exists and belongs to user's school
    const existing = await prisma.admissionProspect.findFirst({
      where: { id, ...schoolFilter },
    })

    if (!existing) {
      return notFoundResponse('Application not found')
    }

    await prisma.admissionProspect.delete({
      where: { id },
    })

    return successResponse({ success: true })
  },
  { requireAuth: true, module: 'admissions' }
)
