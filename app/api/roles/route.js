import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all roles
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let schoolId = searchParams.get('schoolId');

    // Get default school if not provided
    if (!schoolId) {
      const defaultSchool = await prisma.school.findFirst();
      if (defaultSchool) {
        schoolId = defaultSchool.id;
      } else {
        // Return empty array if no schools exist
        return NextResponse.json([]);
      }
    }

    const roles = await prisma.role.findMany({
      where: { schoolId },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST create new role
export async function POST(request) {
  try {
    const body = await request.json();
    let { schoolId, name, description, permissions } = body;

    // Get default school if not provided
    if (!schoolId) {
      const defaultSchool = await prisma.school.findFirst();
      if (defaultSchool) {
        schoolId = defaultSchool.id;
      }
    }

    if (!schoolId || !name || !permissions) {
      return NextResponse.json(
        { error: 'School ID, name, and permissions are required' },
        { status: 400 }
      );
    }

    const role = await prisma.role.create({
      data: {
        schoolId,
        name,
        description,
        permissions,
        isActive: true
      }
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error('Error creating role:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Role with this name already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}
