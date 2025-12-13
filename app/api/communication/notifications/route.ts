import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getPaginationParams,
  successResponse,
  paginatedResponse,
  validateBody,
  validationErrorResponse,
  AuthenticatedSession
} from '@/lib/api-utils'
import { notificationSchema } from '@/lib/validations'

export const GET = withApiHandler(
  async (
    request: NextRequest,
    context: { params: Record<string, string> },
    session: AuthenticatedSession | null
  ) => {
    const pagination = getPaginationParams(request)
    const { searchParams } = new URL(request.url)
    const isRead = searchParams.get('isRead')

    // Build query
    const where: any = {
      userId: session?.user.id
    }

    if (isRead !== null && isRead !== undefined) {
      where.isRead = isRead === 'true'
    }

    // Get notifications with pagination
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit
      }),
      prisma.notification.count({ where })
    ])

    return paginatedResponse(notifications, total, pagination)
  },
  { requireAuth: true, module: 'communication' }
)

export const POST = withApiHandler(
  async (
    request: NextRequest,
    context: { params: Record<string, string> },
    session: AuthenticatedSession | null
  ) => {
    // Validate request body
    const validation = await validateBody(request, notificationSchema)
    if (validation.errors) {
      return validationErrorResponse(validation.errors)
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: validation.data!
    })

    return successResponse(notification, 201)
  },
  { requireAuth: true, module: 'communication' }
)
