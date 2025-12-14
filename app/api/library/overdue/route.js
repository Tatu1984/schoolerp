import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const today = new Date()

    const overdueBooks = await prisma.bookIssue.findMany({
      where: {
        status: 'ISSUED',
        dueDate: {
          lt: today
        }
      },
      include: {
        book: true,
        student: {
          include: {
            class: true,
            section: true,
          }
        },
        issuedBy: true,
      },
      orderBy: { dueDate: 'asc' }
    })
    return NextResponse.json(overdueBooks)
  } catch (error) {
    console.error('Error fetching overdue books:', error)
    return NextResponse.json({ error: 'Failed to fetch overdue books' }, { status: 500 })
  }
}
