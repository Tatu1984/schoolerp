import { NextResponse } from 'next/server'

export async function GET() {
  const compliance = {
    gdprCompliance: [],
    dataRetentionPolicies: [],
    complianceScore: 0
  }

  return NextResponse.json(compliance)
}
