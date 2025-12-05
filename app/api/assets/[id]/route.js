import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: params.id }
    })

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    return NextResponse.json(asset)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json()
    const { name, code, assetType, description, purchasePrice, currentValue, location, condition, isDurable, isActive } = body

    const asset = await prisma.asset.update({
      where: { id: params.id },
      data: {
        name,
        code,
        assetType,
        description,
        purchasePrice,
        currentValue,
        location,
        condition,
        isDurable,
        isActive
      }
    })

    return NextResponse.json(asset)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.asset.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
