import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/api/auth']

// Students and parents only ever use the portal
const portalRoles = ['STUDENT', 'PARENT']

// Routes that require specific roles
const roleRoutes: Record<string, string[]> = {
  '/dashboard/security': ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
  '/dashboard/roles': ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
  '/dashboard/settings': ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
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
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check if user is active (explicitly check for false, not just falsy)
  if (token.isActive === false) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // A temporary password must be replaced before anything else can be used
  if (token.mustChangePassword && !pathname.startsWith('/api/')) {
    if (pathname !== '/change-password') {
      return NextResponse.redirect(new URL('/change-password', request.url))
    }
    return NextResponse.next()
  }
  if (pathname === '/change-password') {
    return NextResponse.next()
  }

  // Keep students/parents inside the portal, and staff out of it
  const isPortalUser = portalRoles.includes(token.role as string)
  const isPortalPath = pathname.startsWith('/portal') || pathname.startsWith('/api/portal')
  const isSharedPath = pathname.startsWith('/api/account')
  if (isPortalUser && !isPortalPath && !isSharedPath && pathname !== '/unauthorized') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.redirect(new URL('/portal', request.url))
  }
  if (!isPortalUser && isPortalPath) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
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
