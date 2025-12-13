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
import { bookSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const pagination = getPaginationParams(request)
    const searchParams = getSearchParams(request)
    const schoolFilter = getSchoolFilter(session)

    const where: Prisma.BookWhereInput = {
      ...schoolFilter,
      ...(searchParams.search && {
        OR: [
          { title: { contains: searchParams.search, mode: 'insensitive' } },
          { author: { contains: searchParams.search, mode: 'insensitive' } },
          { isbn: { contains: searchParams.search, mode: 'insensitive' } },
        ],
      }),
      ...(searchParams.category && { category: searchParams.category }),
      ...(searchParams.isActive !== undefined && { isActive: searchParams.isActive === 'true' }),
      ...(searchParams.available === 'true' && { available: { gt: 0 } }),
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: {
          library: { select: { id: true, name: true } },
          _count: { select: { issues: true } },
        },
        orderBy: { title: 'asc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.book.count({ where }),
    ])

    return paginatedResponse(books, total, pagination)
  },
  { requireAuth: true, module: 'library' }
)

export const POST = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const { data, errors } = await validateBody(request, bookSchema)

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

    // Check for duplicate ISBN in school if provided
    if (data.isbn) {
      const existingBook = await prisma.book.findFirst({
        where: {
          schoolId,
          isbn: data.isbn,
        },
      })

      if (existingBook) {
        return validationErrorResponse({
          isbn: ['Book with this ISBN already exists'],
        })
      }
    }

    const book = await prisma.book.create({
      data: {
        ...data,
        schoolId,
        available: data.available ?? data.quantity,
      },
      include: {
        library: { select: { id: true, name: true } },
      },
    })

    return successResponse(book, 201)
  },
  { requireAuth: true, module: 'library' }
)
