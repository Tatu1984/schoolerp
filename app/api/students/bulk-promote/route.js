import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request) {
  try {
    const { studentIds, nextClassId, nextSectionId } = await request.json()

    if (!studentIds || studentIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No students selected' },
        { status: 400 }
      )
    }

    if (!nextClassId) {
      return NextResponse.json(
        { success: false, message: 'Next class is required' },
        { status: 400 }
      )
    }

    // Update all selected students
    const result = await prisma.student.updateMany({
      where: {
        id: { in: studentIds }
      },
      data: {
        classId: nextClassId,
        sectionId: nextSectionId
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully promoted ${result.count} students`,
      count: result.count
    })

  } catch (error) {
    console.error('Error promoting students:', error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
