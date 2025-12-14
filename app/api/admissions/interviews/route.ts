import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
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

    const [interviews, total] = await Promise.all([
      prisma.admission.findMany({
        where: {
          ...schoolFilter,
          status: { in: ['INTERVIEW_SCHEDULED', 'APPROVED'] },
          interviewDate: { not: null },
        },
        orderBy: { interviewDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.admission.count({
        where: {
          ...schoolFilter,
          status: { in: ['INTERVIEW_SCHEDULED', 'APPROVED'] },
          interviewDate: { not: null },
        },
      }),
    ])

    return paginatedResponse(interviews, total, { page, limit, skip })
  },
  { requireAuth: true, module: 'admissions' }
)

export const POST = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const { data, errors } = await validateBody(request, admissionSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    const schoolId = session?.user.schoolId || data!.schoolId

    // Get the current academic year
    const currentAcademicYear = await prisma.academicYear.findFirst({
      where: { schoolId, isCurrent: true },
    })

    if (!currentAcademicYear) {
      return validationErrorResponse({ academicYear: ['No active academic year found'] })
    }

    const interview = await prisma.admission.create({
      data: {
        school: { connect: { id: schoolId } },
        academicYear: { connect: { id: currentAcademicYear.id } },
        inquiryNumber: data!.inquiryNumber,
        firstName: data!.firstName,
        lastName: data!.lastName,
        dateOfBirth: data!.dateOfBirth ? new Date(data!.dateOfBirth) : new Date(),
        gender: data!.gender || 'OTHER',
        parentName: data!.parentName,
        parentPhone: data!.parentPhone,
        parentEmail: data!.parentEmail,
        address: data!.address,
        appliedClass: data!.appliedClass,
        previousSchool: data!.previousSchool,
        status: 'INTERVIEW_SCHEDULED',
        testDate: data!.testDate ? new Date(data!.testDate) : undefined,
        testScore: data!.testScore,
        interviewDate: data!.interviewDate ? new Date(data!.interviewDate) : undefined,
        interviewNotes: data!.interviewNotes,
      },
    })

    return successResponse(interview, 201)
  },
  { requireAuth: true, module: 'admissions' }
)
