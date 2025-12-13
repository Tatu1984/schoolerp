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

    // Get various library statistics
    const totalBooks = await prisma.book.count({
      where: schoolFilter
    })

    const totalIssued = await prisma.bookIssue.count({
      where: {
        status: 'ISSUED',
        book: schoolFilter.schoolId ? {
          schoolId: schoolFilter.schoolId
        } : undefined
      }
    })

    const totalReturned = await prisma.bookIssue.count({
      where: {
        status: 'RETURNED',
        book: schoolFilter.schoolId ? {
          schoolId: schoolFilter.schoolId
        } : undefined
      }
    })

    const today = new Date()
    const overdueCount = await prisma.bookIssue.count({
      where: {
        status: 'ISSUED',
        dueDate: {
          lt: today
        },
        book: schoolFilter.schoolId ? {
          schoolId: schoolFilter.schoolId
        } : undefined
      }
    })

    // Get most issued books
    const mostIssuedBooks = await prisma.bookIssue.groupBy({
      by: ['bookId'],
      _count: {
        bookId: true
      },
      where: {
        book: schoolFilter.schoolId ? {
          schoolId: schoolFilter.schoolId
        } : undefined
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
        ...schoolFilter
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
