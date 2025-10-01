// src/app/api/patients/[id]/medical/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PatientService, updateMedicalHistorySchema } from '@/services/patient.service';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT /api/patients/[id]/medical - Update medical history
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Validate input
    const validatedData = updateMedicalHistorySchema.parse(body);

    // Update medical history
    const updatedPatient = await PatientService.updateMedicalHistory(
      params.id,
      validatedData,
      session.user.id
    );

    return NextResponse.json({
      message: 'Medical history updated successfully',
      patient: updatedPatient
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    
    if (error.message === 'Patient not found') {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    console.error('Error updating medical history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update medical history' },
      { status: 500 }
    );
  }
}

// GET /api/patients/[id]/medical - Get medical history
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    // Prisma client initialized at module scope
    
    // Get patient medical info
    
    // Get patient medical info
    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        bloodType: true,
        allergies: true,
        medications: true,
        medicalHistory: true,
        notes: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        emergencyContactRelation: true,
        lastVisitAt: true,
        // Include recent treatments with procedures
        treatments: {
          orderBy: { treatmentDate: 'desc' },
          take: 10,
          select: {
            id: true,
            treatmentDate: true,
            diagnosis: true,
            treatmentPlan: true,
            notes: true,
            totalCost: true,
            paymentStatus: true,
            dentist: {
              select: {
                id: true,
                name: true,
                specialization: true,
              }
            },
            items: {
              select: {
                id: true,
                quantity: true,
                totalCost: true,
                toothNumbers: true,
                toothSurfaces: true,
                status: true,
                procedure: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                    code: true,
                  }
                }
              }
            }
          }
        },
        // Include completed appointments
        appointments: {
          where: {
            status: 'COMPLETED'
          },
          orderBy: { appointmentDate: 'desc' },
          take: 10,
          select: {
            id: true,
            appointmentDate: true,
            type: true,
            reason: true,
            notes: true,
            dentist: {
              select: {
                id: true,
                name: true,
                specialization: true,
              }
            }
          }
        }
      }
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Calculate age
    const today = new Date();
    const birthDate = new Date(patient.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return NextResponse.json({
      ...patient,
      age,
      fullName: `${patient.firstName} ${patient.lastName}`,
    });
  } catch (error: any) {
    console.error('Error fetching medical history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch medical history' },
      { status: 500 }
    );
  }
}