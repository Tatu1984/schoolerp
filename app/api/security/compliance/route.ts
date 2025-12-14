import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  successResponse,
  hasMinimumRole,
  errorResponse,
  AuthenticatedSession
} from '@/lib/api-utils'

interface ComplianceData {
  gdprCompliance: any[]
  dataRetentionPolicies: any[]
  complianceScore: number
}

export const GET = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    // Role check
    if (!session || !hasMinimumRole(session.user.role, 'SCHOOL_ADMIN')) {
      return errorResponse('Access denied', 403)
    }

    // Apply school filter
    const schoolFilter = getSchoolFilter(session)

    // In a real implementation, you would:
    // 1. Fetch GDPR compliance records
    // 2. Fetch data retention policies
    // 3. Calculate compliance score

    // Fetch compliance records
    const compliance: ComplianceData = {
      gdprCompliance: await prisma.complianceRecord.findMany({
        where: {
          complianceType: 'GDPR',
          ...schoolFilter
        },
        orderBy: { createdAt: 'desc' }
      }),
      dataRetentionPolicies: [], // DataRetentionPolicy model doesn't exist
      complianceScore: 0
    }

    // Calculate compliance score if records exist
    if (compliance.gdprCompliance.length > 0) {
      const compliantRecords = compliance.gdprCompliance.filter(
        (record: any) => record.status === 'compliant'
      ).length
      compliance.complianceScore = Math.round(
        (compliantRecords / compliance.gdprCompliance.length) * 100
      )
    }

    return successResponse(compliance)
  },
  { requireAuth: true, module: 'security' }
)

export const POST = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    // Role check
    if (!session || !hasMinimumRole(session.user.role, 'SCHOOL_ADMIN')) {
      return errorResponse('Access denied', 403)
    }

    const body = await request.json()
    const { complianceType, description, status, validFrom, validUntil, isActive } = body

    const schoolId = session.user.schoolId
    if (!schoolId) {
      return errorResponse('School ID is required', 400)
    }

    // Create a new compliance record
    const complianceRecord = await prisma.complianceRecord.create({
      data: {
        schoolId,
        complianceType: complianceType || 'GDPR',
        description,
        status: status || 'ACTIVE',
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
        isActive: isActive ?? true,
      }
    })

    return successResponse(complianceRecord, 201)
  },
  { requireAuth: true, module: 'security' }
)
