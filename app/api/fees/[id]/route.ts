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
import { feeSchema } from '@/lib/validations'

const feeUpdateSchema = feeSchema.partial().omit({ schoolId: true })

export const GET = withApiHandler(
  async (_request: NextRequest, context, session: AuthenticatedSession | null) => {
    const { id } = await context.params
    const schoolFilter = getSchoolFilter(session)

    const fee = await prisma.fee.findFirst({
      where: {
        id,
        ...schoolFilter,
      },
      include: {
        school: { select: { id: true, name: true } },
        class: { select: { id: true, name: true, grade: true } },
        _count: {
          select: { payments: true },
        },
      },
    })

    if (!fee) {
      return notFoundResponse('Fee not found')
    }

    return successResponse(fee)
  },
  { requireAuth: true, module: 'fees' }
)

export const PUT = withApiHandler(
  async (request: NextRequest, context, session: AuthenticatedSession | null) => {
    const { id } = await context.params
    const schoolFilter = getSchoolFilter(session)

    const existingFee = await prisma.fee.findFirst({
      where: {
        id,
        ...schoolFilter,
      },
    })

    if (!existingFee) {
      return notFoundResponse('Fee not found')
    }

    const { data, errors } = await validateBody(request, feeUpdateSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    if (!data) {
      return errorResponse('Invalid request body')
    }

    // Verify class belongs to school if being changed
    if (data.classId && data.classId !== existingFee.classId) {
      const classExists = await prisma.class.findFirst({
        where: {
          id: data.classId,
          schoolId: existingFee.schoolId,
        },
      })

      if (!classExists) {
        return validationErrorResponse({
          classId: ['Invalid class for this school'],
        })
      }
    }

    const fee = await prisma.fee.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: {
        school: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
      },
    })

    return successResponse(fee)
  },
  { requireAuth: true, module: 'fees' }
)

export const DELETE = withApiHandler(
  async (_request: NextRequest, context, session: AuthenticatedSession | null) => {
    const { id } = await context.params
    const schoolFilter = getSchoolFilter(session)

    // Only admins and accountants can delete fees
    if (!session || !hasMinimumRole(session.user.role, 'ACCOUNTANT')) {
      return errorResponse('Insufficient permissions', 403)
    }

    const existingFee = await prisma.fee.findFirst({
      where: {
        id,
        ...schoolFilter,
      },
      include: {
        _count: { select: { payments: true } },
      },
    })

    if (!existingFee) {
      return notFoundResponse('Fee not found')
    }

    // Prevent deletion if fee has payments
    if (existingFee._count.payments > 0) {
      return errorResponse('Cannot delete fee with existing payments. Deactivate instead.', 400)
    }

    await prisma.fee.delete({
      where: { id },
    })

    return successResponse({ message: 'Fee deleted successfully' })
  },
  { requireAuth: true, module: 'fees' }
)
