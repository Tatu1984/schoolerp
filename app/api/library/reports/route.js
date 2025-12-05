import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Get various library statistics
    const totalBooks = await prisma.book.count()
    const totalIssued = await prisma.bookIssue.count({
      where: { status: 'ISSUED' }
    })
    const totalReturned = await prisma.bookIssue.count({
      where: { status: 'RETURNED' }
    })

    const today = new Date()
    const overdueCount = await prisma.bookIssue.count({
      where: {
        status: 'ISSUED',
        dueDate: {
          lt: today
        }
      }
    })

    // Get most issued books
    const mostIssuedBooks = await prisma.bookIssue.groupBy({
      by: ['bookId'],
      _count: {
        bookId: true
      },
      orderBy: {
        _count: {
          bookId: 'desc'
        }
      },
      take: 10
    })

    // Get book details for most issued
    const bookIds = mostIssuedBooks.map(item => item.bookId)
    const books = await prisma.book.findMany({
      where: {
        id: {
          in: bookIds
        }
      }
    })

    const mostIssued = mostIssuedBooks.map(item => {
      const book = books.find(b => b.id === item.bookId)
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

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error fetching library reports:', error)
    return NextResponse.json({ error: 'Failed to fetch library reports' }, { status: 500 })
  }
}
