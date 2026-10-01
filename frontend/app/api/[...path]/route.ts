import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { API_URL } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Every /api/* call made by the pages lands here and is forwarded to the backend API
// with the signed-in user's access token. (/api/auth/* is handled by NextAuth instead.)
async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.accessToken) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const headers = new Headers()
  headers.set('Authorization', `Bearer ${token.accessToken}`)
  for (const name of ['content-type', 'accept']) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }

  const hasBody = !['GET', 'HEAD'].includes(request.method)
  let upstream: Response
  try {
    upstream = await fetch(`${API_URL}${request.nextUrl.pathname}${request.nextUrl.search}`, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: 'no-store',
    })
  } catch {
    return NextResponse.json({ success: false, error: 'API server is unreachable' }, { status: 502 })
  }

  const responseHeaders = new Headers()
  for (const name of ['content-type', 'content-disposition']) {
    const value = upstream.headers.get(name)
    if (value) responseHeaders.set(name, value)
  }
  return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders })
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE }
