// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { userService } from '@/services/user.service';
import { z } from 'zod';

// Validation schema for updating a user
const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  role: z.enum(['ADMIN', 'DENTIST', 'ASSISTANT']).optional(),
  licenseNumber: z.string().optional(),
  specialization: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional()
});

/**
 * GET /api/users/[id] - Get a single user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin role or is requesting their own data
    if (session.user.role !== 'ADMIN' && session.user.id !== params.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const user = await userService.getUserById(params.id);

    return NextResponse.json({
      data: user,
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id] - Update a user
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // Update user
    const updatedUser = await userService.updateUser(params.id, validatedData);

    // Log for audit
    console.log(`User updated by admin: ${session.user.email} - Updated user: ${updatedUser.email}`);

    return NextResponse.json({
      data: updatedUser,
      message: 'User updated successfully',
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message.includes('Email already')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to update user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
/**
 * DELETE /api/users/[id] - Delete a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (session.user.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const result = await userService.deleteUser(params.id);

    return NextResponse.json({
      ...result,
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
