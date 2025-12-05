'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'
import { getDefaultDashboard } from '@/lib/rolePermissions'

export default function UnauthorizedPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleGoBack = () => {
    if (session?.user?.role) {
      const defaultPath = getDefaultDashboard(session.user.role)
      router.push(defaultPath)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-12 h-12 text-red-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>

          <p className="text-gray-600 mb-8">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>

          <button
            onClick={handleGoBack}
            className="btn btn-primary w-full"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
