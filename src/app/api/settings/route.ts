import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth'; // Your auth.ts file
import settingsService from '@/services/settings.service';
/**
 * GET /api/settings - Get all settings
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

    // Get all settings
    const clinicSettings = await settingsService.getClinicSettings();
    const emailTemplates = await settingsService.getEmailTemplates();

    const response = {
      clinic: clinicSettings,
      emailTemplates,
      success: true
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}