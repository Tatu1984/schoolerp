import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'inbox'
  return NextResponse.json([])
}

export async function POST(request) {
  const data = await request.json()
  return NextResponse.json({ success: true, ...data, id: Date.now().toString() })
}
