import { NextResponse } from 'next/server'

export async function GET() {
  const approved = []
  return NextResponse.json(approved)
}
