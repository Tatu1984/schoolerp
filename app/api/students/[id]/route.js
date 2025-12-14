import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        school: true,
        class: true,
        section: true,
        guardians: true,
        siblings: {
          include: {
            sibling: true
          }
        },
        fees: {
          include: {
            fee: true
          }
        },
        transport: {
          include: {
            route: true,
            stop: true
          }
        },
        hostel: {
          include: {
            hostel: true,
            bed: {
              include: {
                room: true
              }
            }
          }
        }
      }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json()
    const { guardians, ...studentData } = data

    const student = await prisma.student.update({
      where: { id: params.id },
      data: {
        ...studentData,
        dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth) : undefined,
        admissionDate: studentData.admissionDate ? new Date(studentData.admissionDate) : undefined,
      }
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.student.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Student deleted successfully' })
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 })
  }
}
