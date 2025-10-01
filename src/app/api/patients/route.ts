import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth'; // Import direct auth function
import { PatientService, createPatientSchema } from '@/services/patient.service';
import { z } from 'zod';

// GET /api/patients - Get all patients with optional simple filters
export async function GET(req: NextRequest) {
  try {
    // Check authentication using auth() instead of getServerSession
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Use search functionality with basic parameters
    const searchParams = req.nextUrl.searchParams;
    const filters = {
      query: searchParams.get('q') || searchParams.get('query') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      isActive: searchParams.get('active') === 'false' ? false : true,
      sortBy: (searchParams.get('sortBy') || 'lastName') as any,
      sortOrder: (searchParams.get('sortOrder') || 'asc') as any,
    };

    const result = await PatientService.searchPatients(filters);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

// POST /api/patients - Create new patient
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    
    // Create patient
    const patient = await PatientService.createPatient(
      body,
      session.user.id
    );

    return NextResponse.json({
      message: 'Patient created successfully',
      patient
    }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }
    
    if (error.message?.includes('already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }
    
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create patient' },
      { status: 500 }
    );
  }
}