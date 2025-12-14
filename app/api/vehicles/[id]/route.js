import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request, { params }) {
  try {
    const data = await request.json()

    const vehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: {
        ...data,
        capacity: data.capacity ? parseInt(data.capacity) : undefined,
      }
    })

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error('Error updating vehicle:', error)
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.vehicle.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Vehicle deleted successfully' })
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 })
  }
}
