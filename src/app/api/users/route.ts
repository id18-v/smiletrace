// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { userService } from '@/services/user.service';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

// Validation schema for creating a user
const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['ADMIN', 'DENTIST', 'ASSISTANT']),
  licenseNumber: z.string().optional(),
  specialization: z.string().optional(),
  phone: z.string().optional()
});

/**
 * GET /api/users - Get all users
 */
export async function GET(request: NextRequest) {
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

    // Get query parameters for filters
    const { searchParams } = new URL(request.url);
    const filters = {
      role: searchParams.get('role') as UserRole | undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      search: searchParams.get('search') || undefined
    };

    const users = await userService.getUsers(filters);

    return NextResponse.json({
      data: users,
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users - Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.', success: false },
        { status: 403 }
      );
    }

    // Parse request body - with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid request body',
          success: false,
          details: 'Request body must be valid JSON'
        },
        { status: 400 }
      );
    }
    
    // If no password provided, generate one
    if (!body.password) {
      body.password = userService.generateTemporaryPassword();
      body.temporaryPassword = body.password; // Send it back in response
    }

    // Validate data
    let validatedData;
    try {
      validatedData = createUserSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            success: false,
            details: validationError.issues
          },
          { status: 400 }
        );
      }
      throw validationError;
    }

    // Create user
    const user = await userService.createUser(validatedData);

    // Log for audit
    console.log(`User created by admin: ${session.user.email} - New user: ${user.email}`);

    return NextResponse.json({
      data: {
        ...user,
        temporaryPassword: body.temporaryPassword // Include if generated
      },
      message: 'User created successfully',
      success: true
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);

    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { 
          error: error.message,
          success: false 
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to create user',
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}