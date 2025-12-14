import { NextResponse } from 'next/server'

export async function GET() {
  const analytics = {
    overallAttendance: 0,
    presentToday: 0,
    absentToday: 0,
    defaulters: [],
    classWiseAttendance: [],
    attendanceTrend: []
  }

  return NextResponse.json(analytics)
}
