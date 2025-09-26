// src/lib/email.ts
// Simplified email service without external dependencies

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

/**
 * Simple email logging function (for development)
 * Later you can replace this with actual email service when dependencies work
 * @param options Email options
 * @returns Promise with send result
 */
export async function sendEmail(options: EmailOptions) {
  try {
    console.log('=== EMAIL SERVICE CALLED ===');
    console.log('From:', options.from || process.env.FROM_EMAIL || 'noreply@smiletrace.com');
    console.log('To:', Array.isArray(options.to) ? options.to.join(', ') : options.to);
    console.log('Subject:', options.subject);
    console.log('HTML Content Length:', options.html?.length || 0);
    console.log('Text Content:', options.text?.substring(0, 100) || 'No text content');
    
    // Simulate successful send
    const mockResult = {
      id: 'email_' + Date.now(),
      to: options.to,
      subject: options.subject,
      sentAt: new Date().toISOString()
    };

    return {
      success: true,
      data: mockResult,
      error: null
    };

  } catch (error: any) {
    console.error('Email service error:', error);
    return {
      success: false,
      data: null,
      error: error.message || 'Failed to send email'
    };
  }
}

/**
 * Send receipt email with formatted content
 * @param receipt Receipt data
 * @param emailAddress Recipient email
 * @param clinicSettings Clinic settings for branding
 */
export async function sendReceiptEmail(
  receipt: any, 
  emailAddress: string, 
  clinicSettings?: any
) {
  const subject = `Receipt #${receipt.receiptNumber} - ${clinicSettings?.clinicName || 'SmileTrace'}`;
  
  const htmlContent = generateReceiptEmailHTML(receipt, clinicSettings);

  return await sendEmail({
    to: emailAddress,
    subject,
    html: htmlContent,
    from: process.env.FROM_EMAIL
  });
}

/**
 * Generate HTML content for receipt email
 */
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
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 20px; border: 1px solid #e5e7eb; border-top: 0; }
    .summary { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .total { font-size: 18px; font-weight: bold; color: #059669; }
    .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${clinicName}</h1>
    <p>Receipt #${receipt.receiptNumber}</p>
  </div>
  
  <div class="content">
    <h2>Detalii Receipt</h2>
    <div class="row">
      <span><strong>Pacient:</strong></span>
      <span>${receipt.treatment?.patient?.firstName || 'N/A'} ${receipt.treatment?.patient?.lastName || ''}</span>
    </div>
    <div class="row">
      <span><strong>Data:</strong></span>
      <span>${new Date(receipt.createdAt).toLocaleDateString('ro-RO')}</span>
    </div>
    <div class="row">
      <span><strong>Dentist:</strong></span>
      <span>${receipt.treatment?.dentist?.name || 'N/A'}</span>
    </div>
    
    <div class="summary">
      <div class="row">
        <span><strong>Subtotal:</strong></span>
        <span>${receipt.subtotal} RON</span>
      </div>
      
      ${receipt.discount > 0 ? `
      <div class="row">
        <span><strong>Discount:</strong></span>
        <span style="color: #dc2626;">-${receipt.discount} RON</span>
      </div>
      ` : ''}
      
      <div class="row">
        <span><strong>TVA:</strong></span>
        <span>${receipt.tax} RON</span>
      </div>
      
      <hr>
      
      <div class="row">
        <span><strong>TOTAL:</strong></span>
        <span class="total">${receipt.totalAmount} RON</span>
      </div>
      
      <div class="row">
        <span><strong>Plătit:</strong></span>
        <span>${receipt.paidAmount} RON</span>
      </div>
      
      ${receipt.balanceDue > 0 ? `
      <div class="row">
        <span><strong>Rest de plată:</strong></span>
        <span style="color: #dc2626; font-weight: bold;">${receipt.balanceDue} RON</span>
      </div>
      ` : `
      <div class="row">
        <span style="color: #059669; font-weight: bold;">✓ Plată completă</span>
        <span></span>
      </div>
      `}
    </div>
    
    <p><em>Vă mulțumim pentru încredere!</em></p>
  </div>

  <div class="footer">
    <p><strong>${clinicName}</strong></p>
    ${clinicAddress ? `<p>${clinicAddress}</p>` : ''}
    ${clinicPhone ? `<p>Tel: ${clinicPhone}</p>` : ''}
    ${clinicEmail ? `<p>Email: ${clinicEmail}</p>` : ''}
  </div>
</body>
</html>
  `;
}

/**
 * Test email function for development
 */
export async function testEmail() {
  try {
    const result = await sendEmail({
      to: process.env.FROM_EMAIL || 'test@example.com',
      subject: 'Test Email - SmileTrace',
      html: '<h1>Test Email</h1><p>Email service is working!</p>',
      text: 'Test Email - Email service is working!'
    });
    
    console.log('Test email result:', result);
    return result;
  } catch (error) {
    console.error('Test email failed:', error);
    return { success: false, error };
  }
}

/**
 * Send appointment reminder email
 */
export async function sendAppointmentReminder(
  appointment: any,
  patientEmail: string,
  clinicSettings?: any
) {
  const subject = `Reminder: Programare la ${clinicSettings?.clinicName || 'SmileTrace'}`;
  
  const html = `
    <h2>Reminder Programare</h2>
    <p>Aveți o programare programată pentru:</p>
    <p><strong>Data:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString('ro-RO')}</p>
    <p><strong>Ora:</strong> ${new Date(appointment.appointmentDate).toLocaleTimeString('ro-RO')}</p>
    <p><strong>Motiv:</strong> ${appointment.reason}</p>
    <p>Vă rugăm să confirmați prezența.</p>
  `;

  return await sendEmail({
    to: patientEmail,
    subject,
    html
  });
}