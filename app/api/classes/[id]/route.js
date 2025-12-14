import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request, { params }) {
  try {
    const data = await request.json()

    const classItem = await prisma.class.update({
      where: { id: params.id },
      data: {
        ...data,
        grade: data.grade ? parseInt(data.grade) : undefined,
        capacity: data.capacity ? parseInt(data.capacity) : undefined,
      }
    })

    return NextResponse.json(classItem)
  } catch (error) {
    console.error('Error updating class:', error)
    return NextResponse.json({ error: 'Failed to update class' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.class.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Class deleted successfully' })
  } catch (error) {
    console.error('Error deleting class:', error)
    return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 })
  }
}
