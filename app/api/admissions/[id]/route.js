import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request, { params }) {
  try {
    const data = await request.json()

    const admission = await prisma.admission.update({
      where: { id: params.id },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        testDate: data.testDate ? new Date(data.testDate) : undefined,
        interviewDate: data.interviewDate ? new Date(data.interviewDate) : undefined,
        approvalDate: data.approvalDate ? new Date(data.approvalDate) : undefined,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
      }
    })

    return NextResponse.json(admission)
  } catch (error) {
    console.error('Error updating admission:', error)
    return NextResponse.json({ error: 'Failed to update admission' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.admission.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Admission deleted successfully' })
  } catch (error) {
    console.error('Error deleting admission:', error)
    return NextResponse.json({ error: 'Failed to delete admission' }, { status: 500 })
  }
}
