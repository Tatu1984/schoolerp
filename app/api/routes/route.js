import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      include: {
        school: true,
        stops: true,
        vehicles: true,
        _count: {
          select: {
            stops: true,
            vehicles: true,
            students: true,
          }
        }
      },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(routes)
  } catch (error) {
    console.error('Error fetching routes:', error)
    return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    const route = await prisma.route.create({
      data
    })

    return NextResponse.json(route, { status: 201 })
  } catch (error) {
    console.error('Error creating route:', error)
    return NextResponse.json({ error: 'Failed to create route' }, { status: 500 })
  }
}
