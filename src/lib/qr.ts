// src/lib/qr.ts
// Enhanced QR code generator with dental platform specific functions

/**
 * QR Code types for the dental platform
 */
export enum QRCodeType {
  APPOINTMENT_BOOKING = 'appointment_booking',
  RECEIPT_VERIFICATION = 'receipt_verification',
  PATIENT_PORTAL = 'patient_portal',
  TREATMENT_DETAILS = 'treatment_details',
  CLINIC_INFO = 'clinic_info'
}

/**
 * QR Code generation options
 */
interface QRCodeOptions {
  size?: number;
  format?: 'png' | 'jpg' | 'gif' | 'svg';
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
}

/**
 * Base QR code generation functions
 */

/**
 * Generate QR code URL using external service
 * @param text The text to encode
 * @param options QR code options
 * @returns Promise<string> QR code image URL
 */
export async function generateQRCodeUrl(
  text: string,
  options?: QRCodeOptions
): Promise<string> {
  try {
    const size = options?.size || 200;
    const format = options?.format || 'png';
    const errorCorrection = options?.errorCorrectionLevel || 'M';
    const margin = options?.margin || 1;
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&format=${format}&ecc=${errorCorrection}&margin=${margin}&data=${encodeURIComponent(text)}`;
    
    return qrUrl;
    
  } catch (error) {
    console.error('Error generating QR code URL:', error);
    throw new Error('Failed to generate QR code URL');
  }
}

/**
 * Generate QR code as base64 by fetching from external API
 * @param text The text to encode
 * @param options Options
 * @returns Promise<string> Base64 encoded image
 */
export async function generateQRCodeBase64(
  text: string,
  options?: QRCodeOptions
): Promise<string> {
  try {
    const qrUrl = await generateQRCodeUrl(text, options);
    
    // Fetch the image and convert to base64
    const response = await fetch(qrUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    return `data:image/png;base64,${base64}`;
    
  } catch (error) {
    console.error('Error generating QR code base64:', error);
    // Return URL as fallback
    return await generateQRCodeUrl(text, options);
  }
}

/**
 * DENTAL PLATFORM SPECIFIC QR CODE GENERATORS
 */

/**
 * Generate QR code for appointment booking
 * @param patientId Patient ID
 * @param clinicId Optional clinic ID
 * @returns Promise<string> QR code URL
 */
export async function generateAppointmentBookingQR(
  patientId: string,
  clinicId?: string
): Promise<string> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    let bookingUrl = `${baseUrl}/book-appointment?patient=${patientId}`;
    
    if (clinicId) {
      bookingUrl += `&clinic=${clinicId}`;
    }
    
    // Add UTM parameters for tracking
    bookingUrl += '&utm_source=qr_code&utm_medium=receipt&utm_campaign=appointment_booking';
    
    return await generateQRCodeUrl(bookingUrl, {
      size: 200,
      errorCorrectionLevel: 'M'
    });
  } catch (error) {
    console.error('Error generating appointment booking QR:', error);
    throw new Error('Failed to generate appointment booking QR code');
  }
}

/**
 * Generate QR code for receipt verification
 * @param receiptId Receipt ID
 * @param receiptNumber Receipt number for additional verification
 * @returns Promise<string> QR code URL
 */
export async function generateReceiptVerificationQR(
  receiptId: string,
  receiptNumber: string
): Promise<string> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify-receipt?id=${receiptId}&number=${receiptNumber}`;
    
    return await generateQRCodeUrl(verificationUrl, {
      size: 150,
      errorCorrectionLevel: 'H' // Higher error correction for important receipts
    });
  } catch (error) {
    console.error('Error generating receipt verification QR:', error);
    throw new Error('Failed to generate receipt verification QR code');
  }
}

/**
 * Generate QR code for patient portal access
 * @param patientId Patient ID
 * @param accessToken Optional temporary access token
 * @returns Promise<string> QR code URL
 */
export async function generatePatientPortalQR(
  patientId: string,
  accessToken?: string
): Promise<string> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    let portalUrl = `${baseUrl}/patient-portal?patient=${patientId}`;
    
    if (accessToken) {
      portalUrl += `&token=${accessToken}`;
    }
    
    return await generateQRCodeUrl(portalUrl, {
      size: 200,
      errorCorrectionLevel: 'M'
    });
  } catch (error) {
    console.error('Error generating patient portal QR:', error);
    throw new Error('Failed to generate patient portal QR code');
  }
}

/**
 * Generate QR code with encoded receipt data
 * @param receiptData Receipt data object
 * @returns Promise<string> QR code URL
 */
export async function generateReceiptDataQR(receiptData: {
  receiptId: string;
  receiptNumber: string;
  patientName: string;
  totalAmount: number;
  date: string;
  clinicName?: string;
}): Promise<string> {
  try {
    // Create a structured data format for the QR code
    const qrData = {
      type: 'DENTAL_RECEIPT',
      version: '1.0',
      data: {
        id: receiptData.receiptId,
        number: receiptData.receiptNumber,
        patient: receiptData.patientName,
        amount: receiptData.totalAmount,
        date: receiptData.date,
        clinic: receiptData.clinicName || 'Dental Clinic'
      }
    };
    
    // Encode as JSON string
    const encodedData = JSON.stringify(qrData);
    
    return await generateQRCodeUrl(encodedData, {
      size: 200,
      errorCorrectionLevel: 'M'
    });
  } catch (error) {
    console.error('Error generating receipt data QR:', error);
    throw new Error('Failed to generate receipt data QR code');
  }
}

