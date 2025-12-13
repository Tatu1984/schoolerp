import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  getPaginationParams,
  paginatedResponse,
  successResponse,
  validationErrorResponse,
  validateBody,
} from '@/lib/api-utils'
import { admissionSchema } from '@/lib/validations'

export const GET = withApiHandler(
  async (request: NextRequest, context, session) => {
    const schoolFilter = getSchoolFilter(session)
    const { page, limit, skip } = getPaginationParams(request)

    const [applications, total] = await Promise.all([
      prisma.admissionProspect.findMany({
        where: {
          ...schoolFilter,
          status: { in: ['APPLICATION', 'ENTRANCE_TEST', 'INTERVIEW', 'APPROVED'] },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.admissionProspect.count({
        where: {
          ...schoolFilter,
          status: { in: ['APPLICATION', 'ENTRANCE_TEST', 'INTERVIEW', 'APPROVED'] },
        },
      }),
    ])

    return paginatedResponse(applications, total, { page, limit, skip })
  },
  { requireAuth: true, module: 'admissions' }
)

export const POST = withApiHandler(
  async (request: NextRequest, context, session) => {
    const { data, errors } = await validateBody(request, admissionSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    const application = await prisma.admissionProspect.create({
      data: {
        schoolId: session?.user.schoolId || data!.schoolId,
        inquiryNumber: data!.inquiryNumber,
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
        status: 'APPLICATION',
        email: data!.email,
        phone: data!.phone,
        testDate: data!.testDate ? new Date(data!.testDate) : undefined,
        testScore: data!.testScore,
        interviewDate: data!.interviewDate ? new Date(data!.interviewDate) : undefined,
        interviewNotes: data!.interviewNotes,
        documents: data!.documents,
      },
    })

    return successResponse(application, 201)
  },
  { requireAuth: true, module: 'admissions' }
)
