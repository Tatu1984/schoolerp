import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  successResponse,
  errorResponse,
  validationErrorResponse,
  validateBody,
  AuthenticatedSession,
} from '@/lib/api-utils'
import { loginSchema } from '@/lib/validations'

interface LoginResponse {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    schoolId: string | null
    isActive: boolean
    school?: any
    customRoles?: any[]
  }
  token: string
  expiresIn: number
}

export const POST = withApiHandler(
  async (request: NextRequest, _context, _session: AuthenticatedSession | null) => {
    const { data, errors } = await validateBody(request, loginSchema)

    if (errors) {
      return validationErrorResponse(errors)
    }

    if (!data) {
      return errorResponse('Invalid request body')
    }

    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: data.email },
        include: {
          school: true,
          customRoles: {
            include: {
              role: true,
            },
          },
        },
      })

      if (!user) {
        return errorResponse('Invalid credentials', 401)
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(data.password, user.password)

      if (!isValidPassword) {
        return errorResponse('Invalid credentials', 401)
      }

      if (!user.isActive) {
        return errorResponse('Account is inactive', 403)
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      })

      // Create JWT token (simplified - in production use proper JWT library)
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      }

      const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64')

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user

      const response: LoginResponse = {
        user: userWithoutPassword,
        token,
        expiresIn: 86400, // 24 hours in seconds
      }

      return successResponse(
        {
          ...response,
          message: 'Login successful',
          timestamp: new Date().toISOString(),
        },
        200
      )
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Internal server error'
      return errorResponse(errorMessage, 500)
    }
  },
  { requireAuth: false } // Login endpoint doesn't require authentication
)
