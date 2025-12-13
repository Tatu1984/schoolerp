import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  getPaginationParams,
  successResponse,
  validationErrorResponse,
  validateBody,
  AuthenticatedSession,
  paginatedResponse,
  getSortParams,
} from '@/lib/api-utils'
import { canteenOrderSchema } from '@/lib/validations'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const pagination = getPaginationParams(request)
    const sort = getSortParams(request, ['orderDate', 'totalAmount', 'status', 'createdAt'])

    const where: any = {}

    if (studentId) {
      where.studentId = studentId
    }

    if (status) {
      where.status = status
    }

    if (startDate || endDate) {
      where.orderDate = {}
      if (startDate) {
        where.orderDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.orderDate.lte = new Date(endDate)
      }
    }

    // Filter by school through student relationship
    const schoolFilter = getSchoolFilter(session)
    if (schoolFilter.schoolId) {
      where.student = {
        schoolId: schoolFilter.schoolId,
      }
    }

    const [orders, total] = await Promise.all([
      prisma.canteenOrder.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              rollNumber: true,
              class: {
                select: {
                  name: true,
                  grade: true,
                },
              },
            },
          },
          items: {
            include: {
              menuItem: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                },
              },
            },
          },
        },
        orderBy: sort,
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.canteenOrder.count({ where }),
    ])

    return paginatedResponse(orders, total, pagination)
  },
  { requireAuth: true, module: 'canteen' }
)

export const POST = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const { data, errors } = await validateBody(request, canteenOrderSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    // Verify student belongs to the school
    const schoolFilter = getSchoolFilter(session)
    if (schoolFilter.schoolId) {
      const student = await prisma.student.findFirst({
        where: {
          id: data!.studentId,
          schoolId: schoolFilter.schoolId,
        },
      })

      if (!student) {
        return validationErrorResponse({
          studentId: ['Student not found in your school'],
        })
      }
    }

    // Create order with items
    const { items, ...orderData } = data!

    const order = await prisma.canteenOrder.create({
      data: {
        ...orderData,
        items: {
          create: items,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rollNumber: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
      },
    })

    return successResponse(order, 201)
  },
  { requireAuth: true, module: 'canteen' }
)
