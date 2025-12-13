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
import { sectionSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const pagination = getPaginationParams(request)
    const searchParams = getSearchParams(request)
    const schoolFilter = getSchoolFilter(session)

    const where: Prisma.SectionWhereInput = {
      class: schoolFilter.schoolId ? { schoolId: schoolFilter.schoolId } : undefined,
      ...(searchParams.classId && { classId: searchParams.classId }),
      ...(searchParams.isActive !== undefined && { isActive: searchParams.isActive === 'true' }),
    }

    const [sections, total] = await Promise.all([
      prisma.section.findMany({
        where,
        include: {
          class: {
            select: {
              id: true,
              name: true,
              grade: true,
              academicYear: { select: { id: true, name: true } },
            },
          },
          teacher: {
            select: { id: true, firstName: true, lastName: true },
          },
          _count: { select: { students: true } },
        },
        orderBy: { name: 'asc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.section.count({ where }),
    ])

    return paginatedResponse(sections, total, pagination)
  },
  { requireAuth: true, module: 'sections' }
)

export const POST = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const { data, errors } = await validateBody(request, sectionSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    if (!data) {
      return errorResponse('Invalid request body')
    }

    // Verify class exists and belongs to user's school
    const classItem = await prisma.class.findFirst({
      where: {
        id: data.classId,
        ...(session?.user.role !== 'SUPER_ADMIN' ? { schoolId: session?.user.schoolId } : {}),
      },
    })

    if (!classItem) {
      return validationErrorResponse({
        classId: ['Invalid class'],
      })
    }

    // Verify teacher exists if provided
    if (data.teacherId) {
      const teacher = await prisma.staff.findFirst({
        where: {
          id: data.teacherId,
          schoolId: classItem.schoolId,
          staffType: 'TEACHING',
        },
      })

      if (!teacher) {
        return validationErrorResponse({
          teacherId: ['Invalid teacher'],
        })
      }
    }

    // Check for duplicate section name in same class
    const existingSection = await prisma.section.findFirst({
      where: {
        classId: data.classId,
        name: data.name,
      },
    })

    if (existingSection) {
      return validationErrorResponse({
        name: ['Section with this name already exists in this class'],
      })
    }

    const section = await prisma.section.create({
      data,
      include: {
        class: { select: { id: true, name: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return successResponse(section, 201)
  },
  { requireAuth: true, module: 'sections' }
)
