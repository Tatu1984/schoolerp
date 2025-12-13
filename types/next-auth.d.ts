import { UserRole } from '@prisma/client'
import 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    schoolId: string
    schoolName: string
    isActive: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      schoolId: string
      schoolName: string
      isActive: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    schoolId: string
    schoolName: string
    isActive: boolean
  }
}
