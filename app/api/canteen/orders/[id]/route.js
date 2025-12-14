import { NextResponse } from 'next/server'

export async function PUT(request) {
  const data = await request.json()
  return NextResponse.json({ success: true, ...data })
}
