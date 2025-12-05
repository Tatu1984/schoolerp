import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const issuedBooks = await prisma.bookIssue.findMany({
      where: {
        status: 'ISSUED'
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
      orderBy: { issueDate: 'desc' }
    })
    return NextResponse.json(issuedBooks)
  } catch (error) {
    console.error('Error fetching issued books:', error)
    return NextResponse.json({ error: 'Failed to fetch issued books' }, { status: 500 })
  }
}
