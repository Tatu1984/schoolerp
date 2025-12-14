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
  getSortParams,
  getSchoolFilter,
  AuthenticatedSession,
} from '@/lib/api-utils'
import { feeSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const pagination = getPaginationParams(request)
    const searchParams = getSearchParams(request)
    const orderBy = getSortParams(request, ['createdAt', 'name', 'amount', 'type'])
    const schoolFilter = getSchoolFilter(session)

    const where: Prisma.FeeWhereInput = {
      ...schoolFilter,
      ...(searchParams.search && {
        OR: [
          { name: { contains: searchParams.search, mode: 'insensitive' } },
          { description: { contains: searchParams.search, mode: 'insensitive' } },
        ],
      }),
      ...(searchParams.type && { type: searchParams.type as Prisma.EnumFeeTypeFilter }),
      ...(searchParams.frequency && { frequency: searchParams.frequency as Prisma.EnumFeeFrequencyFilter }),
      ...(searchParams.classId && { classId: searchParams.classId }),
      ...(searchParams.isActive !== undefined && { isActive: searchParams.isActive === 'true' }),
    }

    const [fees, total] = await Promise.all([
      prisma.fee.findMany({
        where,
        include: {
          school: { select: { id: true, name: true } },
          class: { select: { id: true, name: true, grade: true } },
          _count: {
            select: { payments: true },
          },
        },
        orderBy,
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.fee.count({ where }),
    ])

    return paginatedResponse(fees, total, pagination)
  },
  { requireAuth: true, module: 'fees' }
)

export const POST = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const { data, errors } = await validateBody(request, feeSchema)

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

    // Verify class belongs to school if provided
    if (data.classId) {
      const classExists = await prisma.class.findFirst({
        where: {
          id: data.classId,
          schoolId,
        },
      })

      if (!classExists) {
        return validationErrorResponse({
          classId: ['Invalid class for this school'],
        })
      }
    }

    const fee = await prisma.fee.create({
      data: {
        schoolId,
        name: data.name,
        type: data.type,
        amount: data.amount,
        frequency: data.frequency,
        classId: data.classId,
        description: data.description,
        isActive: data.isActive,
      },
      include: {
        school: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
      },
    })

    return successResponse(fee, 201)
  },
  { requireAuth: true, module: 'fees' }
)
