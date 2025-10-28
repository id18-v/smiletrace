
import { NextRequest, NextResponse } from 'next/server';
import { treatmentService } from '@/services/treatment.service';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/treatments/[id] - Get single treatment details
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const treatment = await prisma.treatment.findUnique({
      where: { id: params.id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            insuranceProvider: true,
            insurancePolicyNumber: true,
          }
        },
        dentist: {
          select: {
            id: true,
            name: true,
            email: true,
            specialization: true,
          }
        },
        items: {
          include: {
            procedure: true,
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        receipt: true,
      }
    });

    if (!treatment) {
      return NextResponse.json(
        { error: 'Treatment not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    if (session.user.role === 'DENTIST' && treatment.dentistId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied. You can only view your own treatments.' },
        { status: 403 }
      );
    }

    return NextResponse.json(treatment);
  } catch (error: any) {
    console.error('API Error - Get treatment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch treatment' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/treatments/[id] - Update treatment
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

    // Check if treatment exists and user has access
    const existingTreatment = await prisma.treatment.findUnique({
      where: { id: params.id },
      select: { dentistId: true }
    });

    if (!existingTreatment) {
      return NextResponse.json(
        { error: 'Treatment not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (session.user.role === 'DENTIST' && existingTreatment.dentistId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied. You can only edit your own treatments.' },
        { status: 403 }
      );
    }

    const body = await req.json();

    const treatment = await prisma.treatment.update({
      where: { id: params.id },
      data: {
        chiefComplaint: body.chiefComplaint,
        diagnosis: body.diagnosis,
        treatmentPlan: body.treatmentPlan,
        notes: body.notes,
        discount: body.discount,
      },
      include: {
        patient: true,
        dentist: true,
        items: {
          include: { procedure: true }
        }
      }
    });

    // Recalculate cost if discount changed
    if (body.discount !== undefined) {
      await treatmentService.calculateTreatmentCost(params.id);
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        userEmail: session.user.email!,
        userName: session.user.name!,
        action: 'UPDATE_TREATMENT',
        entityType: 'Treatment',
        entityId: params.id,
        newData: body,
      }
    });

    return NextResponse.json(treatment);
  } catch (error: any) {
    console.error('API Error - Update treatment:', error);
    return NextResponse.json(
      { error: 'Failed to update treatment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/treatments/[id] - Delete treatment
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Check if treatment has a receipt
    const treatment = await prisma.treatment.findUnique({
      where: { id: params.id },
      include: { receipt: true }
    });

    if (treatment?.receipt) {
      return NextResponse.json(
        { error: 'Cannot delete treatment with issued receipt' },
        { status: 400 }
      );
    }

    await prisma.treatment.delete({
      where: { id: params.id }
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        userEmail: session.user.email!,
        userName: session.user.name!,
        action: 'DELETE_TREATMENT',
        entityType: 'Treatment',
        entityId: params.id,
        oldData: treatment ? JSON.parse(JSON.stringify(treatment)) : undefined,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error - Delete treatment:', error);
    return NextResponse.json(
      { error: 'Failed to delete treatment' },
      { status: 500 }
    );
  }
}