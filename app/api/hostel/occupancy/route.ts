import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  getPaginationParams,
  paginatedResponse,
  AuthenticatedSession,
} from '@/lib/api-utils'

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

    // Get rooms belonging to these floors
    const rooms = await prisma.hostelRoom.findMany({
      where: {
        floorId: {
          in: floorIds,
        },
      },
      select: { id: true },
    })

    const roomIds = rooms.map((r: { id: string }) => r.id)

    const [occupancy, total] = await Promise.all([
      prisma.hostelBed.findMany({
        where: {
          roomId: {
            in: roomIds,
          },
          studentId: {
            not: null,
          },
        },
        include: {
          room: {
            include: {
              floor: {
                include: {
                  building: true,
                },
              },
            },
          },
          student: {
            include: {
              class: true,
              section: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.hostelBed.count({
        where: {
          roomId: {
            in: roomIds,
          },
          studentId: {
            not: null,
          },
        },
      }),
    ])

    return paginatedResponse(occupancy, total, { page, limit, skip })
  },
  { requireAuth: true, module: 'hostel' }
)
