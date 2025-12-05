import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const school = await prisma.school.findUnique({
      where: { id: params.id }
    })

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    return NextResponse.json(school)
  } catch (error) {
    console.error('Error fetching school:', error)
    return NextResponse.json({ error: 'Failed to fetch school' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json()

    const school = await prisma.school.update({
      where: { id: params.id },
      data: {
        ...data,
        established: data.established ? new Date(data.established) : null,
      }
    })

    return NextResponse.json(school)
  } catch (error) {
    console.error('Error updating school:', error)
    return NextResponse.json({ error: 'Failed to update school' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.school.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'School deleted successfully' })
  } catch (error) {
    console.error('Error deleting school:', error)
    return NextResponse.json({ error: 'Failed to delete school' }, { status: 500 })
  }
}
