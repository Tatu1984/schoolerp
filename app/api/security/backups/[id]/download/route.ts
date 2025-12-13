import { NextRequest } from 'next/server'
import {
  withApiHandler,
  getSchoolFilter,
  successResponse,
  hasMinimumRole,
  errorResponse,
  notFoundResponse,
  AuthenticatedSession
} from '@/lib/api-utils'
import prisma from '@/lib/prisma'

export const GET = withApiHandler(
  async (request: NextRequest, context, session: AuthenticatedSession | null) => {
    // Role check
    if (!session || !hasMinimumRole(session.user.role, 'SCHOOL_ADMIN')) {
      return errorResponse('Access denied', 403)
    }

    const { id } = context.params

    // Apply school filter
    const schoolFilter = getSchoolFilter(session)

    // In a real implementation, you would:
    // 1. Verify the backup exists and belongs to the user's school
    // 2. Fetch the backup file from storage
    // 3. Stream the file to the client

    // For now, checking if backup exists
    const backup = await prisma.backup.findFirst({
      where: {
        id,
        ...schoolFilter
      }
    }).catch(() => null)

    // If backup table doesn't exist or backup not found
    if (!backup && session.user.role !== 'SUPER_ADMIN') {
      // For non-super admins, return not found if they try to download a backup that doesn't belong to them
      return notFoundResponse('Backup not found')
    }

    // Mock download response
    const result = {
      backupId: id,
      downloadUrl: `/api/security/backups/${id}/file`,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      message: 'Backup download initiated'
    }

    return successResponse(result)
  },
  { requireAuth: true, module: 'security' }
)
