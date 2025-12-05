import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const onlineClasses = await prisma.onlineClass.findMany({
      include: {
        course: true,
        class: true,
        section: true,
        teacher: true,
      },
      orderBy: { scheduledAt: 'desc' }
    })
    return NextResponse.json(onlineClasses)
  } catch (error) {
    console.error('Error fetching online classes:', error)
    return NextResponse.json({ error: 'Failed to fetch online classes' }, { status: 500 })
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

    const onlineClass = await prisma.onlineClass.create({
      data: {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : new Date(),
        duration: data.duration ? parseInt(data.duration) : null,
      }
    })

    return NextResponse.json(onlineClass, { status: 201 })
  } catch (error) {
    console.error('Error creating online class:', error)
    return NextResponse.json({ error: 'Failed to create online class' }, { status: 500 })
  }
}
