import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
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

    // Check if application exists and belongs to user's school
    const existing = await prisma.admission.findFirst({
      where: { id, ...schoolFilter },
    })

    if (!existing) {
      return notFoundResponse('Application not found')
    }

    // Extract documents and handle null specifically for Prisma JSON fields
    const { documents, ...restData } = data!

    const updateData: Prisma.AdmissionUpdateInput = {
      firstName: restData.firstName,
      lastName: restData.lastName,
      dateOfBirth: restData.dateOfBirth ? new Date(restData.dateOfBirth) : undefined,
      gender: restData.gender,
      parentName: restData.parentName,
      parentPhone: restData.parentPhone,
      parentEmail: restData.parentEmail,
      address: restData.address,
      appliedClass: restData.appliedClass,
      previousSchool: restData.previousSchool,
      status: restData.status,
      testDate: restData.testDate ? new Date(restData.testDate) : undefined,
      testScore: restData.testScore,
      interviewDate: restData.interviewDate ? new Date(restData.interviewDate) : undefined,
      interviewNotes: restData.interviewNotes,
    }

    // Handle documents field - Prisma requires special handling for nullable JSON
    if (documents !== undefined) {
      updateData.documents = documents === null
        ? Prisma.JsonNull
        : (documents as Prisma.InputJsonValue)
    }

    const application = await prisma.admission.update({
      where: { id },
      data: updateData,
    })

    return successResponse(application)
  },
  { requireAuth: true, module: 'admissions' }
)

export const DELETE = withApiHandler(
  async (_request: NextRequest, context, session: AuthenticatedSession | null) => {
    const { id } = await context.params
    const schoolFilter = getSchoolFilter(session)

    // Check if application exists and belongs to user's school
    const existing = await prisma.admission.findFirst({
      where: { id, ...schoolFilter },
    })

    if (!existing) {
      return notFoundResponse('Application not found')
    }

    await prisma.admission.delete({
      where: { id },
    })

    return successResponse({ success: true })
  },
  { requireAuth: true, module: 'admissions' }
)
