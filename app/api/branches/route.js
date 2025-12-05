import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      include: {
        school: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(branches)
  } catch (error) {
    console.error('Error fetching branches:', error)
    return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 })
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

    const branch = await prisma.branch.create({
      data
    })

    return NextResponse.json(branch, { status: 201 })
  } catch (error) {
    console.error('Error creating branch:', error)
    return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 })
  }
}
