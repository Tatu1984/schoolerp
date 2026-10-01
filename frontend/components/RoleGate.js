'use client'

import { useSession } from 'next-auth/react'
import { hasAccess } from '@/lib/rolePermissions'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RoleGate({ children }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    // Check if user has access to current path
    if (pathname.startsWith('/dashboard')) {
      const userRole = session?.user?.role
      if (!hasAccess(userRole, pathname)) {
        // Redirect to unauthorized page or default dashboard
        router.push('/unauthorized')
      }
    }
  }, [session, status, pathname, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}
