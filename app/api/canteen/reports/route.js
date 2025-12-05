import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') || 'today'

  const reports = {
    totalRevenue: 0,
    totalOrders: 0,
    popularItems: [],
    dailySales: [],
    monthlySales: 0
  }

  return NextResponse.json(reports)
}
