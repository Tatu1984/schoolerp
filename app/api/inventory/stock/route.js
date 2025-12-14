import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate stock levels
    const stockReport = assets.map(asset => {
      const stockLevel = asset.quantity || 0
      const minStock = asset.minQuantity || 0

      return {
        ...asset,
        stockStatus: stockLevel <= minStock ? 'LOW' : stockLevel === 0 ? 'OUT_OF_STOCK' : 'IN_STOCK',
        needsReorder: stockLevel <= minStock
      }
    })

    return NextResponse.json(stockReport)
  } catch (error) {
    console.error('Error fetching inventory stock:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory stock' }, { status: 500 })
  }
}
