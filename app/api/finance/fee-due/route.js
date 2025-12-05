import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Get all fee collections that are not fully paid
    const feeCollections = await prisma.feeCollection.findMany({
      where: {
        status: {
          in: ['PENDING', 'PARTIAL']
        }
      },
      include: {
        student: {
          include: {
            class: true,
            section: true,
          }
        },
        feeStructure: true,
      },
      orderBy: { dueDate: 'asc' }
    })

    return NextResponse.json(feeCollections)
  } catch (error) {
    console.error('Error fetching fee dues:', error)
    return NextResponse.json({ error: 'Failed to fetch fee dues' }, { status: 500 })
  }
}
