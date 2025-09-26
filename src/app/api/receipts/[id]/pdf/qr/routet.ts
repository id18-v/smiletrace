// src/app/api/receipts/[id]/qr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ReceiptQRService } from '@/services/receipt-qr.service';

interface RouteParams {
  params: {
    id: string;
  };
}

// Get receipt QR codes
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'receipt';

    let qrUrl: string;

    switch (type) {
      case 'receipt':
        qrUrl = await ReceiptQRService.getReceiptQR(params.id);
        break;
      case 'verification':
        qrUrl = await ReceiptQRService.generateVerificationQR(params.id);
        break;
      case 'appointment':
        qrUrl = await ReceiptQRService.generateAppointmentQRForReceipt(params.id);
        break;
      case 'all':
        const allQRs = await ReceiptQRService.generateMultipleQRCodesForReceipt(params.id);
        return NextResponse.json({
          success: true,
          qrCodes: allQRs,
          generatedAt: new Date().toISOString()
        });
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
    console.error('Error getting receipt QR:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get QR code'
      },
      { status: 500 }
    );
  }
}

// Generate new QR code for receipt
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type = 'receipt', regenerate = false } = body;

    let qrUrl: string;

    switch (type) {
      case 'receipt':
        if (regenerate) {
          qrUrl = await ReceiptQRService.generateAndSaveReceiptQR(params.id);
        } else {
          qrUrl = await ReceiptQRService.getReceiptQR(params.id);
        }
        break;
      case 'verification':
        qrUrl = await ReceiptQRService.generateVerificationQR(params.id);
        break;
      case 'appointment':
        qrUrl = await ReceiptQRService.generateAppointmentQRForReceipt(params.id);
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
      regenerated: regenerate,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating receipt QR:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate QR code'
      },
      { status: 500 }
    );
  }
}