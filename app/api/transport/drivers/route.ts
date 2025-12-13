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
import { driverSchema } from '@/lib/validations'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session) => {
    const schoolFilter = getSchoolFilter(session)
    const { skip, limit, page } = getPaginationParams(request)

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where: schoolFilter,
        include: {
          vehicle: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.driver.count({
        where: schoolFilter,
      }),
    ])

    return paginatedResponse(drivers, total, { page, limit, skip })
  },
  { requireAuth: true, module: 'transport' }
)

export const POST = withApiHandler(
  async (request: NextRequest, _context, session) => {
    const { data, errors } = await validateBody(request, driverSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    // Use session schoolId if not super admin
    const driverData = {
      ...data!,
      schoolId: session?.user.role === 'SUPER_ADMIN' ? data!.schoolId : session?.user.schoolId!,
      dateOfBirth: data!.dateOfBirth ? new Date(data!.dateOfBirth) : null,
      joiningDate: data!.joiningDate ? new Date(data!.joiningDate) : null,
      licenseExpiry: data!.licenseExpiry ? new Date(data!.licenseExpiry) : null,
    }

    const driver = await prisma.driver.create({
      data: driverData,
      include: {
        vehicle: true,
      },
    })

    return successResponse(driver, 201)
  },
  { requireAuth: true, module: 'transport' }
)
