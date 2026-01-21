// src/app/api/patients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nu ești autentificat' },
        { status: 401 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Pacient negăsit' },
        { status: 404 }
      );
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

// PUT - Actualizează DOAR câmpurile trimise (cu curățare stringuri goale)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nu ești autentificat' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Construiește obiectul de update curățând valorile
    const updateData: any = {};
    
    Object.keys(body).forEach(key => {
      const value = body[key];
      
      // Ignoră undefined
      if (value === undefined) return;
      
      // Pentru stringuri: tratează stringurile goale ca null
      if (typeof value === 'string' && value.trim() === '') {
        updateData[key] = null;
        return;
      }
      
      // Pentru arrays goale: păstrează-le (e.g., allergies: [])
      // Pentru booleans: păstrează-le
      // Pentru restul: adaugă valoarea
      updateData[key] = value;
    });

    // Convertește data la format Date dacă există și e validă
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }

    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: updateData,
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PATIENT_UPDATED',
        entityType: 'Patient',
        entityId: updatedPatient.id,
        newData: updateData as any,
      }
    });

    return NextResponse.json(updatedPatient);
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nu ești autentificat' },
        { status: 401 }
      );
    }

    const deletedPatient = await prisma.patient.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PATIENT_DELETED',
        entityType: 'Patient',
        entityId: deletedPatient.id,
        oldData: deletedPatient as any,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    );
  }
}