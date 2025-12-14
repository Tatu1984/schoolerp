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
import { eventSchema } from '@/lib/validations'

export const GET = withApiHandler(
  async (
    request: NextRequest,
    context: { params: Record<string, string> },
    session: AuthenticatedSession | null
  ) => {
    const schoolFilter = getSchoolFilter(session)
    const pagination = getPaginationParams(request)
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')

    // Build query
    const where: any = {
      ...schoolFilter
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    // Get events with pagination
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { eventDate: 'desc' },
        skip: pagination.skip,
        take: pagination.limit
      }),
      prisma.event.count({ where })
    ])

    return paginatedResponse(events, total, pagination)
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
    const validation = await validateBody(request, eventSchema)
    if (validation.errors) {
      return validationErrorResponse(validation.errors)
    }

    // Ensure schoolId matches user's school (unless SUPER_ADMIN)
    if (session?.user.role !== 'SUPER_ADMIN') {
      if (validation.data!.schoolId !== session?.user.schoolId) {
        return validationErrorResponse({
          schoolId: ['You can only create events for your own school']
        })
      }
    }

    // Create event
    const data = validation.data!
    const event = await prisma.event.create({
      data: {
        schoolId: data.schoolId,
        title: data.title,
        description: data.description,
        eventDate: new Date(data.eventDate),
        location: data.location,
        organizer: data.organizer,
        isPublic: data.isPublic,
        isActive: data.isActive,
      }
    })

    return successResponse(event, 201)
  },
  { requireAuth: true, module: 'communication' }
)
