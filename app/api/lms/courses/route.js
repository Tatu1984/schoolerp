import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId')

    const where = {}
    if (schoolId) where.schoolId = schoolId

    const courses = await prisma.course.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(courses)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    let { schoolId, classId, name, code, description, instructor, startDate, endDate } = body

    // Get default school if not provided
    if (!schoolId) {
      const defaultSchool = await prisma.school.findFirst()
      if (defaultSchool) {
        schoolId = defaultSchool.id
      }
    }

    const course = await prisma.course.create({
      data: {
        schoolId,
        classId,
        name,
        code,
        description,
        instructor,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
