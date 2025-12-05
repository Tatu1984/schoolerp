import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        school: true,
        class: {
          include: {
            academicYear: true
          }
        },
        section: true,
        guardians: true,
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const { guardians, ...studentData } = data

    // Get default school if not provided
    if (!studentData.schoolId) {
      const defaultSchool = await prisma.school.findFirst()
      if (defaultSchool) {
        studentData.schoolId = defaultSchool.id
      }
    }

    const student = await prisma.student.create({
      data: {
        ...studentData,
        dateOfBirth: new Date(studentData.dateOfBirth),
        admissionDate: new Date(studentData.admissionDate),
        guardians: guardians ? {
          create: guardians
        } : undefined
      },
      include: {
        guardians: true
      }
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json({ error: 'Failed to create student', details: error.message }, { status: 500 })
  }
}
