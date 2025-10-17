import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { receiptService } from '@/services/receipt.service';
import prisma from '@/lib/db';

// POST /api/receipts - Generate new receipt
export async function POST(request: NextRequest) {
  console.log('=== CREATE RECEIPT API CALLED ===');
  
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nu ești autentificat' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    console.log('Receipt creation request:', body);

    // Validate required fields
    if (!body.treatmentId) {
      return NextResponse.json(
        { error: 'treatmentId este obligatoriu' },
        { status: 400 }
      );
    }

    // Check if treatment exists and belongs to user (if not admin)
    const treatment = await prisma.treatment.findUnique({
      where: { id: body.treatmentId },
      include: { patient: true }
    });

    if (!treatment) {
      return NextResponse.json(
        { error: 'Tratamentul nu a fost găsit' },
        { status: 404 }
      );
    }

    // Check permissions - only the dentist who did treatment or admin can create receipt
    if (session.user.role !== 'ADMIN' && treatment.dentistId !== session.user.id) {
      return NextResponse.json(
        { error: 'Nu ai permisiuni pentru acest tratament' },
        { status: 403 }
      );
    }

    // Prepare receipt data
    const receiptData = {
      treatmentId: body.treatmentId,
      issuedById: session.user.id,
      paymentMethod: body.paymentMethod,
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : undefined,
      transactionId: body.transactionId,
      emailAddress: body.emailAddress,
      customDiscount: body.customDiscount || 0,
      discountCode: body.discountCode,
      taxRate: body.taxRate || 0.08
    };

    // Generate receipt using service
    const receipt = await receiptService.generateReceipt(receiptData);

    // Create audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          userEmail: session.user.email,
          userName: session.user.name || '',
          action: 'RECEIPT_CREATED',
          entityType: 'Receipt',
          entityId: receipt.id,
          newValue: JSON.stringify({
            receiptNumber: receipt.receiptNumber,
            totalAmount: receipt.totalAmount,
            treatmentId: body.treatmentId
          })
        }
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Receipt generat cu succes!',
        receipt: {
          id: receipt.id,
          receiptNumber: receipt.receiptNumber,
          totalAmount: receipt.totalAmount,
          paidAmount: receipt.paidAmount,
          balanceDue: receipt.balanceDue,
          status: receipt.status,
          createdAt: receipt.createdAt
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Receipt creation error:', error);
    
    // Handle specific errors
    if (error.message.includes('already exists')) {
      return NextResponse.json(
        { error: 'Receipt deja există pentru acest tratament' },
        { status: 409 }
      );
    }

    if (error.message.includes('discount code')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Eroare la generarea receipt-ului' },
      { status: 500 }
    );
  }
}

// GET /api/receipts - Get all receipts (with filtering) - SIMPLIFIED VERSION
export async function GET(request: NextRequest) {
  console.log('=== GET RECEIPTS API CALLED ===');
  
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nu ești autentificat' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where condition
    const whereCondition: any = {};
    
    // Only show own receipts if not admin
    if (session.user.role !== 'ADMIN') {
      whereCondition.treatment = { dentistId: session.user.id };
    }

    if (patientId) {
      whereCondition.treatment = { 
        ...whereCondition.treatment, 
        patientId: patientId 
      };
    }

    if (status) {
      whereCondition.status = status;
    }

    // Get receipts directly from prisma
    const receipts = await prisma.receipt.findMany({
      where: whereCondition,
      include: {
        treatment: {
          include: {
            patient: true,
            dentist: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Map results with explicit typing
    const mappedReceipts = receipts.map((receiptItem: any) => ({
      id: receiptItem.id,
      receiptNumber: receiptItem.receiptNumber,
      totalAmount: receiptItem.totalAmount,
      paidAmount: receiptItem.paidAmount,
      balanceDue: receiptItem.balanceDue,
      status: receiptItem.status,
      createdAt: receiptItem.createdAt,
      patient: {
        id: receiptItem.treatment.patient.id,
        firstName: receiptItem.treatment.patient.firstName,
        lastName: receiptItem.treatment.patient.lastName,
        email: receiptItem.treatment.patient.email
      },
      dentist: {
        id: receiptItem.treatment.dentist.id,
        name: receiptItem.treatment.dentist.name,
        email: receiptItem.treatment.dentist.email
      }
    }));

    return NextResponse.json(
      {
        success: true,
        receipts: mappedReceipts
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get receipts error:', error);
    return NextResponse.json(
      { error: 'Eroare la încărcarea receipt-urilor' },
      { status: 500 }
    );
  }
}