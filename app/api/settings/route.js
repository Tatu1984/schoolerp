import { NextResponse } from 'next/server'

export async function GET() {
  const settings = {
    schoolName: '',
    schoolEmail: '',
    schoolPhone: '',
    schoolAddress: '',
    academicYearStart: '',
    academicYearEnd: '',
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    enablePushNotifications: true,
    defaultLanguage: 'en',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR',
    timezone: 'Asia/Kolkata'
  }

  return NextResponse.json(settings)
}

export async function PUT(request) {
  const data = await request.json()
  return NextResponse.json({ success: true, ...data })
}
