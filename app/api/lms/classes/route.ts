import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  successResponse,
  validationErrorResponse,
  validateBody
} from '@/lib/api-utils'
import { z } from 'zod'

// Schema for online class (since onlineClassSchema doesn't exist in validations)
const onlineClassSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  courseId: z.string().optional().nullable(),
  classId: z.string().optional().nullable(),
  sectionId: z.string().optional().nullable(),
  teacherId: z.string().optional().nullable(),
  scheduledAt: z.string(),
  duration: z.number().int().positive().optional().nullable(),
  meetingLink: z.string().url('Invalid URL').optional().nullable(),
  description: z.string().optional().nullable(),
  schoolId: z.string(),
})

export const GET = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    const schoolFilter = getSchoolFilter(session)

    const onlineClasses = await prisma.onlineClass.findMany({
      where: schoolFilter,
      include: {
        course: true,
        class: true,
        section: true,
        teacher: true,
      },
      orderBy: { scheduledAt: 'desc' }
    })

    return successResponse(onlineClasses)
  },
  { module: 'lms' }
)

export const POST = withApiHandler(
  async (request: NextRequest, { params }, session) => {
    // Validate request body
    const { data, errors } = await validateBody(request, onlineClassSchema)
    if (errors) {
      return validationErrorResponse(errors)
    }

    const onlineClassData = {
      ...data!,
      schoolId: session?.user.schoolId!,
      scheduledAt: data!.scheduledAt ? new Date(data!.scheduledAt) : new Date(),
      duration: data!.duration || null,
    }

    const onlineClass = await prisma.onlineClass.create({
      data: onlineClassData,
      include: {
        course: true,
        class: true,
        section: true,
        teacher: true
      }
    })

    return successResponse(onlineClass, 201)
  },
  { module: 'lms' }
)
