// src/app/api/patients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nu ești autentificat' },
        { status: 401 }
      );
    }

    // Get query parameters for filtering/pagination
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {
      isActive: true
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const patients = await prisma.patient.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        allergies: true,
        dateOfBirth: true,
        gender: true,
        lastVisitAt: true,
        createdAt: true,
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ],
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const total = await prisma.patient.count({ where });

    return NextResponse.json({
      patients,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nu ești autentificat' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'gender'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Câmpul ${field} este obligatoriu` },
          { status: 400 }
        );
      }
    }

    const patient = await prisma.patient.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        dateOfBirth: new Date(body.dateOfBirth),
        gender: body.gender,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        country: body.country || 'Romania',
        bloodType: body.bloodType,
        allergies: body.allergies || [],
        medications: body.medications || [],
        medicalHistory: body.medicalHistory,
        insuranceProvider: body.insuranceProvider,
        insurancePolicyNumber: body.insurancePolicyNumber,
        insuranceGroupNumber: body.insuranceGroupNumber,
        emergencyContactName: body.emergencyContactName,
        emergencyContactPhone: body.emergencyContactPhone,
        emergencyContactRelation: body.emergencyContactRelation,
        notes: body.notes,
        createdById: session.user.id
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PATIENT_CREATED',
        entityType: 'Patient',
        entityId: patient.id,
        newData: patient as any
      }
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error: any) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create patient' },
      { status: 500 }
    );
  }
}