import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  successResponse
} from '@/lib/api-utils'

export const GET = withApiHandler(
  async (request: NextRequest, context, session) => {
    const schoolFilter = getSchoolFilter(session)

    // For books, filter through library relation
    const bookWhere = schoolFilter.schoolId
      ? { library: { schoolId: schoolFilter.schoolId } }
      : {}

    // Get various library statistics
    const totalBooks = await prisma.book.count({
      where: bookWhere
    })

    const totalIssued = await prisma.libraryIssue.count({
      where: {
        status: 'ISSUED',
        book: bookWhere
      }
    })

    const totalReturned = await prisma.libraryIssue.count({
      where: {
        status: 'RETURNED',
        book: bookWhere
      }
    })

    const today = new Date()
    const overdueCount = await prisma.libraryIssue.count({
      where: {
        status: 'ISSUED',
        dueDate: {
          lt: today
        },
        book: bookWhere
      }
    })

    // Get most issued books
    const mostIssuedBooks = await prisma.libraryIssue.groupBy({
      by: ['bookId'],
      _count: {
        bookId: true
      },
      where: {
        book: bookWhere
      },
      orderBy: {
        _count: {
          bookId: 'desc'
        }
      },
      take: 10
    })

    // Get book details for most issued
    const bookIds = mostIssuedBooks.map((item: { bookId: string; _count: { bookId: number } }) => item.bookId)
    const books = await prisma.book.findMany({
      where: {
        id: {
          in: bookIds
        },
        ...bookWhere
      }
    })

    const mostIssued = mostIssuedBooks.map((item: { bookId: string; _count: { bookId: number } }) => {
      const book = books.find((b: { id: string }) => b.id === item.bookId)
      return {
        book,
        issueCount: item._count.bookId
      }
    })

    const report = {
      totalBooks,
      totalIssued,
      totalReturned,
      overdueCount,
      availableBooks: totalBooks - totalIssued,
      mostIssuedBooks: mostIssued
    }

    return successResponse(report)
  },
  { requireAuth: true, module: 'library' }
)
