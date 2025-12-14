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
  AuthenticatedSession,
} from '@/lib/api-utils'
import { bookSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const pagination = getPaginationParams(request)
    const searchParams = getSearchParams(request)
    const schoolId = session?.user.schoolId

    const where: Prisma.BookWhereInput = {
      ...(schoolId && { library: { schoolId } }),
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

    // Verify library exists and belongs to user's school
    const library = await prisma.library.findFirst({
      where: {
        id: data.libraryId,
        ...(session?.user.schoolId && { schoolId: session.user.schoolId }),
      },
    })

    if (!library) {
      return errorResponse('Library not found')
    }

    // Check for duplicate ISBN in library if provided
    if (data.isbn) {
      const existingBook = await prisma.book.findFirst({
        where: {
          libraryId: data.libraryId,
          isbn: data.isbn,
        },
      })

      if (existingBook) {
        return validationErrorResponse({
          isbn: ['Book with this ISBN already exists in this library'],
        })
      }
    }

    const book = await prisma.book.create({
      data: {
        library: { connect: { id: data.libraryId } },
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        barcode: data.barcode,
        category: data.category,
        publisher: data.publisher,
        edition: data.edition,
        pages: data.pages,
        language: data.language,
        quantity: data.quantity,
        available: data.available ?? data.quantity,
        price: data.price,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        location: data.location,
        description: data.description,
        coverImage: data.coverImage,
        isActive: data.isActive,
      },
      include: {
        library: { select: { id: true, name: true } },
      },
    })

    return successResponse(book, 201)
  },
  { requireAuth: true, module: 'library' }
)
