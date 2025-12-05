import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId')

    const where = {}
    if (schoolId) where.schoolId = schoolId

    const assets = await prisma.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(assets)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { schoolId, name, code, assetType, description, purchasePrice, currentValue, location, condition, isDurable, purchaseDate } = body

    const asset = await prisma.asset.create({
      data: {
        schoolId,
        name,
        code,
        assetType,
        description,
        purchasePrice,
        currentValue,
        location,
        condition,
        isDurable,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date()
      }
    })

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
