import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where = status ? { status } : {}

    const admissions = await prisma.admission.findMany({
      where,
      include: {
        school: true,
        academicYear: true,
        student: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(admissions)
  } catch (error) {
    console.error('Error fetching admissions:', error)
    return NextResponse.json({ error: 'Failed to fetch admissions' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    const admission = await prisma.admission.create({
      data: {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
        testDate: data.testDate ? new Date(data.testDate) : null,
        interviewDate: data.interviewDate ? new Date(data.interviewDate) : null,
        approvalDate: data.approvalDate ? new Date(data.approvalDate) : null,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      }
    })

    return NextResponse.json(admission, { status: 201 })
  } catch (error) {
    console.error('Error creating admission:', error)
    return NextResponse.json({ error: 'Failed to create admission' }, { status: 500 })
  }
}
