import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId')

    const where = {}
    if (schoolId) where.schoolId = schoolId

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(announcements)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { schoolId, title, content, targetRole, priority, publishedAt } = body

    const announcement = await prisma.announcement.create({
      data: {
        schoolId,
        title,
        content,
        targetRole,
        priority,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date()
      }
    })

    return NextResponse.json(announcement, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
