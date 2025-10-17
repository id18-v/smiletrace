import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { receiptService } from '@/services/receipt.service';
import prisma from '@/lib/db';

// Simple email implementation without external package - NO RESEND IMPORT
const sendSimpleEmail = async (to: string, subject: string, html: string) => {
  // For now, just log the email (you can implement Resend later when npm works)
  console.log('=== EMAIL TO BE SENT ===');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Content Preview:', html.substring(0, 300) + '...');
  
  // Simulate success
  return { success: true, id: 'mock-email-' + Date.now() };
};

// POST /api/receipts/[id]/email - Send receipt email
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== SEND RECEIPT EMAIL API CALLED ===');
  console.log('Receipt ID:', params.id);
  
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nu ești autentificat' },
        { status: 401 }
      );
    }

    // Validate receipt ID
    if (!params.id) {
      return NextResponse.json(
        { error: 'ID receipt invalid' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    console.log('Email request:', body);

    // Get receipt with permissions check
    const receipt = await receiptService.getReceiptById(params.id);

    // Check permissions - only the dentist who created receipt or admin can send emails
    const canSendEmail = session.user.role === 'ADMIN' || 
                        receipt.treatment.dentistId === session.user.id;

    if (!canSendEmail) {
      return NextResponse.json(
        { error: 'Nu ai permisiuni pentru această acțiune' },
        { status: 403 }
      );
    }

    // Determine email address
    const emailAddress = body.emailAddress || 
                        receipt.emailAddress || 
                        receipt.treatment.patient.email;

    if (!emailAddress) {
      return NextResponse.json(
        { error: 'Adresa de email nu a fost găsită' },
        { status: 400 }
      );
    }

    // Get clinic settings for email template
    const clinicSettings = await prisma.clinicSettings.findFirst();
    
    // Prepare email content
    const emailSubject = body.subject || `Receipt #${receipt.receiptNumber} - SmileTrace`;
    
    const emailContent = generateReceiptEmailHTML(receipt, clinicSettings);

    // Send email (simple implementation - no external packages)
    try {
      const emailResult = await sendSimpleEmail(emailAddress, emailSubject, emailContent);

      console.log('Email sent successfully:', emailResult);

      // Mark email as sent in database - DIRECT PRISMA UPDATE (no service method)
      await prisma.receipt.update({
        where: { id: params.id },
        data: {
          emailSent: true,
          emailSentAt: new Date(),
          emailAddress: emailAddress
        }
      });

      // Create audit log
      try {
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            userEmail: session.user.email,
            userName: session.user.name || '',
            action: 'RECEIPT_EMAIL_SENT',
            entityType: 'Receipt',
            entityId: params.id,
            newValue: JSON.stringify({
              emailAddress,
              subject: emailSubject,
              sentAt: new Date().toISOString()
            })
          }
        });
      } catch (auditError) {
        console.error('Failed to create audit log:', auditError);
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Email trimis cu succes! (simulat în consolă)',
          email: {
            to: emailAddress,
            subject: emailSubject,
            sentAt: new Date(),
            messageId: emailResult.id
          }
        },
        { status: 200 }
      );

    } catch (emailError: any) {
      console.error('Email sending error:', emailError);
      
      return NextResponse.json(
        {
          error: 'Eroare la trimiterea email-ului',
          details: emailError.message
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Send email error:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Receipt nu a fost găsit' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Eroare la trimiterea email-ului' },
      { status: 500 }
    );
  }
}

// GET /api/receipts/[id]/email - Get email status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== GET EMAIL STATUS API CALLED ===');
  console.log('Receipt ID:', params.id);
  
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nu ești autentificat' },
        { status: 401 }
      );
    }

    // Get receipt with permissions check
    const receipt = await receiptService.getReceiptById(params.id);

    // Check permissions
    const canView = session.user.role === 'ADMIN' || 
                   receipt.treatment.dentistId === session.user.id;

    if (!canView) {
      return NextResponse.json(
        { error: 'Nu ai permisiuni pentru acest receipt' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        emailStatus: {
          emailSent: receipt.emailSent,
          emailSentAt: receipt.emailSentAt,
          emailAddress: receipt.emailAddress,
          patientEmail: receipt.treatment.patient.email
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Get email status error:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Receipt nu a fost găsit' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Eroare la încărcarea statusului email' },
      { status: 500 }
    );
  }
}

// Helper function to generate receipt email HTML
function generateReceiptEmailHTML(receipt: any, clinicSettings: any) {
  const clinicName = clinicSettings?.clinicName || 'SmileTrace Dental Clinic';
  const clinicAddress = clinicSettings?.address || '';
  const clinicPhone = clinicSettings?.phone || '';
  const clinicEmail = clinicSettings?.email || '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt #${receipt.receiptNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; background-color: #f8f9fa; padding: 20px; border-radius: 8px; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    .receipt-info { background-color: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .label { font-weight: bold; }
    .amount { font-size: 18px; color: #059669; font-weight: bold; }
    .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">${clinicName}</div>
      <p>Receipt pentru servicii dentare</p>
    </div>

    <div class="receipt-info">
      <h2>Receipt #${receipt.receiptNumber}</h2>
      
      <div class="row">
        <span class="label">Pacient:</span>
        <span>${receipt.treatment.patient.firstName} ${receipt.treatment.patient.lastName}</span>
      </div>
      
      <div class="row">
        <span class="label">Dentist:</span>
        <span>${receipt.treatment.dentist.name}</span>
      </div>
      
      <div class="row">
        <span class="label">Data tratament:</span>
        <span>${new Date(receipt.treatment.treatmentDate).toLocaleDateString('ro-RO')}</span>
      </div>

      <hr>

      <div class="row">
        <span class="label">Subtotal:</span>
        <span>${receipt.subtotal} RON</span>
      </div>
      
      ${receipt.discount > 0 ? `
      <div class="row">
        <span class="label">Discount:</span>
        <span>-${receipt.discount} RON</span>
      </div>
      ` : ''}
      
      <div class="row">
        <span class="label">TVA:</span>
        <span>${receipt.tax} RON</span>
      </div>
      
      <div class="row" style="font-size: 18px; font-weight: bold; border-top: 2px solid #e5e7eb; padding-top: 10px;">
        <span>TOTAL:</span>
        <span class="amount">${receipt.totalAmount} RON</span>
      </div>
      
      <div class="row">
        <span class="label">Suma plătită:</span>
        <span>${receipt.paidAmount} RON</span>
      </div>
      
      ${receipt.balanceDue > 0 ? `
      <div class="row" style="color: #dc2626;">
        <span class="label">Rest de plată:</span>
        <span>${receipt.balanceDue} RON</span>
      </div>
      ` : ''}
    </div>

    <div class="footer">
      <p><strong>${clinicName}</strong></p>
      ${clinicAddress ? `<p>${clinicAddress}</p>` : ''}
      ${clinicPhone ? `<p>Tel: ${clinicPhone}</p>` : ''}
      ${clinicEmail ? `<p>Email: ${clinicEmail}</p>` : ''}
      <p>Mulțumim pentru încredere!</p>
    </div>
  </div>
</body>
</html>
  `;
}