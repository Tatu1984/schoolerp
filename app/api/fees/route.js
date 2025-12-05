import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const fees = await prisma.fee.findMany({
      include: {
        school: true,
        _count: {
          select: {
            payments: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(fees)
  } catch (error) {
    console.error('Error fetching fees:', error)
    return NextResponse.json({ error: 'Failed to fetch fees' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    const fee = await prisma.fee.create({
      data: {
        ...data,
        amount: parseFloat(data.amount),
      }
    })

    return NextResponse.json(fee, { status: 201 })
  } catch (error) {
    console.error('Error creating fee:', error)
    return NextResponse.json({ error: 'Failed to create fee' }, { status: 500 })
  }
}
