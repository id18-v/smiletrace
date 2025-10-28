
// src/app/api/users/[id]/deactivate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { userService } from '@/services/user.service';

/**
 * POST /api/users/[id]/deactivate - Deactivate a user
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

    // Prevent self-deactivation
    if (session.user.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot deactivate your own account' },
        { status: 400 }
      );
    }

    const user = await userService.deactivateUser(params.id);

    // Log for audit
    console.log(`User deactivated by admin: ${session.user.email} - Deactivated user: ${user.email}`);

    return NextResponse.json({
      data: user,
      message: 'User deactivated successfully',
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('Error deactivating user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to deactivate user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
