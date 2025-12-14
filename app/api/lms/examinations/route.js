import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const examinations = await prisma.examination.findMany({
      include: {
        course: true,
        class: true,
        section: true,
        results: {
          include: {
            student: true,
          }
        }
      },
      orderBy: { examDate: 'desc' }
    })
    return NextResponse.json(examinations)
  } catch (error) {
    console.error('Error fetching examinations:', error)
    return NextResponse.json({ error: 'Failed to fetch examinations' }, { status: 500 })
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

    const examination = await prisma.examination.create({
      data: {
        ...data,
        examDate: data.examDate ? new Date(data.examDate) : new Date(),
        totalMarks: data.totalMarks ? parseInt(data.totalMarks) : null,
        duration: data.duration ? parseInt(data.duration) : null,
      }
    })

    return NextResponse.json(examination, { status: 201 })
  } catch (error) {
    console.error('Error creating examination:', error)
    return NextResponse.json({ error: 'Failed to create examination' }, { status: 500 })
  }
}
