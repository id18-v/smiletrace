
// src/app/api/treatments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { treatmentService } from '@/services/treatment.service';
import { auth } from '@/lib/auth';

/**
 * POST /api/treatments - Create new treatment
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is dentist or admin
    if (session.user.role !== 'DENTIST' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only dentists can create treatments.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    
    // Add dentistId from session if not provided
    const data = {
      ...body,
      dentistId: body.dentistId || session.user.id,
      treatmentDate: body.treatmentDate ? new Date(body.treatmentDate) : new Date()
    };

    const treatment = await treatmentService.createTreatment(data);

    return NextResponse.json(treatment, { status: 201 });
  } catch (error: any) {
    console.error('API Error - Create treatment:', error);
    
    if (error.message?.includes('not found') || error.message?.includes('inactive')) {
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
      { error: error.message || 'Failed to create treatment' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/treatments - Get treatments with filters
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    
    // Build filters
    const filters: any = {
      patientId: searchParams.get('patientId') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    // If not admin, filter by dentist
    if (session.user.role === 'DENTIST') {
      filters.dentistId = session.user.id;
    } else if (searchParams.get('dentistId')) {
      filters.dentistId = searchParams.get('dentistId');
    }

    // Add date filters
    if (searchParams.get('startDate')) {
      filters.startDate = new Date(searchParams.get('startDate')!);
    }
    if (searchParams.get('endDate')) {
      filters.endDate = new Date(searchParams.get('endDate')!);
    }
    if (searchParams.get('paymentStatus')) {
      filters.paymentStatus = searchParams.get('paymentStatus');
    }

    const result = await treatmentService.getTreatmentHistory(filters);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error - Get treatments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch treatments' },
      { status: 500 }
    );
  }
}
