import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request, { params }) {
  try {
    const data = await request.json()

    const staff = await prisma.staff.update({
      where: { id: params.id },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
        salary: data.salary ? parseFloat(data.salary) : undefined,
        experience: data.experience ? parseInt(data.experience) : undefined,
      }
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error updating staff:', error)
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.staff.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Staff member deleted successfully' })
  } catch (error) {
    console.error('Error deleting staff:', error)
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 })
  }
}
