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
import { studentSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const pagination = getPaginationParams(request)
    const searchParams = getSearchParams(request)
    const orderBy = getSortParams(request, ['createdAt', 'firstName', 'lastName', 'admissionNumber'])
    const schoolFilter = getSchoolFilter(session)

    // Build where clause
    const where: Prisma.StudentWhereInput = {
      ...schoolFilter,
      ...(searchParams.search && {
        OR: [
          { firstName: { contains: searchParams.search, mode: 'insensitive' } },
          { lastName: { contains: searchParams.search, mode: 'insensitive' } },
          { admissionNumber: { contains: searchParams.search, mode: 'insensitive' } },
          { email: { contains: searchParams.search, mode: 'insensitive' } },
        ],
      }),
      ...(searchParams.classId && { classId: searchParams.classId }),
      ...(searchParams.sectionId && { sectionId: searchParams.sectionId }),
      ...(searchParams.isActive !== undefined && { isActive: searchParams.isActive === 'true' }),
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          school: { select: { id: true, name: true } },
          class: {
            select: {
              id: true,
              name: true,
              grade: true,
              academicYear: { select: { id: true, name: true } },
            },
          },
          section: { select: { id: true, name: true } },
          guardians: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              relationship: true,
              phone: true,
              isPrimary: true,
            },
          },
        },
        orderBy,
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.student.count({ where }),
    ])

    return paginatedResponse(students, total, pagination)
  },
  { requireAuth: true, module: 'students' }
)

export const POST = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const { data, errors } = await validateBody(request, studentSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    if (!data) {
      return errorResponse('Invalid request body')
    }

    // Use session's school ID if not provided (and not super admin)
    const schoolId = data.schoolId || session?.user.schoolId
    if (!schoolId) {
      return errorResponse('School ID is required')
    }

    // Check if admission number is unique within the school
    const existingStudent = await prisma.student.findFirst({
      where: {
        schoolId,
        admissionNumber: data.admissionNumber,
      },
    })

    if (existingStudent) {
      return validationErrorResponse({
        admissionNumber: ['Admission number already exists in this school'],
      })
    }

    // Verify the class belongs to the school
    const classExists = await prisma.class.findFirst({
      where: {
        id: data.classId,
        schoolId,
      },
    })

    if (!classExists) {
      return validationErrorResponse({
        classId: ['Invalid class for this school'],
      })
    }

    const student = await prisma.student.create({
      data: {
        ...data,
        schoolId,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date(),
        admissionDate: data.admissionDate ? new Date(data.admissionDate) : new Date(),
      },
      include: {
        school: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
        guardians: true,
      },
    })

    return successResponse(student, 201)
  },
  { requireAuth: true, module: 'students' }
)
