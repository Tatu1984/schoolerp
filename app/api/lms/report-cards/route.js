import { NextResponse } from 'next/server'

export async function GET() {
  const reportCards = []
  return NextResponse.json(reportCards)
}
