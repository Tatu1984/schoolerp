import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/api/auth']

// Routes that require specific roles
const roleRoutes: Record<string, string[]> = {
  '/dashboard/security': ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
  '/dashboard/roles': ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
  '/dashboard/settings': ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
  '/api/security': ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
  '/api/roles': ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
  // Note: /api/schools access is controlled in the route handler itself
  // SCHOOL_ADMIN can view their own school, only SUPER_ADMIN can create new schools
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next()
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // files with extensions
  ) {
    return NextResponse.next()
  }

  // Get token for authentication
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  // Redirect to login if not authenticated
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check if user is active
  if (!token.isActive) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // Check role-based access
  for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(route)) {
      const userRole = token.role as string
      if (!allowedRoles.includes(userRole)) {
        // For API routes, return 403
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { success: false, error: 'Forbidden' },
            { status: 403 }
          )
        }
        // For pages, redirect to unauthorized
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
  }

  // Add user info to headers for API routes
  if (pathname.startsWith('/api/')) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', token.id as string)
    requestHeaders.set('x-user-role', token.role as string)
    requestHeaders.set('x-school-id', (token.schoolId as string) || '')

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
