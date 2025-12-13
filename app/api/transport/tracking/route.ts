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
import { vehicleTrackingSchema } from '@/lib/validations'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const schoolFilter = getSchoolFilter(session)
    const { skip, limit, page } = getPaginationParams(request)

    // Get vehicles belonging to the school to filter tracking data
    const vehicles = await prisma.vehicle.findMany({
      where: schoolFilter,
      select: { id: true },
    })

    const vehicleIds = vehicles.map((v: { id: string }) => v.id)

    const [tracking, total] = await Promise.all([
      prisma.gPSTracking.findMany({
        where: {
          vehicleId: {
            in: vehicleIds,
          },
        },
        include: {
          vehicle: {
            include: {
              route: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      prisma.gPSTracking.count({
        where: {
          vehicleId: {
            in: vehicleIds,
          },
        },
      }),
    ])

    return paginatedResponse(tracking, total, { page, limit, skip })
  },
  { requireAuth: true, module: 'transport' }
)

export const POST = withApiHandler(
  async (request: NextRequest, _context, _session: AuthenticatedSession | null) => {
    const { data, errors } = await validateBody(request, vehicleTrackingSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    const trackingData = {
      vehicleId: data!.vehicleId,
      latitude: parseFloat(data!.latitude.toString()),
      longitude: parseFloat(data!.longitude.toString()),
      speed: data!.speed ? parseFloat(data!.speed.toString()) : null,
      timestamp: data!.timestamp ? new Date(data!.timestamp) : new Date(),
    }

    const tracking = await prisma.gPSTracking.create({
      data: trackingData,
      include: {
        vehicle: {
          include: {
            route: true,
          },
        },
      },
    })

    return successResponse(tracking, 201)
  },
  { requireAuth: true, module: 'transport' }
)
