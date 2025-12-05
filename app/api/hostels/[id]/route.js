import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const hostel = await prisma.hostel.findUnique({
      where: { id: params.id },
      include: {
        floors: {
          include: {
            rooms: {
              include: {
                beds: true
              }
            }
          }
        },
        students: true
      }
    })

    if (!hostel) {
      return NextResponse.json({ error: 'Hostel not found' }, { status: 404 })
    }

    return NextResponse.json(hostel)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json()
    const { name, code, address, warden, phone, capacity, isActive } = body

    const hostel = await prisma.hostel.update({
      where: { id: params.id },
      data: {
        name,
        code,
        address,
        warden,
        phone,
        capacity,
        isActive
      }
    })

    return NextResponse.json(hostel)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.hostel.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
