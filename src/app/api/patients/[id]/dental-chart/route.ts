import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';

// ✅ UPDATED FOR NEXT.JS 15: params is now a Promise
interface RouteParams {
  params: Promise<{
    id: string; // Patient ID
  }>;
}

// Tooth status types
export type ToothStatus = 'healthy' | 'cavity' | 'treated' | 'crown' | 'bridge' | 'implant' | 'missing' | 'extracted';
export type ToothSurface = 'mesial' | 'distal' | 'occlusal' | 'buccal' | 'lingual' | 'incisal';

interface ToothData {
  number: number;
  status: ToothStatus;
  surfaces?: ToothSurface[];
  notes?: string;
  lastUpdated?: Date;
}

interface DentalChartData {
  teeth: ToothData[];
  generalNotes?: string;
  lastExamDate?: Date;
}

/**
 * GET /api/patients/[id]/dental-chart - Get patient's dental chart
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    // ✅ UPDATED: await params to get the actual values
    const { id } = await params;
    
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id }, // ✅ Use destructured id
      select: { 
        id: true,
        firstName: true,
        lastName: true,
        // Store dental chart as JSON in medicalHistory or create new field
        medicalHistory: true
      }
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Parse dental chart from medicalHistory or return default
    let dentalChart: DentalChartData = {
      teeth: [],
      generalNotes: '',
      lastExamDate: new Date()
    };

    if (patient.medicalHistory) {
      try {
        const parsed = JSON.parse(patient.medicalHistory);
        if (parsed.dentalChart) {
          dentalChart = parsed.dentalChart;
        }
      } catch {
        // If not JSON or no dentalChart, use default
      }
    }

    // If no dental chart exists, create default with all teeth healthy
    if (dentalChart.teeth.length === 0) {
      for (let i = 1; i <= 32; i++) {
        dentalChart.teeth.push({
          number: i,
          status: 'healthy',
          surfaces: [],
          notes: ''
        });
      }
    }

    return NextResponse.json({
      patientId: id, // ✅ Use destructured id
      patientName: `${patient.firstName} ${patient.lastName}`,
      dentalChart
    });

  } catch (error) {
    console.error('Error fetching dental chart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dental chart' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/patients/[id]/dental-chart - Update patient's dental chart
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    // ✅ UPDATED: await params to get the actual values
    const { id } = await params;
    
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { teeth, generalNotes, lastExamDate } = body;

    // Validate teeth data
    if (!Array.isArray(teeth) || teeth.length === 0) {
      return NextResponse.json(
        { error: 'Invalid teeth data' },
        { status: 400 }
      );
    }

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id }, // ✅ Use destructured id
      select: { 
        id: true,
        medicalHistory: true
      }
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Parse existing medical history
    let medicalHistory: any = {};
    if (patient.medicalHistory) {
      try {
        medicalHistory = JSON.parse(patient.medicalHistory);
      } catch {
        medicalHistory = { text: patient.medicalHistory };
      }
    }

    // Update dental chart
    medicalHistory.dentalChart = {
      teeth,
      generalNotes,
      lastExamDate: lastExamDate || new Date(),
      updatedBy: session.user.id,
      updatedAt: new Date()
    };

    // Save updated medical history
    await prisma.patient.update({
      where: { id }, // ✅ Use destructured id
      data: {
        medicalHistory: JSON.stringify(medicalHistory)
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        userEmail: session.user.email!,
        userName: session.user.name!,
        action: 'UPDATE_DENTAL_CHART',
        entityType: 'Patient',
        entityId: id, // ✅ Use destructured id
        newData: {
          teeth: teeth.filter((t: ToothData) => t.status !== 'healthy'),
          generalNotes
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Dental chart updated successfully',
      dentalChart: medicalHistory.dentalChart
    });

  } catch (error) {
    console.error('Error updating dental chart:', error);
    return NextResponse.json(
      { error: 'Failed to update dental chart' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/patients/[id]/dental-chart/tooth - Update single tooth
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    // ✅ UPDATED: await params to get the actual values
    const { id } = await params;
    
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { toothNumber, status, surfaces, notes } = body;

    // Validate tooth number
    if (!toothNumber || toothNumber < 1 || toothNumber > 32) {
      return NextResponse.json(
        { error: 'Invalid tooth number' },
        { status: 400 }
      );
    }

    // Get patient's current dental chart
    const patient = await prisma.patient.findUnique({
      where: { id }, // ✅ Use destructured id
      select: { 
        id: true,
        medicalHistory: true
      }
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Parse existing medical history
    let medicalHistory: any = {};
    if (patient.medicalHistory) {
      try {
        medicalHistory = JSON.parse(patient.medicalHistory);
      } catch {
        medicalHistory = { text: patient.medicalHistory };
      }
    }

    // Initialize dental chart if not exists
    if (!medicalHistory.dentalChart) {
      medicalHistory.dentalChart = {
        teeth: [],
        generalNotes: '',
        lastExamDate: new Date()
      };
      
      // Create default teeth
      for (let i = 1; i <= 32; i++) {
        medicalHistory.dentalChart.teeth.push({
          number: i,
          status: 'healthy',
          surfaces: [],
          notes: ''
        });
      }
    }

    // Update specific tooth
    const toothIndex = medicalHistory.dentalChart.teeth.findIndex(
      (t: ToothData) => t.number === toothNumber
    );

    if (toothIndex === -1) {
      medicalHistory.dentalChart.teeth.push({
        number: toothNumber,
        status,
        surfaces: surfaces || [],
        notes: notes || '',
        lastUpdated: new Date()
      });
    } else {
      medicalHistory.dentalChart.teeth[toothIndex] = {
        number: toothNumber,
        status,
        surfaces: surfaces || [],
        notes: notes || '',
        lastUpdated: new Date()
      };
    }

    // Save updated medical history
    await prisma.patient.update({
      where: { id }, // ✅ Use destructured id
      data: {
        medicalHistory: JSON.stringify(medicalHistory)
      }
    });

    // Create audit log for tooth update
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        userEmail: session.user.email!,
        userName: session.user.name!,
        action: 'UPDATE_TOOTH_STATUS',
        entityType: 'Patient',
        entityId: id, // ✅ Use destructured id
        newData: {
          toothNumber,
          status,
          surfaces,
          notes
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Tooth #${toothNumber} updated successfully`,
      tooth: medicalHistory.dentalChart.teeth[toothIndex] || 
             medicalHistory.dentalChart.teeth[medicalHistory.dentalChart.teeth.length - 1]
    });

  } catch (error) {
    console.error('Error updating tooth:', error);
    return NextResponse.json(
      { error: 'Failed to update tooth' },
      { status: 500 }
    );
  }
}