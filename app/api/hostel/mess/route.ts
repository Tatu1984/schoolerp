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
import { messMenuSchema } from '@/lib/validations'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session) => {
    const schoolFilter = getSchoolFilter(session)
    const { skip, limit, page } = getPaginationParams(request)

    const [messPlans, total] = await Promise.all([
      prisma.messMenu.findMany({
        where: schoolFilter,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.messMenu.count({
        where: schoolFilter,
      }),
    ])

    return paginatedResponse(messPlans, total, { page, limit, skip })
  },
  { requireAuth: true, module: 'hostel' }
)

export const POST = withApiHandler(
  async (request: NextRequest, _context, session) => {
    const { data, errors } = await validateBody(request, messMenuSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    // Use session schoolId if not super admin
    const messData = {
      ...data!,
      schoolId: session?.user.role === 'SUPER_ADMIN' ? data!.schoolId : session?.user.schoolId!,
      date: data!.date ? new Date(data!.date) : new Date(),
    }

    const messPlan = await prisma.messMenu.create({
      data: messData,
    })

    return successResponse(messPlan, 201)
  },
  { requireAuth: true, module: 'hostel' }
)
