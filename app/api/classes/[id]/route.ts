import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  successResponse,
  notFoundResponse,
  errorResponse,
  validationErrorResponse,
  validateBody,
  getSchoolFilter,
  hasMinimumRole,
  AuthenticatedSession,
} from '@/lib/api-utils'
import { classSchema } from '@/lib/validations'

const classUpdateSchema = classSchema.partial().omit({ schoolId: true })

export const GET = withApiHandler(
  async (_request: NextRequest, context, session: AuthenticatedSession | null) => {
    const { id } = await context.params
    const schoolFilter = getSchoolFilter(session)

    const classItem = await prisma.class.findFirst({
      where: {
        id,
        ...schoolFilter,
      },
      include: {
        school: { select: { id: true, name: true } },
        academicYear: { select: { id: true, name: true, isCurrent: true } },
        sections: {
          include: {
            teacher: {
              select: { id: true, firstName: true, lastName: true },
            },
            _count: { select: { students: true } },
          },
        },
        subjects: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: { students: true },
        },
      },
    })

    if (!classItem) {
      return notFoundResponse('Class not found')
    }

    return successResponse(classItem)
  },
  { requireAuth: true, module: 'classes' }
)

export const PUT = withApiHandler(
  async (request: NextRequest, context, session: AuthenticatedSession | null) => {
    const { id } = await context.params
    const schoolFilter = getSchoolFilter(session)

    const existingClass = await prisma.class.findFirst({
      where: {
        id,
        ...schoolFilter,
      },
    })

    if (!existingClass) {
      return notFoundResponse('Class not found')
    }

    const { data, errors } = await validateBody(request, classUpdateSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    if (!data) {
      return errorResponse('Invalid request body')
    }

    // Verify academic year belongs to school if being changed
    if (data.academicYearId && data.academicYearId !== existingClass.academicYearId) {
      const academicYear = await prisma.academicYear.findFirst({
        where: {
          id: data.academicYearId,
          schoolId: existingClass.schoolId,
        },
      })

      if (!academicYear) {
        return validationErrorResponse({
          academicYearId: ['Invalid academic year for this school'],
        })
      }
    }

    // Check for duplicate class name in same grade
    if ((data.name && data.name !== existingClass.name) || (data.grade && data.grade !== existingClass.grade)) {
      const duplicateClass = await prisma.class.findFirst({
        where: {
          schoolId: existingClass.schoolId,
          academicYearId: data.academicYearId || existingClass.academicYearId,
          grade: data.grade || existingClass.grade,
          name: data.name || existingClass.name,
          id: { not: id },
        },
      })

      if (duplicateClass) {
        return validationErrorResponse({
          name: ['Class with this name already exists for this grade'],
        })
      }
    }

    const classItem = await prisma.class.update({
      where: { id },
      data,
      include: {
        school: { select: { id: true, name: true } },
        academicYear: { select: { id: true, name: true } },
        sections: true,
      },
    })

    return successResponse(classItem)
  },
  { requireAuth: true, module: 'classes' }
)

export const DELETE = withApiHandler(
  async (_request: NextRequest, context, session: AuthenticatedSession | null) => {
    const { id } = await context.params
    const schoolFilter = getSchoolFilter(session)

    // Only principals and above can delete classes
    if (!session || !hasMinimumRole(session.user.role, 'PRINCIPAL')) {
      return errorResponse('Insufficient permissions', 403)
    }

    const existingClass = await prisma.class.findFirst({
      where: {
        id,
        ...schoolFilter,
      },
      include: {
        _count: { select: { students: true, sections: true } },
      },
    })

    if (!existingClass) {
      return notFoundResponse('Class not found')
    }

    // Prevent deletion if class has students
    if (existingClass._count.students > 0) {
      return errorResponse('Cannot delete class with enrolled students. Deactivate instead.', 400)
    }

    await prisma.class.delete({
      where: { id },
    })

    return successResponse({ message: 'Class deleted successfully' })
  },
  { requireAuth: true, module: 'classes' }
)
