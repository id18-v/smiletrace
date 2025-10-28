// api/settings/clinic/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { settingsService } from '@/services/settings.service';
import { z } from 'zod';

// Validation schema for clinic settings
const clinicSettingsSchema = z.object({
  clinicName: z.string().min(1, 'Clinic name is required').max(100),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  zipCode: z.string().max(20).optional(),
  country: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  taxId: z.string().max(50).optional(),
  licenseNumber: z.string().max(50).optional(),
  appointmentDuration: z.number().int().min(15).max(180).optional(),
  appointmentBuffer: z.number().int().min(0).max(60).optional(),
  reminderEnabled: z.boolean().optional(),
  reminderAdvanceHours: z.number().int().min(1).max(168).optional(), // Max 1 week
  receiptPrefix: z.string().max(10).optional(),
  receiptFooter: z.string().max(500).optional()
});

/**
 * PUT /api/settings/clinic - Update clinic information
 */
export async function PUT(request: NextRequest) {
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
    const validatedData = clinicSettingsSchema.parse(body);

    // Update clinic settings
    const updatedSettings = await settingsService.updateClinicSettings(validatedData);

    // Log the change for audit purposes
    console.log(`Clinic settings updated by user: ${session.user.email}`);

    return NextResponse.json({
      data: updatedSettings,
      message: 'Clinic settings updated successfully',
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating clinic settings:', error);
    
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
        error: 'Failed to update clinic settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
