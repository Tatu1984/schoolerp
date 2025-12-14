import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: params.id }
    })

    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 })
    }

    return NextResponse.json(menuItem)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json()
    const { name, description, category, price, isAvailable, isActive } = body

    const menuItem = await prisma.menuItem.update({
      where: { id: params.id },
      data: {
        name,
        description,
        category,
        price,
        isAvailable,
        isActive
      }
    })

    return NextResponse.json(menuItem)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.menuItem.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
