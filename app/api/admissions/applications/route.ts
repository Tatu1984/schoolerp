import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import {
  withApiHandler,
  getSchoolFilter,
  getPaginationParams,
  paginatedResponse,
  successResponse,
  validationErrorResponse,
  validateBody,
  AuthenticatedSession,
} from '@/lib/api-utils'
import { admissionSchema } from '@/lib/validations'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const schoolFilter = getSchoolFilter(session)
    const { page, limit, skip } = getPaginationParams(request)

    const [applications, total] = await Promise.all([
      prisma.admission.findMany({
        where: {
          ...schoolFilter,
          status: { in: ['PROSPECT', 'TEST_SCHEDULED', 'TEST_COMPLETED', 'INTERVIEW_SCHEDULED', 'APPROVED'] },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.admission.count({
        where: {
          ...schoolFilter,
          status: { in: ['PROSPECT', 'TEST_SCHEDULED', 'TEST_COMPLETED', 'INTERVIEW_SCHEDULED', 'APPROVED'] },
        },
      }),
    ])

    return paginatedResponse(applications, total, { page, limit, skip })
  },
  { requireAuth: true, module: 'admissions' }
)

export const POST = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const { data, errors } = await validateBody(request, admissionSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    // Get the current academic year
    const currentAcademicYear = await prisma.academicYear.findFirst({
      where: {
        schoolId: session?.user.schoolId || data!.schoolId,
        isCurrent: true,
      },
    })

    if (!currentAcademicYear) {
      return validationErrorResponse({ academicYear: ['No active academic year found'] })
    }

    // Extract documents and handle null specifically for Prisma JSON fields
    const { documents, ...restData } = data!

    const createData: Prisma.AdmissionCreateInput = {
      school: { connect: { id: session?.user.schoolId || restData.schoolId } },
      academicYear: { connect: { id: currentAcademicYear.id } },
      inquiryNumber: restData.inquiryNumber,
      firstName: restData.firstName,
      lastName: restData.lastName,
      dateOfBirth: restData.dateOfBirth ? new Date(restData.dateOfBirth) : new Date(),
      gender: restData.gender || 'OTHER',
      parentName: restData.parentName,
      parentPhone: restData.parentPhone,
      parentEmail: restData.parentEmail,
      address: restData.address,
      appliedClass: restData.appliedClass,
      previousSchool: restData.previousSchool,
      status: 'PROSPECT',
      testDate: restData.testDate ? new Date(restData.testDate) : undefined,
      testScore: restData.testScore,
      interviewDate: restData.interviewDate ? new Date(restData.interviewDate) : undefined,
      interviewNotes: restData.interviewNotes,
    }

    // Handle documents field - Prisma requires special handling for nullable JSON
    if (documents !== undefined) {
      createData.documents = documents === null
        ? Prisma.JsonNull
        : (documents as Prisma.InputJsonValue)
    }

    const application = await prisma.admission.create({
      data: createData,
    })

    return successResponse(application, 201)
  },
  { requireAuth: true, module: 'admissions' }
)
