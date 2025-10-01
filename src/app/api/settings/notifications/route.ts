import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { settingsService, EmailTemplates, ClinicSettingsData } from '@/services/settings.service';
import { z } from 'zod';

// Validation schema for email template
const emailTemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Template name is required'),
  subject: z.string().min(1, 'Subject is required').max(200),
  htmlContent: z.string().min(1, 'HTML content is required'),
  textContent: z.string().min(1, 'Text content is required'),
  variables: z.array(z.string())
});

// Validation schema for notification settings
const notificationSettingsSchema = z.object({
  reminderEnabled: z.boolean().optional(),
  reminderAdvanceHours: z.number().int().min(1).max(168).optional(),
  emailTemplates: z.object({
    appointmentConfirmation: emailTemplateSchema.optional(),
    appointmentReminder: emailTemplateSchema.optional(),
    appointmentCancellation: emailTemplateSchema.optional(),
    treatmentComplete: emailTemplateSchema.optional(),
    paymentReceived: emailTemplateSchema.optional(),
    receiptGenerated: emailTemplateSchema.optional()
  }).optional()
});

/**
 * GET /api/settings/notifications - Get notification settings
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

    // Get clinic settings for reminder configuration
    const clinicSettings = await settingsService.getClinicSettings();
    const emailTemplates = await settingsService.getEmailTemplates();

    const response = {
      reminderEnabled: clinicSettings?.reminderEnabled ?? true,
      reminderAdvanceHours: clinicSettings?.reminderAdvanceHours ?? 24,
      emailTemplates,
      success: true
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch notification settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings/notifications - Update notification settings
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
    const validatedData = notificationSettingsSchema.parse(body);

    let updatedClinicSettings = null;
    let updatedEmailTemplates = null;

    // Update clinic reminder settings if provided
    if (validatedData.reminderEnabled !== undefined || validatedData.reminderAdvanceHours !== undefined) {
      const currentSettings = await settingsService.getClinicSettings();
      
      const settingsUpdate = {
        ...currentSettings,
        reminderEnabled: validatedData.reminderEnabled ?? currentSettings?.reminderEnabled ?? true,
        reminderAdvanceHours: validatedData.reminderAdvanceHours ?? currentSettings?.reminderAdvanceHours ?? 24
      } as ClinicSettingsData;

      updatedClinicSettings = await settingsService.updateClinicSettings(settingsUpdate);
    }

    // Update email templates if provided
    if (validatedData.emailTemplates) {
      updatedEmailTemplates = await settingsService.updateEmailTemplates(validatedData.emailTemplates);
    }

    // Log the change for audit purposes
    console.log(`Notification settings updated by user: ${session.user.email}`);

    return NextResponse.json({
      data: {
        reminderSettings: updatedClinicSettings ? {
          reminderEnabled: updatedClinicSettings.reminderEnabled,
          reminderAdvanceHours: updatedClinicSettings.reminderAdvanceHours
        } : null,
        emailTemplates: updatedEmailTemplates
      },
      message: 'Notification settings updated successfully',
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating notification settings:', error);
    
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
        error: 'Failed to update notification settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}