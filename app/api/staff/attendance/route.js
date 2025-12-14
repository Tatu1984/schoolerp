import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const staffId = searchParams.get('staffId')

    const where = {}
    if (date) where.date = new Date(date)
    if (staffId) where.staffId = staffId

    const attendance = await prisma.staffAttendance.findMany({
      where,
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(attendance)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { staffId, date, status, checkIn, checkOut, remarks } = body

    // Check if attendance already exists
    const existing = await prisma.staffAttendance.findUnique({
      where: {
        staffId_date: {
          staffId,
          date: new Date(date)
        }
      }
    })

    if (existing) {
      // Update existing attendance
      const attendance = await prisma.staffAttendance.update({
        where: {
          staffId_date: {
            staffId,
            date: new Date(date)
          }
        },
        data: {
          status,
          checkIn: checkIn ? new Date(checkIn) : null,
          checkOut: checkOut ? new Date(checkOut) : null,
          remarks
        }
      })
      return NextResponse.json(attendance)
    } else {
      // Create new attendance
      const attendance = await prisma.staffAttendance.create({
        data: {
          staffId,
          date: new Date(date),
          status,
          checkIn: checkIn ? new Date(checkIn) : null,
          checkOut: checkOut ? new Date(checkOut) : null,
          remarks
        }
      })
      return NextResponse.json(attendance, { status: 201 })
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
