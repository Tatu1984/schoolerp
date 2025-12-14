import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id: params.id }
    })

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    return NextResponse.json(announcement)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json()
    const { title, content, targetRole, priority, isActive } = body

    const announcement = await prisma.announcement.update({
      where: { id: params.id },
      data: {
        title,
        content,
        targetRole,
        priority,
        isActive
      }
    })

    return NextResponse.json(announcement)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.announcement.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
