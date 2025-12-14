import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  getPaginationParams,
  successResponse,
  paginatedResponse,
  validateBody,
  validationErrorResponse,
  AuthenticatedSession
} from '@/lib/api-utils'
import { messageSchema } from '@/lib/validations'

export const GET = withApiHandler(
  async (
    request: NextRequest,
    context: { params: Record<string, string> },
    session: AuthenticatedSession | null
  ) => {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'inbox'
    const pagination = getPaginationParams(request)

    // Build query based on message type
    let where: any = {}

    if (type === 'inbox') {
      where.receiverId = session?.user.id
    } else if (type === 'sent') {
      where.senderId = session?.user.id
    }

    // Get messages with pagination
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit
      }),
      prisma.message.count({ where })
    ])

    return paginatedResponse(messages, total, pagination)
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
    const validation = await validateBody(request, messageSchema)
    if (validation.errors) {
      return validationErrorResponse(validation.errors)
    }

    // Verify sender matches authenticated user
    if (validation.data!.senderId !== session?.user.id) {
      return validationErrorResponse({
        senderId: ['You can only send messages as yourself']
      })
    }

    // Create message
    const message = await prisma.message.create({
      data: validation.data!,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    })

    return successResponse(message, 201)
  },
  { requireAuth: true, module: 'communication' }
)
