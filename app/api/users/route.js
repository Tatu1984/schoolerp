import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET all users
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    const users = await prisma.user.findMany({
      where: { schoolId },
      include: {
        school: {
          select: {
            name: true
          }
        },
        customRoles: {
          include: {
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Remove password from response
    const usersWithoutPassword = users.map(({ password, ...user }) => user);

    return NextResponse.json(usersWithoutPassword);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST create new user
export async function POST(request) {
  try {
    const body = await request.json();
    const { schoolId, email, phone, password, firstName, lastName, role, customRoleIds } = body;

    if (!schoolId || !email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with custom roles
    const user = await prisma.user.create({
      data: {
        schoolId,
        email,
        phone,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        isActive: true,
        customRoles: customRoleIds ? {
          create: customRoleIds.map(roleId => ({
            roleId
          }))
        } : undefined
      },
      include: {
        customRoles: {
          include: {
            role: true
          }
        }
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
