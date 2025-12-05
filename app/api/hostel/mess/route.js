import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const messPlans = await prisma.messMenu.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(messPlans)
  } catch (error) {
    console.error('Error fetching mess plans:', error)
    return NextResponse.json({ error: 'Failed to fetch mess plans' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    // Get default school if not provided
    if (!data.schoolId) {
      const defaultSchool = await prisma.school.findFirst()
      if (defaultSchool) {
        data.schoolId = defaultSchool.id
      }
    }

    const messPlan = await prisma.messMenu.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
      }
    })

    return NextResponse.json(messPlan, { status: 201 })
  } catch (error) {
    console.error('Error creating mess plan:', error)
    return NextResponse.json({ error: 'Failed to create mess plan' }, { status: 500 })
  }
}
