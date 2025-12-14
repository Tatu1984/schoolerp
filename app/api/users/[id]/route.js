import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET single user
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
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
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { email, phone, password, firstName, lastName, role, isActive, customRoleIds } = body;

    const updateData = {
      ...(email && { email }),
      ...(phone !== undefined && { phone }),
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(role && { role }),
      ...(isActive !== undefined && { isActive })
    };

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update custom roles if provided
    if (customRoleIds !== undefined) {
      // Delete existing custom roles
      await prisma.userCustomRole.deleteMany({
        where: { userId: id }
      });

      // Create new custom roles
      if (customRoleIds.length > 0) {
        await prisma.userCustomRole.createMany({
          data: customRoleIds.map(roleId => ({
            userId: id,
            roleId
          }))
        });
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
