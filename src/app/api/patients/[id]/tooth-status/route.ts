// src/app/api/patients/[id]/tooth-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

// ✅ UPDATED FOR NEXT.JS 15: params is now a Promise
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ UPDATED: await params to get the actual values
    const { id } = await params;
    
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nu ești autentificat' },
        { status: 401 }
      );
    }

    const toothStatuses = await prisma.toothStatus.findMany({
      where: { patientId: id },
      orderBy: { toothNumber: 'asc' }
    });

    return NextResponse.json(toothStatuses);
  } catch (error) {
    console.error('Error fetching tooth statuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tooth statuses' },
      { status: 500 }
    );
  }
}

// POST - Salvează/actualizează starea unui dinte
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ UPDATED: await params to get the actual values
    const { id } = await params;
    
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nu ești autentificat' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { toothNumber, status, surfaces, notes } = body;

    const toothStatus = await prisma.toothStatus.upsert({
      where: {
        patientId_toothNumber: {
          patientId: id,
          toothNumber: toothNumber
        }
      },
      update: {
        status,
        surfaces: surfaces || [],
        notes
      },
      create: {
        patientId: id,
        toothNumber,
        status,
        surfaces: surfaces || [],
        notes
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'TOOTH_STATUS_UPDATED',
        entityType: 'ToothStatus',
        entityId: toothStatus.id,
        newData: toothStatus as any,
      }
    });

    return NextResponse.json(toothStatus);
  } catch (error) {
    console.error('Error saving tooth status:', error);
    return NextResponse.json(
      { error: 'Failed to save tooth status' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizează mai mulți dinți deodată
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ UPDATED: await params to get the actual values
    const { id } = await params;
    
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nu ești autentificat' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { teeth } = body; // Array of tooth updates

    if (!Array.isArray(teeth)) {
      return NextResponse.json(
        { error: 'Invalid data format - teeth must be an array' },
        { status: 400 }
      );
    }

    console.log(`Saving ${teeth.length} teeth for patient ${id}`);

    // Validate each tooth
    for (const tooth of teeth) {
      if (!tooth.toothNumber || !tooth.status) {
        return NextResponse.json(
          { error: 'Each tooth must have toothNumber and status' },
          { status: 400 }
        );
      }
    }

    const operations = teeth.map((tooth: any) =>
      prisma.toothStatus.upsert({
        where: {
          patientId_toothNumber: {
            patientId: id,
            toothNumber: parseInt(tooth.toothNumber)
          }
        },
        update: {
          status: tooth.status,
          surfaces: Array.isArray(tooth.surfaces) ? tooth.surfaces : [],
          notes: tooth.notes || null
        },
        create: {
          patientId: id,
          toothNumber: parseInt(tooth.toothNumber),
          status: tooth.status,
          surfaces: Array.isArray(tooth.surfaces) ? tooth.surfaces : [],
          notes: tooth.notes || null
        }
      })
    );

    const results = await Promise.all(operations);
    console.log(`Successfully saved ${results.length} teeth`);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'TOOTH_STATUS_BULK_UPDATE',
        entityType: 'ToothStatus',
        entityId: id,
        newData: { teethCount: teeth.length, teeth } as any,
      }
    });

    return NextResponse.json({ 
      success: true, 
      count: results.length,
      message: `Successfully saved ${results.length} teeth` 
    });
  } catch (error: any) {
    console.error('Error updating tooth statuses:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update tooth statuses' },
      { status: 500 }
    );
  }
}

// DELETE - Resetează starea unui dinte la HEALTHY
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ UPDATED: await params to get the actual values
    const { id } = await params;
    
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nu ești autentificat' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const toothNumber = searchParams.get('toothNumber');

    if (!toothNumber) {
      return NextResponse.json(
        { error: 'Tooth number required' },
        { status: 400 }
      );
    }

    const deletedTooth = await prisma.toothStatus.delete({
      where: {
        patientId_toothNumber: {
          patientId: id,
          toothNumber: parseInt(toothNumber)
        }
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'TOOTH_STATUS_DELETED',
        entityType: 'ToothStatus',
        entityId: deletedTooth.id,
        oldData: deletedTooth as any,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tooth status:', error);
    return NextResponse.json(
      { error: 'Failed to delete tooth status' },
      { status: 500 }
    );
  }
}