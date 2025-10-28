// app/api/appointments/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth'; // Adjust path as needed

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Optional: Add authentication check
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Fetch appointments with related data
    const appointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: new Date() // Only future appointments
        }
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        dentist: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        appointmentDate: 'asc'
      }
    });

    return NextResponse.json({
      appointments,
      total: appointments.length
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    // Optional: Add authentication
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    
    const appointment = await prisma.appointment.create({
      data: {
        patientId: body.patientId,
        dentistId: body.dentistId,
        appointmentDate: new Date(body.appointmentDate),
        durationMinutes: body.durationMinutes || 30,
        type: body.type,
        reason: body.reason,
        status: body.status || 'SCHEDULED',
        notes: body.notes
      },
      include: {
        patient: true,
        dentist: true
      }
    });

    return NextResponse.json({ appointment }, { status: 201 });

  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}