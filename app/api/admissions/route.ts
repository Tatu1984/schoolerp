import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  successResponse,
  errorResponse,
  validationErrorResponse,
  validateBody,
  getPaginationParams,
  paginatedResponse,
  getSearchParams,
  getSortParams,
  getSchoolFilter,
  AuthenticatedSession,
} from '@/lib/api-utils'
import { admissionSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const pagination = getPaginationParams(request)
    const searchParams = getSearchParams(request)
    const orderBy = getSortParams(request, ['createdAt', 'firstName', 'lastName', 'status'])
    const schoolFilter = getSchoolFilter(session)

    const where: Prisma.AdmissionWhereInput = {
      ...schoolFilter,
      ...(searchParams.search && {
        OR: [
          { firstName: { contains: searchParams.search, mode: 'insensitive' } },
          { lastName: { contains: searchParams.search, mode: 'insensitive' } },
          { inquiryNumber: { contains: searchParams.search, mode: 'insensitive' } },
          { parentName: { contains: searchParams.search, mode: 'insensitive' } },
          { parentEmail: { contains: searchParams.search, mode: 'insensitive' } },
        ],
      }),
      ...(searchParams.status && { status: searchParams.status as Prisma.EnumAdmissionStatusFilter }),
      ...(searchParams.appliedClass && { appliedClass: searchParams.appliedClass }),
    }

    const [admissions, total] = await Promise.all([
      prisma.admission.findMany({
        where,
        include: {
          school: { select: { id: true, name: true } },
          academicYear: { select: { id: true, name: true } },
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              admissionNumber: true,
            },
          },
        },
        orderBy,
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.admission.count({ where }),
    ])

    return paginatedResponse(admissions, total, pagination)
  },
  { requireAuth: true, module: 'admissions' }
)

export const POST = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const { data, errors } = await validateBody(request, admissionSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    if (!data) {
      return errorResponse('Invalid request body')
    }

    const schoolId = data.schoolId || session?.user.schoolId
    if (!schoolId) {
      return errorResponse('School ID is required')
    }

    // Generate unique inquiry number
    const lastAdmission = await prisma.admission.findFirst({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
      select: { inquiryNumber: true },
    })

    let inquiryNumber = data.inquiryNumber
    if (!inquiryNumber) {
      const year = new Date().getFullYear().toString().slice(-2)
      const count = lastAdmission
        ? parseInt(lastAdmission.inquiryNumber.slice(-4)) + 1
        : 1
      inquiryNumber = `INQ${year}${count.toString().padStart(4, '0')}`
    }

    // Check for duplicate inquiry number
    const existingAdmission = await prisma.admission.findFirst({
      where: {
        schoolId,
        inquiryNumber,
      },
    })

    if (existingAdmission) {
      return validationErrorResponse({
        inquiryNumber: ['Inquiry number already exists'],
      })
    }

    const admission = await prisma.admission.create({
      data: {
        ...data,
        schoolId,
        inquiryNumber,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        testDate: data.testDate ? new Date(data.testDate) : null,
        interviewDate: data.interviewDate ? new Date(data.interviewDate) : null,
      },
      include: {
        school: { select: { id: true, name: true } },
      },
    })

    return successResponse(admission, 201)
  },
  { requireAuth: true, module: 'admissions' }
)
