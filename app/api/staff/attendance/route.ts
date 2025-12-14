import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  successResponse,
  errorResponse,
  validationErrorResponse,
  validateBody,
  getSchoolFilter,
  AuthenticatedSession,
} from '@/lib/api-utils'
import { staffAttendanceSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    if (!session) {
      return errorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const staffId = searchParams.get('staffId')

    const schoolFilter = getSchoolFilter(session)

    // Build where clause
    const where: Prisma.StaffAttendanceWhereInput = {
      ...(date && { date: new Date(date) }),
      ...(staffId && { staffId }),
    }

    // Apply school filter to staff relation
    if (schoolFilter.schoolId) {
      where.staff = {
        schoolId: schoolFilter.schoolId,
      }
    }

    const attendance = await prisma.staffAttendance.findMany({
      where,
      include: {
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            designation: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return successResponse(attendance)
  },
  { requireAuth: true, module: 'staff' }
)

export const POST = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    if (!session) {
      return errorResponse('Unauthorized', 401)
    }

    const { data, errors } = await validateBody(request, staffAttendanceSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    if (!data) {
      return errorResponse('Invalid request body')
    }

    const schoolFilter = getSchoolFilter(session)

    // Verify staff member exists and belongs to user's school
    const staff = await prisma.staff.findFirst({
      where: {
        id: data.staffId,
        ...schoolFilter,
      },
    })

    if (!staff) {
      return validationErrorResponse({
        staffId: ['Staff member not found or you do not have access'],
      })
    }

    const attendanceDate = new Date(data.date)

    // Check if attendance already exists
    const existing = await prisma.staffAttendance.findUnique({
      where: {
        staffId_date: {
          staffId: data.staffId,
          date: attendanceDate,
        },
      },
    })

    let attendance

    if (existing) {
      // Update existing attendance
      attendance = await prisma.staffAttendance.update({
        where: {
          staffId_date: {
            staffId: data.staffId,
            date: attendanceDate,
          },
        },
        data: {
          status: data.status,
          checkIn: data.checkIn ? new Date(data.checkIn) : null,
          checkOut: data.checkOut ? new Date(data.checkOut) : null,
          remarks: data.remarks,
        },
        include: {
          staff: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true,
            },
          },
        },
      })

      return successResponse(attendance)
    } else {
      // Create new attendance
      attendance = await prisma.staffAttendance.create({
        data: {
          staffId: data.staffId,
          date: attendanceDate,
          status: data.status,
          checkIn: data.checkIn ? new Date(data.checkIn) : null,
          checkOut: data.checkOut ? new Date(data.checkOut) : null,
          remarks: data.remarks,
        },
        include: {
          staff: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true,
            },
          },
        },
      })

      return successResponse(attendance, 201)
    }
  },
  { requireAuth: true, module: 'staff' }
)
