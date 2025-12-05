import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request, { params }) {
  try {
    const data = await request.json()

    const branch = await prisma.branch.update({
      where: { id: params.id },
      data
    })

    return NextResponse.json(branch)
  } catch (error) {
    console.error('Error updating branch:', error)
    return NextResponse.json({ error: 'Failed to update branch' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.branch.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Branch deleted successfully' })
  } catch (error) {
    console.error('Error deleting branch:', error)
    return NextResponse.json({ error: 'Failed to delete branch' }, { status: 500 })
  }
}
