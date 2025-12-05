import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request, { params }) {
  try {
    const data = await request.json()

    const route = await prisma.route.update({
      where: { id: params.id },
      data
    })

    return NextResponse.json(route)
  } catch (error) {
    console.error('Error updating route:', error)
    return NextResponse.json({ error: 'Failed to update route' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.route.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Route deleted successfully' })
  } catch (error) {
    console.error('Error deleting route:', error)
    return NextResponse.json({ error: 'Failed to delete route' }, { status: 500 })
  }
}
