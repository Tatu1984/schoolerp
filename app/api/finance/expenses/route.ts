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
import { expenseSchema } from '@/lib/validations'

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
      const [expenses, total] = await Promise.all([
        prisma.expense.findMany({
          where,
          orderBy: { expenseDate: 'desc' },
          skip: params.skip,
          take: params.limit,
        }),
        prisma.expense.count({ where })
      ])

      return paginatedResponse(expenses, total, params)
    } else {
      const expenses = await prisma.expense.findMany({
        where,
        orderBy: { expenseDate: 'desc' }
      })

      return successResponse(expenses)
    }
  },
  { requireAuth: true, module: 'finance' }
)

export const POST = withApiHandler(
  async (request: NextRequest, context, session) => {
    const { data, errors } = await validateBody(request, expenseSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    // Use school ID from session if not SUPER_ADMIN
    const schoolId = session?.user.role === 'SUPER_ADMIN'
      ? data!.schoolId
      : session?.user.schoolId || data!.schoolId

    const expense = await prisma.expense.create({
      data: {
        ...data!,
        schoolId,
        amount: data!.amount,
        expenseDate: new Date(data!.date),
      }
    })

    return successResponse(expense, 201)
  },
  { requireAuth: true, module: 'finance' }
)
