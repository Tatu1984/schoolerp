import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single role
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role' },
      { status: 500 }
    );
  }
}

// PUT update role
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, permissions, isActive } = body;

    const role = await prisma.role.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(permissions && { permissions }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error('Error updating role:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

// DELETE role
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if role is assigned to any users
    const usersWithRole = await prisma.userCustomRole.count({
      where: { roleId: id }
    });

    if (usersWithRole > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role that is assigned to users' },
        { status: 400 }
      );
    }

    await prisma.role.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}
