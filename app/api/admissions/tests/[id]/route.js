import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  try {
    const data = await request.json()
    return NextResponse.json({ success: true, id: params.id, ...data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update test' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete test' }, { status: 500 })
  }
}
