import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  getPaginationParams,
  paginatedResponse,
  successResponse,
  validateBody,
  validationErrorResponse
} from '@/lib/api-utils'
import { vendorSchema } from '@/lib/validations'

export const GET = withApiHandler(
  async (request: NextRequest, context, session) => {
    const schoolFilter = getSchoolFilter(session)
    const { searchParams } = new URL(request.url)
    const usePagination = searchParams.get('paginate') === 'true'

    const where = {
      ...schoolFilter
    }

    if (usePagination) {
      const params = getPaginationParams(request)
      const [vendors, total] = await Promise.all([
        prisma.vendor.findMany({
          where,
          include: {
            _count: {
              select: { purchaseOrders: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: params.skip,
          take: params.limit,
        }),
        prisma.vendor.count({ where })
      ])

      return paginatedResponse(vendors, total, params)
    } else {
      const vendors = await prisma.vendor.findMany({
        where,
        include: {
          _count: {
            select: { purchaseOrders: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return successResponse(vendors)
    }
  },
  { requireAuth: true, module: 'inventory' }
)

export const POST = withApiHandler(
  async (request: NextRequest, context, session) => {
    const { data, errors } = await validateBody(request, vendorSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    // Use school ID from session if not SUPER_ADMIN
    const schoolId = session?.user.role === 'SUPER_ADMIN'
      ? data!.schoolId
      : session?.user.schoolId || data!.schoolId

    const vendor = await prisma.vendor.create({
      data: {
        schoolId,
        name: data!.name,
        code: data!.code,
        contactPerson: data!.contactPerson,
        phone: data!.phone,
        email: data!.email,
        address: data!.address,
        gst: data!.gst,
        isActive: data!.isActive,
      }
    })

    return successResponse(vendor, 201)
  },
  { requireAuth: true, module: 'inventory' }
)