/**
 * Generate QR code for clinic contact information
 * @param clinicInfo Clinic information
 * @returns Promise<string> QR code URL
 */
export async function generateClinicInfoQR(clinicInfo: {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
}): Promise<string> {
  try {
    // Create vCard format for easy contact saving
    const vcard = `BEGIN:VCARD
VERSION:3.0
ORG:${clinicInfo.name}
${clinicInfo.phone ? `TEL:${clinicInfo.phone}` : ''}
${clinicInfo.email ? `EMAIL:${clinicInfo.email}` : ''}
${clinicInfo.address ? `ADR:;;${clinicInfo.address};;;;` : ''}
${clinicInfo.website ? `URL:${clinicInfo.website}` : ''}
END:VCARD`;
    
    return await generateQRCodeUrl(vcard, {
      size: 200,
      errorCorrectionLevel: 'M'
    });
  } catch (error) {
    console.error('Error generating clinic info QR:', error);
    throw new Error('Failed to generate clinic info QR code');
  }
}

/**
 * UTILITY FUNCTIONS
 */

/**
 * Generate a secure QR code with expiration
 * @param data Data to encode
 * @param expirationHours Hours until expiration (default: 24)
 * @returns Promise<string> QR code URL
 */
export async function generateSecureQR(
  data: Record<string, any>,
  expirationHours: number = 24
): Promise<string> {
  try {
    const expirationTime = Date.now() + (expirationHours * 60 * 60 * 1000);
    
    const secureData = {
      ...data,
      expires: expirationTime,
      signature: generateSimpleHash(JSON.stringify(data) + expirationTime)
    };
    
    return await generateQRCodeUrl(JSON.stringify(secureData), {
      size: 200,
      errorCorrectionLevel: 'H'
    });
  } catch (error) {
    console.error('Error generating secure QR:', error);
    throw new Error('Failed to generate secure QR code');
  }
}

/**
 * Generate a simple hash for data integrity (basic implementation)
 * @param data Data to hash
 * @returns string Hash
 */
function generateSimpleHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

/**
 * Validate and decode QR code data
 * @param qrData QR code data string
 * @returns Decoded data or null if invalid
 */
export function decodeQRData(qrData: string): any | null {
  try {
    const parsed = JSON.parse(qrData);
    
    // Check if it's a secure QR code
    if (parsed.expires && parsed.signature) {
      // Check expiration
      if (Date.now() > parsed.expires) {
        console.warn('QR code has expired');
        return null;
      }
      
      // Verify signature (basic implementation)
      const { signature, expires, ...originalData } = parsed;
      const expectedSignature = generateSimpleHash(JSON.stringify(originalData) + expires);
      
      if (signature !== expectedSignature) {
        console.warn('QR code signature is invalid');
        return null;
      }
      
      return originalData;
    }
    
    return parsed;
  } catch (error) {
    console.error('Error decoding QR data:', error);
    return null;
  }
}

/**
 * BATCH QR CODE GENERATION
 */

/**
 * Generate multiple QR codes in batch
 * @param requests Array of QR code requests
 * @returns Promise<Array<{id: string, qrUrl: string, error?: string}>>
 */
export async function generateBatchQRCodes(
  requests: Array<{
    id: string;
    type: QRCodeType;
    data: any;
    options?: QRCodeOptions;
  }>
): Promise<Array<{id: string; qrUrl: string; error?: string}>> {
  const results = [];
  
  for (const request of requests) {
    try {
      let qrUrl: string;
      
      switch (request.type) {
        case QRCodeType.APPOINTMENT_BOOKING:
          qrUrl = await generateAppointmentBookingQR(request.data.patientId, request.data.clinicId);
          break;
        case QRCodeType.RECEIPT_VERIFICATION:
          qrUrl = await generateReceiptVerificationQR(request.data.receiptId, request.data.receiptNumber);
          break;
        case QRCodeType.PATIENT_PORTAL:
          qrUrl = await generatePatientPortalQR(request.data.patientId, request.data.accessToken);
          break;
        case QRCodeType.TREATMENT_DETAILS:
          qrUrl = await generateQRCodeUrl(JSON.stringify(request.data), request.options);
          break;
        case QRCodeType.CLINIC_INFO:
          qrUrl = await generateClinicInfoQR(request.data);
          break;
        default:
          throw new Error(`Unknown QR code type: ${request.type}`);
      }
      
      results.push({ id: request.id, qrUrl });
    } catch (error) {
      results.push({ 
        id: request.id, 
        qrUrl: '', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
  
  return results;
}

/**
 * LEGACY SUPPORT - Keep existing functions for backward compatibility
 */

/**
 * Generate QR code as base64 string using external API
 * @param text The text to encode in QR code
 * @param options QR code options
 * @returns Promise<string> Base64 QR code string
 */
export async function generateQRCode(
  text: string,
  options?: {
    size?: number;
  }
): Promise<string> {
  try {
    return await generateQRCodeUrl(text, options);
  } catch (error) {
    console.error('Error generating QR code:', error);
    // Fallback: return a simple text placeholder
    return `data:text/plain;base64,${Buffer.from(`QR Code: ${text}`).toString('base64')}`;
  }
}