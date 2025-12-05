import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request, { params }) {
  try {
    const data = await request.json()

    // If this is set as current, unset all others
    if (data.isCurrent) {
      const year = await prisma.academicYear.findUnique({
        where: { id: params.id }
      })

      if (year) {
        await prisma.academicYear.updateMany({
          where: { schoolId: year.schoolId },
          data: { isCurrent: false }
        })
      }
    }

    const updatedYear = await prisma.academicYear.update({
      where: { id: params.id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      }
    })

    return NextResponse.json(updatedYear)
  } catch (error) {
    console.error('Error updating academic year:', error)
    return NextResponse.json({ error: 'Failed to update academic year' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.academicYear.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Academic year deleted successfully' })
  } catch (error) {
    console.error('Error deleting academic year:', error)
    return NextResponse.json({ error: 'Failed to delete academic year' }, { status: 500 })
  }
}
