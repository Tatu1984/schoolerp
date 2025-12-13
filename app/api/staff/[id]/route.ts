import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
  validateBody,
  getSchoolFilter,
  hasMinimumRole,
  AuthenticatedSession,
} from '@/lib/api-utils'
import { staffUpdateSchema } from '@/lib/validations'

export const GET = withApiHandler(
  async (_request: NextRequest, context, session: AuthenticatedSession | null) => {
    const { id } = await context.params
    const schoolFilter = getSchoolFilter(session)

    const staff = await prisma.staff.findFirst({
      where: {
        id,
        ...schoolFilter,
      },
      include: {
        school: { select: { id: true, name: true, code: true } },
        branch: { select: { id: true, name: true } },
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            lastLogin: true,
          },
        },
        attendance: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        leaves: {
          orderBy: { startDate: 'desc' },
          take: 10,
        },
        payroll: {
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
          take: 12,
        },
      },
    })

    if (!staff) {
      return notFoundResponse('Staff member not found')
    }

    // Only show sensitive data to admins
    if (session && hasMinimumRole(session.user.role, 'PRINCIPAL')) {
      return successResponse(staff)
    }

    // Remove sensitive fields for non-admins
    const { salary, bankDetails, ...sanitizedStaff } = staff
    return successResponse(sanitizedStaff)
  },
  { requireAuth: true, module: 'staff' }
)

export const PUT = withApiHandler(
  async (request: NextRequest, context, session: AuthenticatedSession | null) => {
    const { id } = await context.params
    const schoolFilter = getSchoolFilter(session)

    const existingStaff = await prisma.staff.findFirst({
      where: {
        id,
        ...schoolFilter,
      },
    })

    if (!existingStaff) {
      return notFoundResponse('Staff member not found')
    }

    const { data, errors } = await validateBody(request, staffUpdateSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    if (!data) {
      return errorResponse('Invalid request body')
    }

    // Check if email is being changed and is unique
    if (data.email && data.email.toLowerCase() !== existingStaff.email.toLowerCase()) {
      const emailExists = await prisma.staff.findFirst({
        where: {
          email: data.email.toLowerCase(),
          id: { not: id },
        },
      })

      if (emailExists) {
        return validationErrorResponse({
          email: ['Email already exists'],
        })
      }
    }

    const staff = await prisma.staff.update({
      where: { id },
      data: {
        ...data,
        email: data.email ? data.email.toLowerCase() : undefined,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
      },
      include: {
        school: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true } },
      },
    })

    // Remove sensitive fields from response unless admin
    if (session && hasMinimumRole(session.user.role, 'PRINCIPAL')) {
      return successResponse(staff)
    }

    const { salary, bankDetails, ...sanitizedStaff } = staff
    return successResponse(sanitizedStaff)
  },
  { requireAuth: true, module: 'staff' }
)

export const DELETE = withApiHandler(
  async (_request: NextRequest, context, session: AuthenticatedSession | null) => {
    const { id } = await context.params
    const schoolFilter = getSchoolFilter(session)

    // Only allow admins to delete staff
    if (!session || !hasMinimumRole(session.user.role, 'SCHOOL_ADMIN')) {
      return errorResponse('Only school admins can delete staff members', 403)
    }

    const existingStaff = await prisma.staff.findFirst({
      where: {
        id,
        ...schoolFilter,
      },
    })

    if (!existingStaff) {
      return notFoundResponse('Staff member not found')
    }

    // Soft delete - set isActive to false
    await prisma.staff.update({
      where: { id },
      data: { isActive: false },
    })

    return successResponse({ message: 'Staff member deactivated successfully' })
  },
  { requireAuth: true, module: 'staff' }
)
