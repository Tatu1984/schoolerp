import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  successResponse,
  validationErrorResponse,
  validateBody,
  notFoundResponse
} from '@/lib/api-utils'
import { branchSchema } from '@/lib/validations'

export const PUT = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    const schoolFilter = getSchoolFilter(session)

    // Check if branch exists and user has access
    const existingBranch = await prisma.branch.findFirst({
      where: {
        id: params.id,
        ...schoolFilter
      }
    })

    if (!existingBranch) {
      return notFoundResponse('Branch not found')
    }

    // Validate request body
    const { data, errors } = await validateBody(request, branchSchema.partial().omit({ schoolId: true }))
    if (errors) {
      return validationErrorResponse(errors)
    }

    const branch = await prisma.branch.update({
      where: { id: params.id },
      data: data!,
      include: {
        school: true
      }
    })

    return successResponse(branch)
  },
  { requireAuth: true, module: 'branches' }
)

export const DELETE = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    const schoolFilter = getSchoolFilter(session)

    // Check if branch exists and user has access
    const existingBranch = await prisma.branch.findFirst({
      where: {
        id: params.id,
        ...schoolFilter
      }
    })

    if (!existingBranch) {
      return notFoundResponse('Branch not found')
    }

    await prisma.branch.delete({
      where: { id: params.id }
    })

    return successResponse({ message: 'Branch deleted successfully' })
  },
  { requireAuth: true, module: 'branches' }
)
