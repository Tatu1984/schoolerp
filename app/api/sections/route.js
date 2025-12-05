import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    const where = classId ? { classId } : {}

    const sections = await prisma.section.findMany({
      where,
      include: {
        class: {
          include: {
            academicYear: true
          }
        },
        teacher: true,
        _count: {
          select: { students: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(sections)
  } catch (error) {
    console.error('Error fetching sections:', error)
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    const section = await prisma.section.create({
      data: {
        ...data,
        capacity: parseInt(data.capacity),
      }
    })

    return NextResponse.json(section, { status: 201 })
  } catch (error) {
    console.error('Error creating section:', error)
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 })
  }
}
