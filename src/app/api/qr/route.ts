// src/app/api/qr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  generateAppointmentBookingQR,
  generateReceiptVerificationQR,
  generatePatientPortalQR,
  generateReceiptDataQR,
  generateClinicInfoQR,
  generateBatchQRCodes,
  QRCodeType
} from '@/lib/qr';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, data, options } = body;

    let qrUrl: string;

    switch (type) {
      case QRCodeType.APPOINTMENT_BOOKING:
        if (!data.patientId) {
          return NextResponse.json(
            { error: 'Patient ID is required for appointment booking QR' },
            { status: 400 }
          );
        }
        qrUrl = await generateAppointmentBookingQR(data.patientId, data.clinicId);
        break;

      case QRCodeType.RECEIPT_VERIFICATION:
        if (!data.receiptId || !data.receiptNumber) {
          return NextResponse.json(
            { error: 'Receipt ID and number are required for verification QR' },
            { status: 400 }
          );
        }
        qrUrl = await generateReceiptVerificationQR(data.receiptId, data.receiptNumber);
        break;

      case QRCodeType.PATIENT_PORTAL:
        if (!data.patientId) {
          return NextResponse.json(
            { error: 'Patient ID is required for patient portal QR' },
            { status: 400 }
          );
        }
        qrUrl = await generatePatientPortalQR(data.patientId, data.accessToken);
        break;

      case QRCodeType.TREATMENT_DETAILS:
        if (!data.receiptId || !data.receiptNumber || !data.patientName || !data.totalAmount || !data.date) {
          return NextResponse.json(
            { error: 'Complete receipt data is required for receipt data QR' },
            { status: 400 }
          );
        }
        qrUrl = await generateReceiptDataQR({
          receiptId: data.receiptId,
          receiptNumber: data.receiptNumber,
          patientName: data.patientName,
          totalAmount: data.totalAmount,
          date: data.date,
          clinicName: data.clinicName
        });
        break;

      case QRCodeType.CLINIC_INFO:
        if (!data.name) {
          return NextResponse.json(
            { error: 'Clinic name is required for clinic info QR' },
            { status: 400 }
          );
        }
        qrUrl = await generateClinicInfoQR(data);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid QR code type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      qrUrl,
      type,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}

// Batch QR code generation
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { requests } = body;

    if (!Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json(
        { error: 'Requests array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    if (requests.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 QR codes can be generated in a single batch' },
        { status: 400 }
      );
    }

    const results = await generateBatchQRCodes(requests);

    return NextResponse.json({
      success: true,
      results,
      generatedAt: new Date().toISOString(),
      total: results.length,
      successful: results.filter(r => !r.error).length,
      failed: results.filter(r => r.error).length
    });

  } catch (error) {
    console.error('Error generating batch QR codes:', error);
    return NextResponse.json(
      { error: 'Failed to generate batch QR codes' },
      { status: 500 }
    );
  }
}