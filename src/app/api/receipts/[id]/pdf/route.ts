import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { receiptService } from '@/services/receipt.service';
import prisma from '@/lib/db';

// GET /api/receipts/[id] - Get receipt details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== GET RECEIPT BY ID API CALLED ===');
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

    // Get receipt using service
    const receipt = await receiptService.getReceiptById(params.id);

    // Check permissions - only the dentist who created receipt, admin, or patient can view
    const canView = session.user.role === 'ADMIN' || 
                   receipt.treatment.dentistId === session.user.id ||
                   receipt.treatment.patient.email === session.user.email;

    if (!canView) {
      return NextResponse.json(
        { error: 'Nu ai permisiuni pentru acest receipt' },
        { status: 403 }
      );
    }

    // Return detailed receipt information with fixed typing
    return NextResponse.json(
      {
        success: true,
        receipt: {
          id: receipt.id,
          receiptNumber: receipt.receiptNumber,
          subtotal: receipt.subtotal,
          discount: receipt.discount,
          tax: receipt.tax,
          totalAmount: receipt.totalAmount,
          paidAmount: receipt.paidAmount,
          balanceDue: receipt.balanceDue,
          paymentMethod: receipt.paymentMethod,
          paymentDate: receipt.paymentDate,
          transactionId: receipt.transactionId,
          status: receipt.status,
          qrCode: receipt.qrCode,
          emailSent: receipt.emailSent,
          emailSentAt: receipt.emailSentAt,
          emailAddress: receipt.emailAddress,
          createdAt: receipt.createdAt,
          updatedAt: receipt.updatedAt,
          // Treatment details
          treatment: {
            id: receipt.treatment.id,
            chiefComplaint: receipt.treatment.chiefComplaint,
            diagnosis: receipt.treatment.diagnosis,
            treatmentPlan: receipt.treatment.treatmentPlan,
            treatmentDate: receipt.treatment.treatmentDate,
            notes: receipt.treatment.notes,
            // Treatment items (procedures) - Fixed with explicit typing
            items: receipt.treatment.items.map((treatmentItem: any) => ({
              id: treatmentItem.id,
              quantity: treatmentItem.quantity,
              unitCost: treatmentItem.unitCost,
              totalCost: treatmentItem.totalCost,
              toothNumbers: treatmentItem.toothNumbers,
              toothSurfaces: treatmentItem.toothSurfaces,
              procedure: {
                code: treatmentItem.procedure.code,
                name: treatmentItem.procedure.name,
                category: treatmentItem.procedure.category,
                description: treatmentItem.procedure.description
              }
            }))
          },
          // Patient details
          patient: {
            id: receipt.treatment.patient.id,
            firstName: receipt.treatment.patient.firstName,
            lastName: receipt.treatment.patient.lastName,
            email: receipt.treatment.patient.email,
            phone: receipt.treatment.patient.phone,
            dateOfBirth: receipt.treatment.patient.dateOfBirth,
            address: receipt.treatment.patient.address,
            city: receipt.treatment.patient.city,
            zipCode: receipt.treatment.patient.zipCode
          },
          // Dentist details
          dentist: {
            id: receipt.treatment.dentist.id,
            name: receipt.treatment.dentist.name,
            email: receipt.treatment.dentist.email,
            licenseNumber: receipt.treatment.dentist.licenseNumber,
            specialization: receipt.treatment.dentist.specialization
          },
          // Issued by details
          issuedBy: {
            id: receipt.issuedBy.id,
            name: receipt.issuedBy.name,
            email: receipt.issuedBy.email,
            role: receipt.issuedBy.role
          }
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Get receipt by ID error:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Receipt nu a fost găsit' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Eroare la încărcarea receipt-ului' },
      { status: 500 }
    );
  }
}

// DELETE /api/receipts/[id] - Delete receipt (optional, for admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== DELETE RECEIPT API CALLED ===');
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

    // Only admin can delete receipts
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nu ai permisiuni pentru această acțiune' },
        { status: 403 }
      );
    }

    // Validate receipt ID
    if (!params.id) {
      return NextResponse.json(
        { error: 'ID receipt invalid' },
        { status: 400 }
      );
    }

    // Check if receipt exists
    const existingReceipt = await receiptService.getReceiptById(params.id);

    // Delete receipt
    await prisma.receipt.delete({
      where: { id: params.id }
    });

    // Create audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          userEmail: session.user.email,
          userName: session.user.name || '',
          action: 'RECEIPT_DELETED',
          entityType: 'Receipt',
          entityId: params.id,
          oldData: {
            receiptNumber: existingReceipt.receiptNumber,
            totalAmount: existingReceipt.totalAmount
          } as any
        }
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Receipt șters cu succes!'
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Delete receipt error:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Receipt nu a fost găsit' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Eroare la ștergerea receipt-ului' },
      { status: 500 }
    );
  }
}