import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { receiptService } from '@/services/receipt.service';
import prisma from '@/lib/db';

// PUT /api/receipts/[id]/payment - Record payment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== RECORD PAYMENT API CALLED ===');
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
    console.log('Payment data:', body);

    // Validate required fields
    if (!body.paymentMethod) {
      return NextResponse.json(
        { error: 'Metoda de plată este obligatorie' },
        { status: 400 }
      );
    }

    if (!body.paidAmount || body.paidAmount <= 0) {
      return NextResponse.json(
        { error: 'Suma plătită trebuie să fie mai mare decât 0' },
        { status: 400 }
      );
    }

    // Check if receipt exists and get permissions
    const receipt = await receiptService.getReceiptById(params.id);

    // Check permissions - only the dentist who created receipt or admin can record payments
    const canRecordPayment = session.user.role === 'ADMIN' || 
                            receipt.treatment.dentistId === session.user.id;

    if (!canRecordPayment) {
      return NextResponse.json(
        { error: 'Nu ai permisiuni pentru această acțiune' },
        { status: 403 }
      );
    }

    // Prepare payment data
    const paymentData = {
      receiptId: params.id,
      paymentMethod: body.paymentMethod,
      paidAmount: parseFloat(body.paidAmount),
      transactionId: body.transactionId,
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date()
    };

    // Process payment using service
    const updatedReceipt = await receiptService.processPayment(paymentData);

    // Create audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          userEmail: session.user.email,
          userName: session.user.name || '',
          action: 'PAYMENT_RECORDED',
          entityType: 'Receipt',
          entityId: params.id,
          newValue: JSON.stringify({
            paymentAmount: paymentData.paidAmount,
            paymentMethod: paymentData.paymentMethod,
            transactionId: paymentData.transactionId,
            newBalance: updatedReceipt.balanceDue,
            newStatus: updatedReceipt.status
          })
        }
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Plata înregistrată cu succes!',
        payment: {
          receiptId: updatedReceipt.id,
          receiptNumber: updatedReceipt.receiptNumber,
          totalAmount: updatedReceipt.totalAmount,
          paidAmount: updatedReceipt.paidAmount,
          balanceDue: updatedReceipt.balanceDue,
          paymentMethod: updatedReceipt.paymentMethod,
          paymentDate: updatedReceipt.paymentDate,
          transactionId: updatedReceipt.transactionId,
          status: updatedReceipt.status,
          updatedAt: updatedReceipt.updatedAt
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Record payment error:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Receipt nu a fost găsit' },
        { status: 404 }
      );
    }

    if (error.message.includes('exceed balance due')) {
      return NextResponse.json(
        { error: 'Suma plătită nu poate depăși restul de plată' },
        { status: 400 }
      );
    }

    if (error.message.includes('greater than 0')) {
      return NextResponse.json(
        { error: 'Suma plătită trebuie să fie mai mare decât 0' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Eroare la înregistrarea plății' },
      { status: 500 }
    );
  }
}

// GET /api/receipts/[id]/payment - Get payment history (simplified)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== GET PAYMENT HISTORY API CALLED ===');
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

    // Get receipt with permissions check
    const receipt = await receiptService.getReceiptById(params.id);

    // Check permissions
    const canView = session.user.role === 'ADMIN' || 
                   receipt.treatment.dentistId === session.user.id ||
                   receipt.treatment.patient.email === session.user.email;

    if (!canView) {
      return NextResponse.json(
        { error: 'Nu ai permisiuni pentru acest receipt' },
        { status: 403 }
      );
    }

    // Get payment history from audit logs
    const paymentHistory = await prisma.auditLog.findMany({
      where: {
        action: 'PAYMENT_RECORDED',
        entityType: 'Receipt',
        entityId: params.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        createdAt: true,
        newValue: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Parse payment history with fixed typing
    const payments = paymentHistory.map((auditLogEntry: any) => {
      try {
        const paymentData = JSON.parse(auditLogEntry.newValue || '{}');
        return {
          id: auditLogEntry.id,
          paymentDate: auditLogEntry.createdAt,
          amount: paymentData.paymentAmount,
          method: paymentData.paymentMethod,
          transactionId: paymentData.transactionId,
          recordedBy: auditLogEntry.user
        };
      } catch {
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json(
      {
        success: true,
        receipt: {
          id: receipt.id,
          receiptNumber: receipt.receiptNumber,
          totalAmount: receipt.totalAmount,
          paidAmount: receipt.paidAmount,
          balanceDue: receipt.balanceDue,
          status: receipt.status
        },
        payments
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Get payment history error:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Receipt nu a fost găsit' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Eroare la încărcarea istoricului de plăți' },
      { status: 500 }
    );
  }
}