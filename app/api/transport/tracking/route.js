import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const tracking = await prisma.vehicleTracking.findMany({
      include: {
        vehicle: {
          include: {
            route: true,
          }
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 100 // Limit to latest 100 tracking records
    })
    return NextResponse.json(tracking)
  } catch (error) {
    console.error('Error fetching vehicle tracking:', error)
    return NextResponse.json({ error: 'Failed to fetch vehicle tracking' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    const tracking = await prisma.vehicleTracking.create({
      data: {
        ...data,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        speed: data.speed ? parseFloat(data.speed) : null,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      }
    })

    return NextResponse.json(tracking, { status: 201 })
  } catch (error) {
    console.error('Error creating tracking record:', error)
    return NextResponse.json({ error: 'Failed to create tracking record' }, { status: 500 })
  }
}
