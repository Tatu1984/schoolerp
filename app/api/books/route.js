import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      include: {
        library: true,
        _count: {
          select: {
            issues: true
          }
        }
      },
      orderBy: { title: 'asc' }
    })
    return NextResponse.json(books)
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    const book = await prisma.book.create({
      data: {
        ...data,
        quantity: parseInt(data.quantity),
        available: parseInt(data.available || data.quantity),
        pages: data.pages ? parseInt(data.pages) : null,
        price: data.price ? parseFloat(data.price) : null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
      }
    })

    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    console.error('Error creating book:', error)
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 })
  }
}
