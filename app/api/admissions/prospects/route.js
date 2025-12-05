import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const prospects = await prisma.admissionProspect.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(prospects)
  } catch (error) {
    console.error('Error fetching prospects:', error)
    return NextResponse.json({ error: 'Failed to fetch prospects' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const prospect = await prisma.admissionProspect.create({
      data: {
        schoolId: data.schoolId || 'default-school-id',
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
    console.error('Error creating prospect:', error)
    return NextResponse.json({ error: 'Failed to create prospect' }, { status: 500 })
  }
}
