import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const rooms = await prisma.hostelRoom.findMany({
      include: {
        floor: {
          include: {
            building: true,
          }
        },
        beds: {
          include: {
            student: true,
          }
        }
      },
      orderBy: { roomNumber: 'asc' }
    })
    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Error fetching hostel rooms:', error)
    return NextResponse.json({ error: 'Failed to fetch hostel rooms' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    const room = await prisma.hostelRoom.create({
      data: {
        ...data,
        capacity: data.capacity ? parseInt(data.capacity) : null,
      }
    })

    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    console.error('Error creating hostel room:', error)
    return NextResponse.json({ error: 'Failed to create hostel room' }, { status: 500 })
  }
}
