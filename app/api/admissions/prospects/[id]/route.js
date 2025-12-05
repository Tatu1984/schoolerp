import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const data = await request.json()

    const prospect = await prisma.admissionProspect.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        parentName: data.parentName,
        parentPhone: data.parentPhone,
        parentEmail: data.parentEmail,
        address: data.address,
        classInterested: data.classInterested,
        source: data.source,
        status: data.status,
        notes: data.notes
      }
    })
    return NextResponse.json(prospect)
  } catch (error) {
    console.error('Error updating prospect:', error)
    return NextResponse.json({ error: 'Failed to update prospect' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    await prisma.admissionProspect.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting prospect:', error)
    return NextResponse.json({ error: 'Failed to delete prospect' }, { status: 500 })
  }
}
