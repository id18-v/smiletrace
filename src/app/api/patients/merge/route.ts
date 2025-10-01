// src/app/api/patients/merge/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth} from '@/lib/auth';
import { PatientService, mergePatientSchema } from '@/services/patient.service';
import { z } from 'zod';

// POST /api/patients/merge - Merge duplicate patient records
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Check for admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can merge patient records' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    
    // Validate input
    const { primaryPatientId, duplicatePatientId } = mergePatientSchema.parse(body);

    // Perform merge
    const mergedPatient = await PatientService.mergePatientRecords(
      primaryPatientId,
      duplicatePatientId,
      session.user.id
    );

    return NextResponse.json({
      message: 'Patients merged successfully',
      patient: mergedPatient
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    
    if (error.message === 'Cannot merge a patient with itself') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    console.error('Error merging patients:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to merge patients' },
      { status: 500 }
    );
  }
}