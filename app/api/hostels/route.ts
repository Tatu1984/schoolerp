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
  getSearchParams,
  getSchoolFilter,
  AuthenticatedSession,
} from '@/lib/api-utils'
import { hostelSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const pagination = getPaginationParams(request)
    const searchParams = getSearchParams(request)
    const schoolFilter = getSchoolFilter(session)

    const where: Prisma.HostelWhereInput = {
      ...schoolFilter,
      ...(searchParams.search && {
        OR: [
          { name: { contains: searchParams.search, mode: 'insensitive' } },
          { warden: { contains: searchParams.search, mode: 'insensitive' } },
          { code: { contains: searchParams.search, mode: 'insensitive' } },
        ],
      }),
      ...(searchParams.isActive !== undefined && { isActive: searchParams.isActive === 'true' }),
    }

    const [hostels, total] = await Promise.all([
      prisma.hostel.findMany({
        where,
        include: {
          school: { select: { id: true, name: true } },
          _count: { select: { students: true, floors: true } },
        },
        orderBy: { name: 'asc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.hostel.count({ where }),
    ])

    return paginatedResponse(hostels, total, pagination)
  },
  { requireAuth: true, module: 'hostel' }
)

export const POST = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const { data, errors } = await validateBody(request, hostelSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    if (!data) {
      return errorResponse('Invalid request body')
    }

    const schoolId = data.schoolId || session?.user.schoolId
    if (!schoolId) {
      return errorResponse('School ID is required')
    }

    // Check for duplicate hostel name in school
    const existingHostel = await prisma.hostel.findFirst({
      where: {
        schoolId,
        name: data.name,
      },
    })

    if (existingHostel) {
      return validationErrorResponse({
        name: ['Hostel with this name already exists'],
      })
    }

    const hostel = await prisma.hostel.create({
      data: {
        schoolId,
        name: data.name,
        code: data.code,
        address: data.address,
        warden: data.warden,
        phone: data.phone,
        capacity: data.capacity,
        isActive: data.isActive,
      },
      include: {
        school: { select: { id: true, name: true } },
      },
    })

    return successResponse(hostel, 201)
  },
  { requireAuth: true, module: 'hostel' }
)
