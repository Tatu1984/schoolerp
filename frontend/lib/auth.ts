import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// The frontend holds no user data of its own. Sign-in is delegated to the backend API,
// and the API access token is kept inside the encrypted session cookie (never exposed
// to browser JavaScript). app/api/[...path]/route.ts attaches it to every API call.

export const API_URL = (process.env.API_URL || 'http://localhost:4000').replace(/\/$/, '')

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        let res: Response
        try {
          res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          })
        } catch {
          throw new Error('Cannot reach the server. Please try again.')
        }

        const result = await res.json().catch(() => null)
        if (!res.ok || !result?.success) {
          throw new Error(result?.error || 'Invalid email or password')
        }

        const { user, accessToken } = result.data
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          schoolId: user.schoolId,
          schoolName: user.schoolName,
          isActive: user.isActive,
          mustChangePassword: !!user.mustChangePassword,
          accessToken,
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    // Matches the lifetime of the API access token issued at login
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.schoolId = user.schoolId
        token.schoolName = user.schoolName
        token.isActive = user.isActive
        token.accessToken = user.accessToken
        token.mustChangePassword = user.mustChangePassword
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.schoolId = token.schoolId
        session.user.schoolName = token.schoolName
        session.user.isActive = token.isActive
        session.user.mustChangePassword = token.mustChangePassword
      }
      return session
    },
  },
}
