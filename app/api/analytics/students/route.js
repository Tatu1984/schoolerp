import { NextResponse } from 'next/server'

export async function GET() {
  const analytics = {
    totalStudents: 0,
    averageAttendance: 0,
    topPerformers: [],
    lowPerformers: [],
    classWisePerformance: [],
    behaviorMetrics: {}
  }

  return NextResponse.json(analytics)
}
