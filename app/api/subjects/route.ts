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
  getSchoolFilter,
  AuthenticatedSession,
} from '@/lib/api-utils'
import { subjectSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const pagination = getPaginationParams(request)
    const searchParams = getSearchParams(request)
    const schoolFilter = getSchoolFilter(session)

    const where: Prisma.SubjectWhereInput = {
      ...schoolFilter,
      ...(searchParams.search && {
        OR: [
          { name: { contains: searchParams.search, mode: 'insensitive' } },
          { code: { contains: searchParams.search, mode: 'insensitive' } },
        ],
      }),
      ...(searchParams.classId && { classId: searchParams.classId }),
      ...(searchParams.isActive !== undefined && { isActive: searchParams.isActive === 'true' }),
    }

    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        include: {
          school: { select: { id: true, name: true } },
          class: { select: { id: true, name: true, grade: true } },
        },
        orderBy: { name: 'asc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.subject.count({ where }),
    ])

    return paginatedResponse(subjects, total, pagination)
  },
  { requireAuth: true, module: 'subjects' }
)

export const POST = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const { data, errors } = await validateBody(request, subjectSchema)

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

    // Verify class belongs to school if provided
    if (data.classId) {
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
    }

    // Check for duplicate subject code in school
    const existingSubject = await prisma.subject.findFirst({
      where: {
        schoolId,
        code: data.code,
      },
    })

    if (existingSubject) {
      return validationErrorResponse({
        code: ['Subject code already exists in this school'],
      })
    }

    const subject = await prisma.subject.create({
      data: {
        ...data,
        schoolId,
      },
      include: {
        school: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
      },
    })

    return successResponse(subject, 201)
  },
  { requireAuth: true, module: 'subjects' }
)
