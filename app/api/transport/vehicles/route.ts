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
} from '@/lib/api-utils'
import { vehicleSchema } from '@/lib/validations'
import { errorResponse } from '@/lib/api-utils'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session) => {
    const schoolFilter = getSchoolFilter(session)
    const { skip, limit, page } = getPaginationParams(request)

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where: schoolFilter,
        include: {
          route: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.vehicle.count({
        where: schoolFilter,
      }),
    ])

    return paginatedResponse(vehicles, total, { page, limit, skip })
  },
  { requireAuth: true, module: 'transport' }
)

export const POST = withApiHandler(
  async (request: NextRequest, _context, session) => {
    const { data, errors } = await validateBody(request, vehicleSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    const schoolId = session?.user.role === 'SUPER_ADMIN' ? data!.schoolId : session?.user.schoolId
    if (!schoolId) {
      return errorResponse('School ID is required', 400)
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        schoolId,
        number: data!.number,
        type: data!.type,
        capacity: data!.capacity,
        routeId: data!.routeId,
        driverName: data!.driverName,
        driverPhone: data!.driverPhone,
        driverLicense: data!.driverLicense,
        registrationNo: data!.registrationNo,
        insurance: data!.insurance,
        isActive: data!.isActive,
      },
      include: {
        route: true,
      },
    })

    return successResponse(vehicle, 201)
  },
  { requireAuth: true, module: 'transport' }
)
