import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  successResponse,
  validationErrorResponse,
  validateBody
} from '@/lib/api-utils'
import { branchSchema } from '@/lib/validations'

export const GET = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    const schoolFilter = getSchoolFilter(session)

    const branches = await prisma.branch.findMany({
      where: schoolFilter,
      include: {
        school: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return successResponse(branches)
  },
  { module: 'branches' }
)

export const POST = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    // Validate request body
    const { data, errors } = await validateBody(request, branchSchema)
    if (errors) {
      return validationErrorResponse(errors)
    }

    // Apply school filter - use provided schoolId or user's schoolId
    const branchData = {
      ...data!,
      schoolId: data!.schoolId || session?.user.schoolId!,
    }

    const branch = await prisma.branch.create({
      data: branchData,
      include: {
        school: true
      }
    })

    return successResponse(branch, 201)
  },
  { module: 'branches' }
)
