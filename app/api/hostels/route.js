import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId')

    const where = {}
    if (schoolId) where.schoolId = schoolId

    const hostels = await prisma.hostel.findMany({
      where,
      include: {
        _count: {
          select: { students: true, floors: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(hostels)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { schoolId, name, code, address, warden, phone, capacity } = body

    const hostel = await prisma.hostel.create({
      data: {
        schoolId,
        name,
        code,
        address,
        warden,
        phone,
        capacity
      }
    })

    return NextResponse.json(hostel, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
