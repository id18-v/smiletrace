// src/app/api/users/[id]/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { userService } from '@/services/user.service';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
});

/**
 * POST /api/users/[id]/reset-password - Reset user password
 */
export async function POST(
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

    // Parse request body
    const body = await request.json();
    
    // If no password provided, generate one
    let newPassword = body.newPassword;
    let temporaryPassword;
    
    if (!newPassword) {
      temporaryPassword = userService.generateTemporaryPassword();
      newPassword = temporaryPassword;
    } else {
      const validation = resetPasswordSchema.parse(body);
      newPassword = validation.newPassword;
    }

    const user = await userService.resetPassword(params.id, newPassword);

    // Log for audit
    console.log(`Password reset by admin: ${session.user.email} - For user: ${user.email}`);

    return NextResponse.json({
      data: {
        ...user,
        temporaryPassword // Include if generated
      },
      message: 'Password reset successfully',
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('Error resetting password:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to reset password',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}