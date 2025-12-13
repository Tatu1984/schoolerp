import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  successResponse,
  notFoundResponse,
  validateBody,
  validationErrorResponse,
  AuthenticatedSession
} from '@/lib/api-utils'
import { eventSchema } from '@/lib/validations'

export const PUT = withApiHandler(
  async (
    request: NextRequest,
    context: { params: Record<string, string> },
    session: AuthenticatedSession | null
  ) => {
    const { id } = context.params

    // Validate request body
    const validation = await validateBody(request, eventSchema.partial())
    if (validation.errors) {
      return validationErrorResponse(validation.errors)
    }

    // Check if event exists
    const existing = await prisma.event.findUnique({
      where: { id }
    })

    if (!existing) {
      return notFoundResponse('Event not found')
    }

    // Verify school access for non-super admins
    if (session?.user.role !== 'SUPER_ADMIN' && existing.schoolId !== session?.user.schoolId) {
      return notFoundResponse('Event not found')
    }

    // Update event
    const event = await prisma.event.update({
      where: { id },
      data: validation.data!
    })

    return successResponse(event)
  },
  { requireAuth: true, module: 'communication' }
)

export const DELETE = withApiHandler(
  async (
    request: NextRequest,
    context: { params: Record<string, string> },
    session: AuthenticatedSession | null
  ) => {
    const { id } = context.params

    // Check if event exists
    const existing = await prisma.event.findUnique({
      where: { id }
    })

    if (!existing) {
      return notFoundResponse('Event not found')
    }

    // Verify school access for non-super admins
    if (session?.user.role !== 'SUPER_ADMIN' && existing.schoolId !== session?.user.schoolId) {
      return notFoundResponse('Event not found')
    }

    // Delete event
    await prisma.event.delete({
      where: { id }
    })

    return successResponse({ success: true })
  },
  { requireAuth: true, module: 'communication' }
)
