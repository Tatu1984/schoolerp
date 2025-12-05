import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  const data = await request.json()
  return NextResponse.json({ success: true, id: params.id, ...data })
}

export async function DELETE() {
  return NextResponse.json({ success: true })
}
