import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId')

    const where = {}
    if (schoolId) where.schoolId = schoolId

    const menuItems = await prisma.menuItem.findMany({
      where,
      orderBy: { category: 'asc' }
    })

    return NextResponse.json(menuItems)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { schoolId, name, description, category, price, isAvailable } = body

    const menuItem = await prisma.menuItem.create({
      data: {
        schoolId,
        name,
        description,
        category,
        price,
        isAvailable
      }
    })

    return NextResponse.json(menuItem, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
