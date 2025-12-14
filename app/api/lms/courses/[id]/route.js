import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        assignments: true,
        exams: true
      }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json()
    const { classId, name, code, description, instructor, startDate, endDate, isActive } = body

    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
        classId,
        name,
        code,
        description,
        instructor,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive
      }
    })

    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.course.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
