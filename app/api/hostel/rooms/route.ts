import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  getPaginationParams,
  successResponse,
  validationErrorResponse,
  validateBody,
  paginatedResponse,
  AuthenticatedSession,
} from '@/lib/api-utils'
import { hostelRoomSchema } from '@/lib/validations'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const schoolFilter = getSchoolFilter(session)
    const { skip, limit, page } = getPaginationParams(request)

    // Get hostel buildings belonging to the school
    const buildings = await prisma.hostelBuilding.findMany({
      where: schoolFilter,
      select: { id: true },
    })

    const buildingIds = buildings.map((b: { id: string }) => b.id)

    // Get floors belonging to these buildings
    const floors = await prisma.hostelFloor.findMany({
      where: {
        buildingId: {
          in: buildingIds,
        },
      },
      select: { id: true },
    })

    const floorIds = floors.map((f: { id: string }) => f.id)

    const [rooms, total] = await Promise.all([
      prisma.hostelRoom.findMany({
        where: {
          floorId: {
            in: floorIds,
          },
        },
        include: {
          floor: {
            include: {
              building: true,
            },
          },
          beds: {
            include: {
              student: true,
            },
          },
        },
        orderBy: { roomNumber: 'asc' },
        skip,
        take: limit,
      }),
      prisma.hostelRoom.count({
        where: {
          floorId: {
            in: floorIds,
          },
        },
      }),
    ])

    return paginatedResponse(rooms, total, { page, limit, skip })
  },
  { requireAuth: true, module: 'hostel' }
)

export const POST = withApiHandler(
  async (request: NextRequest, _context, session) => {
    const { data, errors } = await validateBody(request, hostelRoomSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    const room = await prisma.hostelRoom.create({
      data: data!,
      include: {
        floor: {
          include: {
            building: true,
          },
        },
        beds: true,
      },
    })

    return successResponse(room, 201)
  },
  { requireAuth: true, module: 'hostel' }
)
