// app/api/bookings/sync/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// import { authOptions } from '@/lib/auth'; // Adjust path as needed

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Optional: Add authentication
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { bookings } = body;

    if (!bookings || !Array.isArray(bookings)) {
      return NextResponse.json(
        { error: 'Invalid bookings data' },
        { status: 400 }
      );
    }

    const syncResults = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process each Cal.com booking
    for (const booking of bookings) {
      try {
        // Check if patient exists by email
        let patient = await prisma.patient.findUnique({
          where: { email: booking.attendeeEmail }
        });

        // If patient doesn't exist, create a basic one
        if (!patient) {
          // Extract name parts
          const nameParts = (booking.attendeeName || 'Unknown').split(' ');
          const firstName = nameParts[0] || 'Unknown';
          const lastName = nameParts.slice(1).join(' ') || 'Patient';

          // Get the first available dentist as creator
          const defaultDentist = await prisma.user.findFirst({
            where: { role: 'DENTIST' }
          });

          if (!defaultDentist) {
            syncResults.failed++;
            syncResults.errors.push(`No dentist found for booking ${booking.id}`);
            continue;
          }

          patient = await prisma.patient.create({
            data: {
              firstName,
              lastName,
              email: booking.attendeeEmail || `temp_${booking.id}@calcom.sync`,
              phone: '0000000000', // Placeholder - should be updated later
              dateOfBirth: new Date('2000-01-01'), // Placeholder
              gender: 'OTHER',
              createdById: defaultDentist.id,
              notes: `Imported from Cal.com booking ${booking.uid}`
            }
          });
        }

        // Get the first available dentist for the appointment
        const dentist = await prisma.user.findFirst({
          where: { role: 'DENTIST' }
        });

        if (!dentist) {
          syncResults.failed++;
          syncResults.errors.push(`No dentist available for booking ${booking.id}`);
          continue;
        }

        // Check if appointment already exists (by checking notes for Cal.com UID)
        const existingAppointment = await prisma.appointment.findFirst({
          where: {
            notes: {
              contains: booking.uid
            }
          }
        });

        if (existingAppointment) {
          // Update existing appointment
          await prisma.appointment.update({
            where: { id: existingAppointment.id },
            data: {
              appointmentDate: new Date(booking.startTime),
              status: mapCalcomStatusToPrisma(booking.status),
              type: determineAppointmentType(booking.title, booking.description),
              reason: booking.description || booking.title || 'Cal.com Booking'
            }
          });
          syncResults.updated++;
        } else {
          // Calculate duration in minutes
          const startTime = new Date(booking.startTime);
          const endTime = new Date(booking.endTime);
          const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

          // Create new appointment
          await prisma.appointment.create({
            data: {
              patientId: patient.id,
              dentistId: dentist.id,
              appointmentDate: startTime,
              durationMinutes: durationMinutes || 30,
              type: determineAppointmentType(booking.title, booking.description),
              reason: booking.description || booking.title || 'Cal.com Booking',
              status: mapCalcomStatusToPrisma(booking.status),
              notes: `Cal.com UID: ${booking.uid}\nLocation: ${booking.location || 'N/A'}\nImported: ${new Date().toISOString()}`
            }
          });
          syncResults.created++;
        }

      } catch (error) {
        syncResults.failed++;
        syncResults.errors.push(
          `Failed to sync booking ${booking.id}: ${error instanceof Error ? error.message : String(error)}`
        );
        console.error(`Error syncing booking ${booking.id}:`, error);
      }
    }

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        action: 'SYNC_CALCOM_BOOKINGS',
        entityType: 'APPOINTMENT',
        newValue: JSON.stringify(syncResults),
        userEmail: 'system@calcom.sync', // Or get from session
        userName: 'Cal.com Sync Service'
      }
    });

    return NextResponse.json({
      success: true,
      results: syncResults,
      message: `Synchronized ${syncResults.created} new and ${syncResults.updated} existing bookings`
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to sync bookings', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to map Cal.com status to Prisma enum
function mapCalcomStatusToPrisma(calcomStatus: string) {
  const statusMap = {
    'accepted': 'CONFIRMED',
    'pending': 'SCHEDULED',
    'cancelled': 'CANCELLED',
    'rescheduled': 'RESCHEDULED',
    'confirmed': 'CONFIRMED'
  } as const;
  
  return (statusMap[calcomStatus.toLowerCase() as keyof typeof statusMap] || 'SCHEDULED') as any;
}

// Helper function to determine appointment type
function determineAppointmentType(title?: string, description?: string) {
  const text = `${title || ''} ${description || ''}`.toLowerCase();
  
  if (text.includes('consultation') || text.includes('consult')) {
    return 'CONSULTATION' as any;
  }
  if (text.includes('cleaning') || text.includes('hygiene')) {
    return 'CLEANING' as any;
  }
  if (text.includes('emergency') || text.includes('urgent')) {
    return 'EMERGENCY' as any;
  }
  if (text.includes('follow') || text.includes('check')) {
    return 'FOLLOW_UP' as any;
  }
  if (text.includes('treatment') || text.includes('procedure')) {
    return 'TREATMENT' as any;
  }
  
  return 'ROUTINE_CHECKUP' as any;
}