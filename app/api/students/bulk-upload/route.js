import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded', errors: ['File is required'] },
        { status: 400 }
      )
    }

    // Read CSV content
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      return NextResponse.json(
        { success: false, message: 'CSV file is empty', errors: ['No data rows found'] },
        { status: 400 }
      )
    }

    const headers = lines[0].split(',').map(h => h.trim())
    const errors = []
    let created = 0

    // Get first school (for demo purposes - in production, this should be from auth)
    const school = await prisma.school.findFirst()
    if (!school) {
      return NextResponse.json(
        { success: false, message: 'No school found', errors: ['Please create a school first'] },
        { status: 400 }
      )
    }

    // Get current academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: { schoolId: school.id, isCurrent: true }
    })

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim())
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })

        // Validate required fields
        if (!row.admissionNumber || !row.firstName || !row.lastName) {
          errors.push(`Row ${i + 1}: Missing required fields (admissionNumber, firstName, lastName)`)
          continue
        }

        // Check if admission number already exists
        const existingStudent = await prisma.student.findFirst({
          where: {
            schoolId: school.id,
            admissionNumber: row.admissionNumber
          }
        })

        if (existingStudent) {
          errors.push(`Row ${i + 1}: Admission number ${row.admissionNumber} already exists`)
          continue
        }

        // Find class
        const classRecord = await prisma.class.findFirst({
          where: {
            schoolId: school.id,
            name: row.className
          }
        })

        if (!classRecord) {
          errors.push(`Row ${i + 1}: Class ${row.className} not found`)
          continue
        }

        // Find section
        let section = null
        if (row.sectionName) {
          section = await prisma.section.findFirst({
            where: {
              classId: classRecord.id,
              name: row.sectionName
            }
          })
        }

        // Create student
        const student = await prisma.student.create({
          data: {
            schoolId: school.id,
            classId: classRecord.id,
            sectionId: section?.id,
            admissionNumber: row.admissionNumber,
            firstName: row.firstName,
            lastName: row.lastName,
            dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : new Date(),
            gender: row.gender || 'MALE',
            bloodGroup: row.bloodGroup || null,
            phone: row.phone || null,
            email: row.email || null,
            address: row.address || null,
            city: row.city || null,
            state: row.state || null,
            pincode: row.pincode || null,
            nationality: row.nationality || null,
            religion: row.religion || null,
            admissionDate: new Date(),
            guardians: {
              create: row.guardianFirstName ? [{
                firstName: row.guardianFirstName,
                lastName: row.guardianLastName || '',
                relation: row.guardianRelation || 'Parent',
                phone: row.guardianPhone || '',
                email: row.guardianEmail || null,
                isPrimary: true
              }] : []
            }
          }
        })

        created++
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: created > 0,
      message: created > 0
        ? `Successfully uploaded ${created} students`
        : 'No students were uploaded',
      created,
      errors,
      total: lines.length - 1
    })

  } catch (error) {
    console.error('Error in bulk upload:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', errors: [error.message] },
      { status: 500 }
    )
  }
}
