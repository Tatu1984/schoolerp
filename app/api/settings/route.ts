import { NextRequest } from 'next/server'
import {
  withApiHandler,
  successResponse,
  validateBody,
  validationErrorResponse,
} from '@/lib/api-utils'
import { z } from 'zod'

// Settings schema
const settingsSchema = z.object({
  schoolName: z.string().optional(),
  schoolEmail: z.string().email().optional().or(z.literal('')),
  schoolPhone: z.string().optional(),
  schoolAddress: z.string().optional(),
  academicYearStart: z.string().optional(),
  academicYearEnd: z.string().optional(),
  enableEmailNotifications: z.boolean().optional(),
  enableSMSNotifications: z.boolean().optional(),
  enablePushNotifications: z.boolean().optional(),
  defaultLanguage: z.string().optional(),
  dateFormat: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
})

// GET /api/settings - Get settings
export const GET = withApiHandler(
  async (request: NextRequest, context, session) => {
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
      timezone: 'Asia/Kolkata',
    }

    return successResponse(settings)
  },
  { requireAuth: true, module: 'settings' }
)

// PUT /api/settings - Update settings
export const PUT = withApiHandler(
  async (request: NextRequest, context, session) => {
    const { data, errors } = await validateBody(request, settingsSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    // In a real implementation, this would save to the database
    // For now, just return success with the updated data
    return successResponse({ success: true, ...data })
  },
  { requireAuth: true, module: 'settings' }
)
