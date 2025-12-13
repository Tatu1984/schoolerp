import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  successResponse,
  hasMinimumRole,
  errorResponse,
  AuthenticatedSession
} from '@/lib/api-utils'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    // Role check
    if (!session || !hasMinimumRole(session.user.role, 'SCHOOL_ADMIN')) {
      return errorResponse('Access denied', 403)
    }

    // Apply school filter
    const schoolFilter = getSchoolFilter(session)

    // In a real implementation, you would fetch backups from a storage service
    // For now, returning an empty array as placeholder
    const backups = await prisma.backup.findMany({
      where: schoolFilter,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        status: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    }).catch(() => []) // Return empty array if table doesn't exist yet

    return successResponse(backups)
  },
  { requireAuth: true, module: 'security' }
)

export const POST = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    // Role check
    if (!session || !hasMinimumRole(session.user.role, 'SCHOOL_ADMIN')) {
      return errorResponse('Access denied', 403)
    }

    const body = await request.json()
    const { fileName, fileSize, status } = body

    // Apply school filter
    const schoolFilter = getSchoolFilter(session)

    // In a real implementation, you would create a backup using a backup service
    // For now, creating a mock backup record
    const backup = {
      success: true,
      id: Date.now().toString(),
      fileName: fileName || `backup-${Date.now()}.sql`,
      fileSize: fileSize || 0,
      status: status || 'pending',
      createdAt: new Date().toISOString(),
      ...schoolFilter
    }

    return successResponse(backup, 201)
  },
  { requireAuth: true, module: 'security' }
)
