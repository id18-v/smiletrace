import { NextRequest, NextResponse } from 'next/server';
import { treatmentService } from '@/services/treatment.service';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { PaymentMethod } from '@prisma/client';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * PUT /api/treatments/[id]/complete - Finalize treatment
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check treatment ownership
    const treatment = await prisma.treatment.findUnique({
      where: { id: params.id },
      select: { 
        dentistId: true,
        totalCost: true,
        paidAmount: true,
        patient: {
          select: {
            email: true
          }
        }
      }
    });

    if (!treatment) {
      return NextResponse.json(
        { error: 'Treatment not found' },
        { status: 404 }
      );
    }

    if (session.user.role === 'DENTIST' && treatment.dentistId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate required fields
    if (!body.paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method is required' },
        { status: 400 }
      );
    }

    // Update payment
    const updatedTreatment = await treatmentService.updateTreatmentPayment({
      treatmentId: params.id,
      paidAmount: body.paidAmount || 0,
      paymentMethod: body.paymentMethod as PaymentMethod,
      transactionId: body.transactionId,
    });

    // Mark all items as completed if fully paid
    if (updatedTreatment.paymentStatus === 'PAID') {
      await prisma.treatmentItem.updateMany({
        where: { treatmentId: params.id },
        data: { status: 'COMPLETED' }
      });

      // Check if receipt already exists
      const existingReceipt = await prisma.receipt.findUnique({
        where: { treatmentId: params.id }
      });

      if (!existingReceipt) {
        // Generate receipt number
        const receiptCount = await prisma.receipt.count();
        const receiptNumber = `RCP${String(receiptCount + 1).padStart(6, '0')}`;

        // Create receipt
        await prisma.receipt.create({
          data: {
            treatmentId: params.id,
            issuedById: session.user.id,
            receiptNumber,
            subtotal: updatedTreatment.totalCost + updatedTreatment.discount,
            discount: updatedTreatment.discount,
            tax: 0,
            totalAmount: updatedTreatment.totalCost,
            paidAmount: updatedTreatment.paidAmount,
            balanceDue: Math.max(0, updatedTreatment.totalCost - updatedTreatment.paidAmount),
            paymentMethod: body.paymentMethod,
            paymentDate: new Date(),
            transactionId: body.transactionId,
            emailAddress: treatment.patient.email,
            status: 'ISSUED',
          }
        });
      }
    }

    // Return treatment with all details
    const completedTreatment = await prisma.treatment.findUnique({
      where: { id: params.id },
      include: {
        patient: true,
        dentist: true,
        items: {
          include: { procedure: true }
        },
        receipt: true,
      }
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        userEmail: session.user.email!,
        userName: session.user.name!,
        action: 'COMPLETE_TREATMENT',
        entityType: 'Treatment',
        entityId: params.id,
        newData: {
          paymentStatus: updatedTreatment.paymentStatus,
          paidAmount: updatedTreatment.paidAmount,
        },
      }
    });

    return NextResponse.json(completedTreatment);
  } catch (error: any) {
    console.error('API Error - Complete treatment:', error);
    
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    if (error.message?.includes('Validation error')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to complete treatment' },
      { status: 500 }
    );
  }
}