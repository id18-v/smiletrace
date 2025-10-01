// src/app/api/users/[id]/reactivate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { userService } from '@/services/user.service';

/**
 * POST /api/users/[id]/reactivate - Reactivate a user
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

    const user = await userService.reactivateUser(params.id);

    // Log for audit
    console.log(`User reactivated by admin: ${session.user.email} - Reactivated user: ${user.email}`);

    return NextResponse.json({
      data: user,
      message: 'User reactivated successfully',
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('Error reactivating user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to reactivate user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}