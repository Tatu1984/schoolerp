import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const occupancy = await prisma.hostelBed.findMany({
      where: {
        studentId: {
          not: null
        }
      },
      include: {
        room: {
          include: {
            floor: {
              include: {
                building: true,
              }
            }
          }
        },
        student: {
          include: {
            class: true,
            section: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(occupancy)
  } catch (error) {
    console.error('Error fetching hostel occupancy:', error)
    return NextResponse.json({ error: 'Failed to fetch hostel occupancy' }, { status: 500 })
  }
}
