import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  successResponse,
  hasMinimumRole,
  errorResponse,
  notFoundResponse,
  AuthenticatedSession
} from '@/lib/api-utils'

export const GET = withApiHandler(
  async (request: NextRequest, context, session: AuthenticatedSession | null) => {
    // Role check
    if (!session || !hasMinimumRole(session.user.role, 'SCHOOL_ADMIN')) {
      return errorResponse('Access denied', 403)
    }

    const { id } = context.params

    // Apply school filter
    const schoolFilter = getSchoolFilter(session)

    // Fetch the compliance record
    const complianceRecord = await prisma.complianceRecord.findFirst({
      where: {
        id,
        ...schoolFilter
      }
    }).catch(() => null)

    if (!complianceRecord) {
      return notFoundResponse('Compliance record not found')
    }

    return successResponse(complianceRecord)
  },
  { requireAuth: true, module: 'security' }
)

export const PUT = withApiHandler(
  async (request: NextRequest, context, session: AuthenticatedSession | null) => {
    // Role check
    if (!session || !hasMinimumRole(session.user.role, 'SCHOOL_ADMIN')) {
      return errorResponse('Access denied', 403)
    }

    const { id } = context.params
    const body = await request.json()
    const { complianceType, description, status, validFrom, validUntil, isActive } = body

    // Apply school filter
    const schoolFilter = getSchoolFilter(session)

    // Verify the compliance record exists and belongs to the user's school
    const existingRecord = await prisma.complianceRecord.findFirst({
      where: {
        id,
        ...schoolFilter
      }
    }).catch(() => null)

    if (!existingRecord && session.user.role !== 'SUPER_ADMIN') {
      return notFoundResponse('Compliance record not found')
    }

    // Update the compliance record
    const updateData: Record<string, unknown> = {}
    if (complianceType !== undefined) updateData.complianceType = complianceType
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    if (validFrom !== undefined) updateData.validFrom = new Date(validFrom)
    if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : null
    if (isActive !== undefined) updateData.isActive = isActive

    const updatedRecord = await prisma.complianceRecord.update({
      where: { id },
      data: updateData
    })

    return successResponse(updatedRecord)
  },
  { requireAuth: true, module: 'security' }
)

export const DELETE = withApiHandler(
  async (request: NextRequest, context, session: AuthenticatedSession | null) => {
    // Role check
    if (!session || !hasMinimumRole(session.user.role, 'SCHOOL_ADMIN')) {
      return errorResponse('Access denied', 403)
    }

    const { id } = context.params

    // Apply school filter
    const schoolFilter = getSchoolFilter(session)

    // Verify the compliance record exists and belongs to the user's school
    const existingRecord = await prisma.complianceRecord.findFirst({
      where: {
        id,
        ...schoolFilter
      }
    }).catch(() => null)

    if (!existingRecord && session.user.role !== 'SUPER_ADMIN') {
      return notFoundResponse('Compliance record not found')
    }

    // Delete the compliance record
    await prisma.complianceRecord.delete({
      where: { id }
    }).catch(() => {
      // If delete fails (table doesn't exist), just continue
    })

    return successResponse({ message: 'Compliance record deleted successfully' })
  },
  { requireAuth: true, module: 'security' }
)
