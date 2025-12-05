import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      include: {
        school: true,
        academicYear: true,
        sections: true,
      },
      orderBy: [
        { grade: 'asc' },
        { name: 'asc' }
      ]
    })
    return NextResponse.json(classes)
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 })
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

    const classItem = await prisma.class.create({
      data: {
        ...data,
        grade: parseInt(data.grade),
        capacity: parseInt(data.capacity),
      }
    })

    return NextResponse.json(classItem, { status: 201 })
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 })
  }
}
