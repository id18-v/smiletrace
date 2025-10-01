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
 * POST /api/treatments/[id]/items - Add procedure to treatment
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
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
      select: { dentistId: true }
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
    
    const data = {
      ...body,
      treatmentId: params.id,
    };

    const item = await treatmentService.addProcedureToTooth(data);

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error('API Error - Add procedure:', error);
    
    if (error.message?.includes('not found') || error.message?.includes('not active')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    if (error.message?.includes('Validation error') || error.message?.includes('Invalid tooth')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to add procedure' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/treatments/[id]/items - Get treatment items
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

    const items = await prisma.treatmentItem.findMany({
      where: { treatmentId: params.id },
      include: {
        procedure: true,
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(items);
  } catch (error: any) {
    console.error('API Error - Get treatment items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch treatment items' },
      { status: 500 }
    );
  }
}
