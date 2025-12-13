import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  getPaginationParams,
  successResponse,
  validationErrorResponse,
  validateBody,
  AuthenticatedSession,
  paginatedResponse,
} from '@/lib/api-utils'
import { smartWalletSchema } from '@/lib/validations'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const isActive = searchParams.get('isActive')
    const pagination = getPaginationParams(request)

    const where: any = {}

    if (studentId) {
      where.studentId = studentId
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    // Filter by school through student relationship
    const schoolFilter = getSchoolFilter(session)
    if (schoolFilter.schoolId) {
      where.student = {
        schoolId: schoolFilter.schoolId,
      }
    }

    const [wallets, total] = await Promise.all([
      prisma.smartWallet.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              rollNumber: true,
              class: {
                select: {
                  name: true,
                  grade: true,
                },
              },
            },
          },
          transactions: {
            take: 5,
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.smartWallet.count({ where }),
    ])

    return paginatedResponse(wallets, total, pagination)
  },
  { requireAuth: true, module: 'canteen' }
)

export const POST = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const { data, errors } = await validateBody(request, smartWalletSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    // Verify student belongs to the school
    const schoolFilter = getSchoolFilter(session)
    if (schoolFilter.schoolId) {
      const student = await prisma.student.findFirst({
        where: {
          id: data!.studentId,
          schoolId: schoolFilter.schoolId,
        },
      })

      if (!student) {
        return validationErrorResponse({
          studentId: ['Student not found in your school'],
        })
      }
    }

    // Check if wallet already exists for this student
    const existingWallet = await prisma.smartWallet.findUnique({
      where: {
        studentId: data!.studentId,
      },
    })

    if (existingWallet) {
      return validationErrorResponse({
        studentId: ['Wallet already exists for this student'],
      })
    }

    const wallet = await prisma.smartWallet.create({
      data: data!,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rollNumber: true,
          },
        },
      },
    })

    return successResponse(wallet, 201)
  },
  { requireAuth: true, module: 'canteen' }
)
