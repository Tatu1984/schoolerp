import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const tests = []
    return NextResponse.json(tests)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    return NextResponse.json({ success: true, ...data, id: Date.now().toString() })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create test' }, { status: 500 })
  }
}
