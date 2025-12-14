import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  successResponse,
  errorResponse,
  validationErrorResponse,
  validateBody,
  getPaginationParams,
  paginatedResponse,
  getSchoolFilter,
  AuthenticatedSession,
} from '@/lib/api-utils'
import { hostelRoomSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const pagination = getPaginationParams(request)
    const schoolFilter = getSchoolFilter(session)
    const { searchParams } = new URL(request.url)
    const floorId = searchParams.get('floorId')
    const hostelId = searchParams.get('hostelId')

    const where: Prisma.HostelRoomWhereInput = {
      ...(floorId && { floorId }),
      ...(hostelId && { floor: { hostelId } }),
      ...(schoolFilter.schoolId && {
        floor: { hostel: { schoolId: schoolFilter.schoolId } },
      }),
    }

    const [rooms, total] = await Promise.all([
      prisma.hostelRoom.findMany({
        where,
        include: {
          floor: {
            select: { id: true, name: true, hostel: { select: { id: true, name: true } } },
          },
          _count: { select: { beds: true } },
        },
        orderBy: { number: 'asc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.hostelRoom.count({ where }),
    ])

    return paginatedResponse(rooms, total, pagination)
  },
  { requireAuth: true, module: 'hostel' }
)

export const POST = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const { data, errors } = await validateBody(request, hostelRoomSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    if (!data) {
      return errorResponse('Invalid request body')
    }

    // Verify floor exists and belongs to user's school
    const schoolFilter = getSchoolFilter(session)
    const floor = await prisma.hostelFloor.findFirst({
      where: {
        id: data.floorId,
        ...(schoolFilter.schoolId && { hostel: { schoolId: schoolFilter.schoolId } }),
      },
    })

    if (!floor) {
      return validationErrorResponse({ floorId: ['Floor not found'] })
    }

    const room = await prisma.hostelRoom.create({
      data: {
        floorId: data.floorId,
        number: data.number,
        capacity: data.capacity,
        type: data.type,
        isActive: data.isActive,
      },
      include: {
        floor: {
          select: { id: true, name: true, hostel: { select: { id: true, name: true } } },
        },
      },
    })

    return successResponse(room, 201)
  },
  { requireAuth: true, module: 'hostel' }
)
