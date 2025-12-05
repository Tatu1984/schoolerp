import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const years = await prisma.academicYear.findMany({
      include: {
        school: true
      },
      orderBy: { startDate: 'desc' }
    })
    return NextResponse.json(years)
  } catch (error) {
    console.error('Error fetching academic years:', error)
    return NextResponse.json({ error: 'Failed to fetch academic years' }, { status: 500 })
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

    // If this is set as current, unset all others
    if (data.isCurrent) {
      await prisma.academicYear.updateMany({
        where: { schoolId: data.schoolId },
        data: { isCurrent: false }
      })
    }

    const year = await prisma.academicYear.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      }
    })

    return NextResponse.json(year, { status: 201 })
  } catch (error) {
    console.error('Error creating academic year:', error)
    return NextResponse.json({ error: 'Failed to create academic year' }, { status: 500 })
  }
}
