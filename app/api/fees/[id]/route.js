import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request, { params }) {
  try {
    const data = await request.json()

    const fee = await prisma.fee.update({
      where: { id: params.id },
      data: {
        ...data,
        amount: data.amount ? parseFloat(data.amount) : undefined,
      }
    })

    return NextResponse.json(fee)
  } catch (error) {
    console.error('Error updating fee:', error)
    return NextResponse.json({ error: 'Failed to update fee' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.fee.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Fee deleted successfully' })
  } catch (error) {
    console.error('Error deleting fee:', error)
    return NextResponse.json({ error: 'Failed to delete fee' }, { status: 500 })
  }
}
