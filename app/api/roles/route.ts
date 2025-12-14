import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  getPaginationParams,
  successResponse,
  validateBody,
  validationErrorResponse,
} from '@/lib/api-utils'
import { roleSchema } from '@/lib/validations'

// GET /api/roles - Get all roles
export const GET = withApiHandler(
  async (request: NextRequest, context, session) => {
    const roles = await prisma.role.findMany({
      where: getSchoolFilter(session),
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(roles)
  },
  { requireAuth: true, module: 'roles' }
)

// POST /api/roles - Create a new role
export const POST = withApiHandler(
  async (request: NextRequest, context, session) => {
    const { data, errors } = await validateBody(request, roleSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    // Ensure schoolId is set from session if not provided
    const schoolId = data!.schoolId || session?.user.schoolId

    if (!schoolId) {
      return validationErrorResponse({
        schoolId: ['School ID is required'],
      })
    }

    const role = await prisma.role.create({
      data: {
        ...data!,
        schoolId,
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return successResponse(role, 201)
  },
  { requireAuth: true, module: 'roles' }
)
