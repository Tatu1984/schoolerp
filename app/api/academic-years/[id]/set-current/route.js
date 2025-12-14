import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request, { params }) {
  try {
    const year = await prisma.academicYear.findUnique({
      where: { id: params.id }
    })

    if (!year) {
      return NextResponse.json({ error: 'Academic year not found' }, { status: 404 })
    }

    // Unset all current years for this school
    await prisma.academicYear.updateMany({
      where: { schoolId: year.schoolId },
      data: { isCurrent: false }
    })

    // Set this year as current
    const updatedYear = await prisma.academicYear.update({
      where: { id: params.id },
      data: { isCurrent: true }
    })

    return NextResponse.json(updatedYear)
  } catch (error) {
    console.error('Error setting current academic year:', error)
    return NextResponse.json({ error: 'Failed to set current academic year' }, { status: 500 })
  }
}
