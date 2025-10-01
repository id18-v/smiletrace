import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { settingsService } from '@/services/settings.service';
import { z } from 'zod';

// Validation schema for test email
const testEmailSchema = z.object({
  templateId: z.enum(['appointmentConfirmation', 'appointmentReminder', 'receiptGenerated']),
  recipientEmail: z.string().email('Valid email is required'),
  testData: z.record(z.string(), z.string()).optional() // Variables for template
});

/**
 * POST /api/settings/test-email - Send test email
 */
export async function POST(request: NextRequest) {
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
    const validatedData = testEmailSchema.parse(body);

    // Get email templates
    const emailTemplates = await settingsService.getEmailTemplates();
    const template = emailTemplates[validatedData.templateId];

    if (!template) {
      return NextResponse.json(
        { error: 'Email template not found' },
        { status: 404 }
      );
    }

    // Prepare test data
    const defaultTestData = {
      patientName: 'John Doe',
      appointmentDate: '2024-03-15',
      appointmentTime: '10:00 AM',
      doctorName: 'Dr. Smith',
      appointmentType: 'Cleaning',
      clinicName: 'Test Dental Clinic',
      clinicPhone: '(555) 123-4567',
      receiptNumber: 'RCP-001',
      paymentDate: '2024-03-15',
      paidAmount: '150.00',
      paymentMethod: 'Credit Card',
      treatmentDescription: 'Dental Cleaning'
    };

    const templateData = { ...defaultTestData, ...validatedData.testData };

    // Replace variables in template (basic implementation)
    let processedSubject = template.subject;
    let processedHtmlContent = template.htmlContent;

    Object.entries(templateData).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), value);
      processedHtmlContent = processedHtmlContent.replace(new RegExp(placeholder, 'g'), value);
    });

    // Here you would integrate with your email service (SendGrid, AWS SES, etc.)
    // For now, we'll just return the processed template
    console.log(`Test email would be sent to: ${validatedData.recipientEmail}`);
    console.log(`Subject: ${processedSubject}`);

    return NextResponse.json({
      message: 'Test email processed successfully',
      preview: {
        to: validatedData.recipientEmail,
        subject: processedSubject,
        htmlContent: processedHtmlContent
      },
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('Error sending test email:', error);
    
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
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}