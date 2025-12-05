import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      include: {
        school: true,
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
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

    const staff = await prisma.staff.create({
      data: {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
        joiningDate: new Date(data.joiningDate),
        salary: data.salary ? parseFloat(data.salary) : null,
        experience: data.experience ? parseInt(data.experience) : null,
      }
    })

    return NextResponse.json(staff, { status: 201 })
  } catch (error) {
    console.error('Error creating staff:', error)
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 })
  }
}
