// src/services/appointment.service.ts
import { 
  PrismaClient, 
  Appointment, 
  AppointmentStatus, 
  AppointmentType,
  Prisma 
} from '@prisma/client';
import { z } from 'zod';
import { addDays, addHours, startOfDay, endOfDay, isWithinInterval, addMinutes, isBefore, isAfter, differenceInMinutes } from 'date-fns';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Validation schemas
const CreateAppointmentSchema = z.object({
  patientId: z.string(),
  dentistId: z.string(),
  appointmentDate: z.date().or(z.string().transform(str => new Date(str))),
  durationMinutes: z.number().min(15).max(240).default(30),
  type: z.nativeEnum(AppointmentType),
  reason: z.string().min(1).max(500),
  notes: z.string().optional().nullable(),
  status: z.nativeEnum(AppointmentStatus).default('SCHEDULED')
});

const UpdateAppointmentSchema = z.object({
  appointmentDate: z.date().or(z.string().transform(str => new Date(str))).optional(),
  durationMinutes: z.number().min(15).max(240).optional(),
  type: z.nativeEnum(AppointmentType).optional(),
  reason: z.string().min(1).max(500).optional(),
  notes: z.string().optional().nullable(),
  status: z.nativeEnum(AppointmentStatus).optional()
});

const RescheduleAppointmentSchema = z.object({
  newDate: z.date().or(z.string().transform(str => new Date(str))),
  newDurationMinutes: z.number().min(15).max(240).optional(),
  reason: z.string().optional()
});

const SearchAppointmentsSchema = z.object({
  dentistId: z.string().optional(),
  patientId: z.string().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
  type: z.nativeEnum(AppointmentType).optional(),
  dateFrom: z.date().or(z.string().transform(str => new Date(str))).optional(),
  dateTo: z.date().or(z.string().transform(str => new Date(str))).optional(),
  includePatient: z.boolean().default(true),
  includeDentist: z.boolean().default(true),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['appointmentDate', 'createdAt', 'status']).default('appointmentDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

// Types
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentSchema>;
export type RescheduleAppointmentInput = z.infer<typeof RescheduleAppointmentSchema>;
export type SearchAppointmentsInput = z.infer<typeof SearchAppointmentsSchema>;

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  reason?: string;
}

export interface DentistAvailability {
  date: Date;
  slots: TimeSlot[];
  totalAvailable: number;
  totalBooked: number;
}

export interface AppointmentConflict {
  appointment: Appointment;
  conflictType: 'overlap' | 'buffer' | 'break';
  message: string;
}

export interface AppointmentSearchResult {
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReminderResult {
  appointmentId: string;
  success: boolean;
  error?: string;
  sentAt?: Date;
}

export interface BatchReminderResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  results: ReminderResult[];
  batchLogId: string;
}

class AppointmentService {
  /**
   * Create a new appointment with conflict checking
   */
  async createAppointment(data: CreateAppointmentInput, userId: string): Promise<Appointment> {
    try {
      const validatedData = CreateAppointmentSchema.parse(data);

      // Check for conflicts before creating
      const conflicts = await this.checkConflicts(
        validatedData.dentistId,
        validatedData.appointmentDate as Date,
        validatedData.durationMinutes
      );

      if (conflicts.length > 0) {
        const conflictMessages = conflicts.map(c => c.message).join(', ');
        throw new Error(`Appointment conflicts detected: ${conflictMessages}`);
      }

      // Verify patient exists
      const patient = await prisma.patient.findUnique({
        where: { id: validatedData.patientId }
      });

      if (!patient) {
        throw new Error('Patient not found');
      }

      // Verify dentist exists and is active
      const dentist = await prisma.user.findUnique({
        where: { 
          id: validatedData.dentistId,
          isActive: true
        }
      });

      if (!dentist) {
        throw new Error('Dentist not found or inactive');
      }

      // Create appointment with transaction
      const appointment = await prisma.$transaction(async (tx) => {
        const newAppointment = await tx.appointment.create({
          data: {
            ...validatedData,
            appointmentDate: validatedData.appointmentDate as Date,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          include: {
            patient: true,
            dentist: {
              select: {
                id: true,
                name: true,
                email: true,
                specialization: true
              }
            }
          }
        });

        // Update patient's last visit if this is a future appointment
        if (validatedData.status === 'COMPLETED') {
          await tx.patient.update({
            where: { id: validatedData.patientId },
            data: { lastVisitAt: validatedData.appointmentDate as Date }
          });
        }

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId,
            action: 'CREATE_APPOINTMENT',
            entityType: 'Appointment',
            entityId: newAppointment.id,
            newData: newAppointment as any,
            createdAt: new Date()
          }
        });

        return newAppointment;
      });

      return appointment;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${JSON.stringify(error.issues)}`);
      }
      throw error;
    }
  }

  /**
   * Check for appointment conflicts
   */
  async checkConflicts(
    dentistId: string,
    appointmentDate: Date,
    durationMinutes: number,
    excludeAppointmentId?: string
  ): Promise<AppointmentConflict[]> {
    const conflicts: AppointmentConflict[] = [];
    
    // Get clinic settings for buffer time
    const clinicSettings = await prisma.clinicSettings.findFirst();
    const bufferMinutes = clinicSettings?.appointmentBuffer || 5;

    // Calculate appointment time range with buffer
    const appointmentStart = appointmentDate;
    const appointmentEnd = addMinutes(appointmentDate, durationMinutes);
    const bufferStart = addMinutes(appointmentStart, -bufferMinutes);
    const bufferEnd = addMinutes(appointmentEnd, bufferMinutes);

    // Find overlapping appointments for the same dentist
    const overlappingAppointments = await prisma.appointment.findMany({
      where: {
        dentistId,
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        status: {
          notIn: ['CANCELLED', 'NO_SHOW']
        },
        AND: [
          {
            appointmentDate: {
              lt: bufferEnd
            }
          },
          {
            appointmentDate: {
              gte: startOfDay(appointmentDate)
            }
          }
        ]
      },
      include: {
        patient: true
      }
    });

    for (const existing of overlappingAppointments) {
      const existingEnd = addMinutes(existing.appointmentDate, existing.durationMinutes);
      
      // Check direct overlap
      if (
        (appointmentStart >= existing.appointmentDate && appointmentStart < existingEnd) ||
        (appointmentEnd > existing.appointmentDate && appointmentEnd <= existingEnd) ||
        (appointmentStart <= existing.appointmentDate && appointmentEnd >= existingEnd)
      ) {
        conflicts.push({
          appointment: existing,
          conflictType: 'overlap',
          message: `Overlaps with appointment for ${existing.patient.firstName} ${existing.patient.lastName} at ${existing.appointmentDate.toLocaleTimeString()}`
        });
      }
      // Check buffer conflict
      else if (
        (bufferStart < existingEnd && bufferEnd > existing.appointmentDate)
      ) {
        conflicts.push({
          appointment: existing,
          conflictType: 'buffer',
          message: `Too close to appointment for ${existing.patient.firstName} ${existing.patient.lastName} (buffer time needed)`
        });
      }
    }

    // Check working hours if clinic settings exist
    if (clinicSettings?.workingHours) {
      const workingHours = clinicSettings.workingHours as any;
      const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const dayHours = workingHours[dayOfWeek];

      if (dayHours && !dayHours.closed) {
        const appointmentTime = appointmentDate.toTimeString().slice(0, 5);
        const appointmentEndTime = appointmentEnd.toTimeString().slice(0, 5);

        if (appointmentTime < dayHours.start || appointmentEndTime > dayHours.end) {
          conflicts.push({
            appointment: {} as Appointment,
            conflictType: 'break',
            message: `Outside working hours (${dayHours.start} - ${dayHours.end})`
          });
        }

        // Check lunch break if defined
        if (dayHours.lunchBreak) {
          const lunchStart = dayHours.lunchBreak.start;
          const lunchEnd = dayHours.lunchBreak.end;

          if (
            (appointmentTime >= lunchStart && appointmentTime < lunchEnd) ||
            (appointmentEndTime > lunchStart && appointmentEndTime <= lunchEnd)
          ) {
            conflicts.push({
              appointment: {} as Appointment,
              conflictType: 'break',
              message: `Conflicts with lunch break (${lunchStart} - ${lunchEnd})`
            });
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Get available time slots for a dentist on a specific date
   */
  async getAvailableSlots(
    dentistId: string,
    date: Date,
    slotDuration: number = 30
  ): Promise<DentistAvailability> {
    const clinicSettings = await prisma.clinicSettings.findFirst();
    const bufferMinutes = clinicSettings?.appointmentBuffer || 5;

    // Get working hours for the day
    let workStart = new Date(date);
    workStart.setHours(9, 0, 0, 0);
    let workEnd = new Date(date);
    workEnd.setHours(18, 0, 0, 0);
    let lunchStart: Date | null = null;
    let lunchEnd: Date | null = null;

    if (clinicSettings?.workingHours) {
      const workingHours = clinicSettings.workingHours as any;
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const dayHours = workingHours[dayOfWeek];

      if (dayHours && !dayHours.closed) {
        const [startHour, startMin] = dayHours.start.split(':').map(Number);
        const [endHour, endMin] = dayHours.end.split(':').map(Number);
        workStart.setHours(startHour, startMin, 0, 0);
        workEnd.setHours(endHour, endMin, 0, 0);

        if (dayHours.lunchBreak) {
          const [lunchStartHour, lunchStartMin] = dayHours.lunchBreak.start.split(':').map(Number);
          const [lunchEndHour, lunchEndMin] = dayHours.lunchBreak.end.split(':').map(Number);
          lunchStart = new Date(date);
          lunchStart.setHours(lunchStartHour, lunchStartMin, 0, 0);
          lunchEnd = new Date(date);
          lunchEnd.setHours(lunchEndHour, lunchEndMin, 0, 0);
        }
      }
    }

    // Get existing appointments for the day
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        dentistId,
        appointmentDate: {
          gte: startOfDay(date),
          lt: endOfDay(date)
        },
        status: {
          notIn: ['CANCELLED', 'NO_SHOW']
        }
      },
      orderBy: {
        appointmentDate: 'asc'
      }
    });

    // Generate time slots
    const slots: TimeSlot[] = [];
    let currentSlot = new Date(workStart);

    while (currentSlot < workEnd) {
      const slotEnd = addMinutes(currentSlot, slotDuration);

      // Skip if slot extends beyond work hours
      if (slotEnd > workEnd) {
        break;
      }

      let available = true;
      let reason = '';

      // Check if slot is in lunch break
      if (lunchStart && lunchEnd) {
        if (
          (currentSlot >= lunchStart && currentSlot < lunchEnd) ||
          (slotEnd > lunchStart && slotEnd <= lunchEnd)
        ) {
          available = false;
          reason = 'Lunch break';
        }
      }

      // Check if slot conflicts with existing appointments
      if (available) {
        for (const appointment of existingAppointments) {
          const appointmentEnd = addMinutes(appointment.appointmentDate, appointment.durationMinutes + bufferMinutes);
          const appointmentStart = addMinutes(appointment.appointmentDate, -bufferMinutes);

          if (
            (currentSlot >= appointmentStart && currentSlot < appointmentEnd) ||
            (slotEnd > appointmentStart && slotEnd <= appointmentEnd)
          ) {
            available = false;
            reason = 'Booked';
            break;
          }
        }
      }

      // Check if slot is in the past
      if (available && currentSlot < new Date()) {
        available = false;
        reason = 'Past time';
      }

      slots.push({
        start: new Date(currentSlot),
        end: new Date(slotEnd),
        available,
        reason
      });

      currentSlot = addMinutes(currentSlot, slotDuration);
    }

    const availableSlots = slots.filter(s => s.available);
    const bookedSlots = slots.filter(s => !s.available && s.reason === 'Booked');

    return {
      date,
      slots,
      totalAvailable: availableSlots.length,
      totalBooked: bookedSlots.length
    };
  }

  /**
   * Reschedule an appointment
   */
  async rescheduleAppointment(
    appointmentId: string,
    data: RescheduleAppointmentInput,
    userId: string
  ): Promise<Appointment> {
    try {
      const validatedData = RescheduleAppointmentSchema.parse(data);

      const existingAppointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { patient: true, dentist: true }
      });

      if (!existingAppointment) {
        throw new Error('Appointment not found');
      }

      if (existingAppointment.status === 'COMPLETED') {
        throw new Error('Cannot reschedule completed appointments');
      }

      const newDuration = validatedData.newDurationMinutes || existingAppointment.durationMinutes;

      // Check conflicts for new time
      const conflicts = await this.checkConflicts(
        existingAppointment.dentistId,
        validatedData.newDate as Date,
        newDuration,
        appointmentId
      );

      if (conflicts.length > 0) {
        const conflictMessages = conflicts.map(c => c.message).join(', ');
        throw new Error(`Cannot reschedule: ${conflictMessages}`);
      }

      // Reschedule with transaction
      const rescheduledAppointment = await prisma.$transaction(async (tx) => {
        // Update appointment
        const updated = await tx.appointment.update({
          where: { id: appointmentId },
          data: {
            appointmentDate: validatedData.newDate as Date,
            durationMinutes: newDuration,
            status: 'RESCHEDULED',
            notes: validatedData.reason 
              ? `${existingAppointment.notes || ''}\n[Rescheduled]: ${validatedData.reason}`.trim()
              : existingAppointment.notes,
            updatedAt: new Date()
          },
          include: {
            patient: true,
            dentist: {
              select: {
                id: true,
                name: true,
                email: true,
                specialization: true
              }
            }
          }
        });

        // Create new appointment for the new time
        const newAppointment = await tx.appointment.create({
          data: {
            patientId: existingAppointment.patientId,
            dentistId: existingAppointment.dentistId,
            appointmentDate: validatedData.newDate as Date,
            durationMinutes: newDuration,
            type: existingAppointment.type,
            reason: existingAppointment.reason,
            notes: `Rescheduled from ${existingAppointment.appointmentDate.toISOString()}`,
            status: 'SCHEDULED'
          }
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId,
            action: 'RESCHEDULE_APPOINTMENT',
            entityType: 'Appointment',
            entityId: appointmentId,
            oldData: existingAppointment as any,
            newData: newAppointment as any,
            newValue: `Rescheduled to ${validatedData.newDate}`,
            createdAt: new Date()
          }
        });

        return newAppointment;
      });

      return rescheduledAppointment;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${JSON.stringify(error.issues)}`);
      }
      throw error;
    }
  }

  /**
   * Cancel an appointment
   */
  async cancelAppointment(
    appointmentId: string,
    reason: string,
    userId: string
  ): Promise<Appointment> {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.status === 'COMPLETED') {
      throw new Error('Cannot cancel completed appointments');
    }

    if (appointment.status === 'CANCELLED') {
      throw new Error('Appointment is already cancelled');
    }

    const cancelled = await prisma.$transaction(async (tx) => {
      const updated = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: 'CANCELLED',
          notes: `${appointment.notes || ''}\n[Cancelled]: ${reason}`.trim(),
          updatedAt: new Date()
        },
        include: {
          patient: true,
          dentist: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'CANCEL_APPOINTMENT',
          entityType: 'Appointment',
          entityId: appointmentId,
          oldData: appointment as any,
          newValue: reason,
          createdAt: new Date()
        }
      });

      return updated;
    });

    return cancelled;
  }

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus,
    userId: string
  ): Promise<Appointment> {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true }
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedAppointment = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status,
          updatedAt: new Date()
        },
        include: {
          patient: true,
          dentist: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Update patient's last visit if status is COMPLETED
      if (status === 'COMPLETED' && appointment.status !== 'COMPLETED') {
        await tx.patient.update({
          where: { id: appointment.patientId },
          data: { lastVisitAt: appointment.appointmentDate }
        });
      }

      await tx.auditLog.create({
        data: {
          userId,
          action: 'UPDATE_APPOINTMENT_STATUS',
          entityType: 'Appointment',
          entityId: appointmentId,
          oldData: { status: appointment.status } as any,
          newData: { status } as any,
          createdAt: new Date()
        }
      });

      return updatedAppointment;
    });

    return updated;
  }

  /**
   * Search appointments with filters
   */
  async searchAppointments(filters: SearchAppointmentsInput): Promise<AppointmentSearchResult> {
    try {
      const validatedFilters = SearchAppointmentsSchema.parse(filters);
      const { page, limit, sortBy, sortOrder, includePatient, includeDentist, ...searchFilters } = validatedFilters;

      const where: Prisma.AppointmentWhereInput = {};

      if (searchFilters.dentistId) where.dentistId = searchFilters.dentistId;
      if (searchFilters.patientId) where.patientId = searchFilters.patientId;
      if (searchFilters.status) where.status = searchFilters.status;
      if (searchFilters.type) where.type = searchFilters.type;

      if (searchFilters.dateFrom || searchFilters.dateTo) {
        where.appointmentDate = {
          gte: searchFilters.dateFrom,
          lte: searchFilters.dateTo
        };
      }

      const [total, data] = await prisma.$transaction([
        prisma.appointment.count({ where }),
        prisma.appointment.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder
          },
          include: {
            patient: includePatient,
            dentist: includeDentist ? {
              select: {
                id: true,
                name: true,
                email: true,
                specialization: true
              }
            } : false
          }
        })
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${JSON.stringify(error.issues)}`);
      }
      throw error;
    }
  }

  /**
   * Get appointments for today
   */
  async getTodayAppointments(dentistId?: string): Promise<Appointment[]> {
    const today = new Date();
    const where: Prisma.AppointmentWhereInput = {
      appointmentDate: {
        gte: startOfDay(today),
        lt: endOfDay(today)
      },
      status: {
        notIn: ['CANCELLED', 'NO_SHOW']
      }
    };

    if (dentistId) {
      where.dentistId = dentistId;
    }

    return await prisma.appointment.findMany({
      where,
      orderBy: {
        appointmentDate: 'asc'
      },
      include: {
        patient: true,
        dentist: {
          select: {
            id: true,
            name: true,
            email: true,
            specialization: true
          }
        }
      }
    });
  }

  /**
   * Get upcoming appointments for a patient
   */
  async getPatientUpcomingAppointments(patientId: string): Promise<Appointment[]> {
    return await prisma.appointment.findMany({
      where: {
        patientId,
        appointmentDate: {
          gte: new Date()
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED']
        }
      },
      orderBy: {
        appointmentDate: 'asc'
      },
      include: {
        dentist: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        }
      }
    });
  }

  /**
   * Send reminder for a single appointment
   */
  async sendAppointmentReminder(appointmentId: string): Promise<ReminderResult> {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        dentist: {
          select: {
            name: true,
            specialization: true
          }
        }
      }
    });

    if (!appointment) {
      return {
        appointmentId,
        success: false,
        error: 'Appointment not found'
      };
    }

    if (appointment.reminderSent) {
      return {
        appointmentId,
        success: false,
        error: 'Reminder already sent'
      };
    }

    try {
      // Here you would integrate with your email/SMS service
      // For example: await sendEmail(appointment.patient.email, reminderTemplate)
      // or: await sendSMS(appointment.patient.phone, reminderMessage)

      const reminderMessage = `
        Dear ${appointment.patient.firstName} ${appointment.patient.lastName},
        
        This is a reminder for your appointment:
        Date: ${appointment.appointmentDate.toLocaleDateString()}
        Time: ${appointment.appointmentDate.toLocaleTimeString()}
        Doctor: Dr. ${appointment.dentist.name}
        Type: ${appointment.type}
        
        Please arrive 10 minutes early for check-in.
        
        If you need to reschedule, please contact us as soon as possible.
      `;

      console.log('Sending reminder:', reminderMessage);

      // Update appointment to mark reminder as sent
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          reminderSent: true,
          reminderSentAt: new Date()
        }
      });

      return {
        appointmentId,
        success: true,
        sentAt: new Date()
      };
    } catch (error) {
      return {
        appointmentId,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send reminder'
      };
    }
  }

  /**
   * Send batch reminders for upcoming appointments
   */
  async sendBatchReminders(hoursInAdvance: number = 24): Promise<BatchReminderResult> {
    const startTime = new Date();
    const reminderTime = addHours(new Date(), hoursInAdvance);

    // Get appointments that need reminders
    const appointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: startTime,
          lte: reminderTime
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED']
        },
        reminderSent: false
      },
      include: {
        patient: true,
        dentist: {
          select: {
            name: true,
            specialization: true
          }
        }
      }
    });

    const results: ReminderResult[] = [];

    for (const appointment of appointments) {
      const result = await this.sendAppointmentReminder(appointment.id);
      results.push(result);
    }

    const endTime = new Date();
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    // Log batch results
    const batchLog = await prisma.reminderBatchLog.create({
      data: {
        startTime,
        endTime,
        totalAppointments: appointments.length,
        processed: results.length,
        successful,
        failed,
        duration: differenceInMinutes(endTime, startTime),
        results: results as any
      }
    });

    return {
      totalProcessed: results.length,
      successful,
      failed,
      results,
      batchLogId: batchLog.id
    };
  }

  /**
   * Get appointment statistics for a period
   */
  async getAppointmentStats(
    dateFrom: Date,
    dateTo: Date,
    dentistId?: string
  ): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    averageDuration: number;
    noShowRate: number;
    completionRate: number;
  }> {
    const where: Prisma.AppointmentWhereInput = {
      appointmentDate: {
        gte: dateFrom,
        lte: dateTo
      }
    };

    if (dentistId) {
      where.dentistId = dentistId;
    }

    const appointments = await prisma.appointment.findMany({ where });

    const stats = {
      total: appointments.length,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      averageDuration: 0,
      noShowRate: 0,
      completionRate: 0
    };

    if (appointments.length === 0) {
      return stats;
    }

    let totalDuration = 0;
    let noShows = 0;
    let completed = 0;

    for (const appointment of appointments) {
      // Count by status
      stats.byStatus[appointment.status] = (stats.byStatus[appointment.status] || 0) + 1;
      
      // Count by type
      stats.byType[appointment.type] = (stats.byType[appointment.type] || 0) + 1;
      
      // Sum durations
      totalDuration += appointment.durationMinutes;
      
      // Count no-shows and completed
      if (appointment.status === 'NO_SHOW') noShows++;
      if (appointment.status === 'COMPLETED') completed++;
    }

    stats.averageDuration = Math.round(totalDuration / appointments.length);
    stats.noShowRate = Math.round((noShows / appointments.length) * 100);
    stats.completionRate = Math.round((completed / appointments.length) * 100);

    return stats;
  }

  /**
   * Get dentist schedule for a date range
   */
  async getDentistSchedule(
    dentistId: string,
    dateFrom: Date,
    dateTo: Date
  ): Promise<{
    appointments: Appointment[];
    workload: {
      totalHours: number;
      averagePerDay: number;
      busiestDay: string;
      lightestDay: string;
    };
  }> {
    const appointments = await prisma.appointment.findMany({
      where: {
        dentistId,
        appointmentDate: {
          gte: dateFrom,
          lte: dateTo
        },
        status: {
          notIn: ['CANCELLED', 'NO_SHOW']
        }
      },
      orderBy: {
        appointmentDate: 'asc'
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      }
    });

    // Calculate workload
    const dailyHours: Record<string, number> = {};
    let totalMinutes = 0;

    for (const appointment of appointments) {
      const dateKey = appointment.appointmentDate.toISOString().split('T')[0];
      dailyHours[dateKey] = (dailyHours[dateKey] || 0) + appointment.durationMinutes;
      totalMinutes += appointment.durationMinutes;
    }

    const workdays = Object.keys(dailyHours);
    const totalHours = totalMinutes / 60;
    const averagePerDay = workdays.length > 0 ? totalHours / workdays.length : 0;

    let busiestDay = '';
    let lightestDay = '';
    let maxHours = 0;
    let minHours = Infinity;

    for (const [day, minutes] of Object.entries(dailyHours)) {
      const hours = minutes / 60;
      if (hours > maxHours) {
        maxHours = hours;
        busiestDay = day;
      }
      if (hours < minHours) {
        minHours = hours;
        lightestDay = day;
      }
    }

    return {
      appointments,
      workload: {
        totalHours: Math.round(totalHours * 10) / 10,
        averagePerDay: Math.round(averagePerDay * 10) / 10,
        busiestDay,
        lightestDay
      }
    };
  }

  /**
   * Optimize schedule by suggesting better time slots
   */
  async optimizeSchedule(
    dentistId: string,
    date: Date
  ): Promise<{
    currentEfficiency: number;
    suggestions: Array<{
      appointmentId: string;
      currentTime: Date;
      suggestedTime: Date;
      reason: string;
    }>;
  }> {
    const appointments = await prisma.appointment.findMany({
      where: {
        dentistId,
        appointmentDate: {
          gte: startOfDay(date),
          lt: endOfDay(date)
        },
        status: {
          notIn: ['CANCELLED', 'NO_SHOW', 'COMPLETED']
        }
      },
      orderBy: {
        appointmentDate: 'asc'
      }
    });

    const clinicSettings = await prisma.clinicSettings.findFirst();
    const bufferMinutes = clinicSettings?.appointmentBuffer || 5;

    // Calculate current efficiency (minimize gaps between appointments)
    let totalGapMinutes = 0;
    let totalWorkMinutes = 0;
    const suggestions: Array<{
      appointmentId: string;
      currentTime: Date;
      suggestedTime: Date;
      reason: string;
    }> = [];

    for (let i = 0; i < appointments.length - 1; i++) {
      const current = appointments[i];
      const next = appointments[i + 1];
      const currentEnd = addMinutes(current.appointmentDate, current.durationMinutes);
      const gap = differenceInMinutes(next.appointmentDate, currentEnd);

      totalWorkMinutes += current.durationMinutes;

      if (gap > bufferMinutes) {
        totalGapMinutes += gap - bufferMinutes;

        // Suggest moving the next appointment earlier
        const suggestedTime = addMinutes(currentEnd, bufferMinutes);
        
        // Check if the suggested time doesn't conflict with other constraints
        const conflicts = await this.checkConflicts(
          dentistId,
          suggestedTime,
          next.durationMinutes,
          next.id
        );

        if (conflicts.length === 0) {
          suggestions.push({
            appointmentId: next.id,
            currentTime: next.appointmentDate,
            suggestedTime,
            reason: `Reduce ${gap} minute gap between appointments`
          });
        }
      }
    }

    if (appointments.length > 0) {
      totalWorkMinutes += appointments[appointments.length - 1].durationMinutes;
    }

    const currentEfficiency = totalWorkMinutes > 0
      ? Math.round(((totalWorkMinutes / (totalWorkMinutes + totalGapMinutes)) * 100))
      : 100;

    return {
      currentEfficiency,
      suggestions
    };
  }

  /**
   * Mark appointment as no-show
   */
  async markNoShow(appointmentId: string, userId: string): Promise<Appointment> {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const now = new Date();
    if (appointment.appointmentDate > now) {
      throw new Error('Cannot mark future appointments as no-show');
    }

    return await this.updateAppointmentStatus(appointmentId, 'NO_SHOW', userId);
  }

  /**
   * Confirm an appointment
   */
  async confirmAppointment(appointmentId: string, userId: string): Promise<Appointment> {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.status !== 'SCHEDULED') {
      throw new Error('Only scheduled appointments can be confirmed');
    }

    return await this.updateAppointmentStatus(appointmentId, 'CONFIRMED', userId);
  }

  /**
   * Get appointment history for a patient
   */
  async getPatientAppointmentHistory(
    patientId: string,
    limit: number = 50
  ): Promise<{
    appointments: Appointment[];
    stats: {
      total: number;
      completed: number;
      cancelled: number;
      noShow: number;
      averageDuration: number;
    };
  }> {
    const appointments = await prisma.appointment.findMany({
      where: { patientId },
      orderBy: { appointmentDate: 'desc' },
      take: limit,
      include: {
        dentist: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        }
      }
    });

    const stats = {
      total: appointments.length,
      completed: appointments.filter(a => a.status === 'COMPLETED').length,
      cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
      noShow: appointments.filter(a => a.status === 'NO_SHOW').length,
      averageDuration: 0
    };

    if (appointments.length > 0) {
      const totalDuration = appointments.reduce((sum, a) => sum + a.durationMinutes, 0);
      stats.averageDuration = Math.round(totalDuration / appointments.length);
    }

    return { appointments, stats };
  }

  /**
   * Check if patient has upcoming appointments
   */
  async hasUpcomingAppointments(patientId: string): Promise<boolean> {
    const count = await prisma.appointment.count({
      where: {
        patientId,
        appointmentDate: {
          gte: new Date()
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED']
        }
      }
    });

    return count > 0;
  }

  /**
   * Get next available slot for a specific procedure type
   */
  async getNextAvailableSlot(
    dentistId: string,
    duration: number,
    preferredTime?: 'morning' | 'afternoon' | 'evening'
  ): Promise<TimeSlot | null> {
    const maxDaysToSearch = 30;
    const today = new Date();

    for (let i = 0; i < maxDaysToSearch; i++) {
      const searchDate = addDays(today, i);
      const availability = await this.getAvailableSlots(dentistId, searchDate, duration);

      let filteredSlots = availability.slots.filter(s => s.available);

      // Filter by preferred time if specified
      if (preferredTime && filteredSlots.length > 0) {
        filteredSlots = filteredSlots.filter(slot => {
          const hour = slot.start.getHours();
          if (preferredTime === 'morning') return hour >= 8 && hour < 12;
          if (preferredTime === 'afternoon') return hour >= 12 && hour < 17;
          if (preferredTime === 'evening') return hour >= 17 && hour < 20;
          return true;
        });
      }

      if (filteredSlots.length > 0) {
        return filteredSlots[0];
      }
    }

    return null;
  }

  /**
   * Bulk update appointment statuses (useful for end-of-day processing)
   */
  async bulkUpdateStatuses(
    updates: Array<{ appointmentId: string; status: AppointmentStatus }>,
    userId: string
  ): Promise<{ successful: number; failed: number; errors: Array<{ id: string; error: string }> }> {
    let successful = 0;
    let failed = 0;
    const errors: Array<{ id: string; error: string }> = [];

    for (const update of updates) {
      try {
        await this.updateAppointmentStatus(update.appointmentId, update.status, userId);
        successful++;
      } catch (error) {
        failed++;
        errors.push({
          id: update.appointmentId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { successful, failed, errors };
  }

  /**
   * Get appointment by ID with full details
   */
  async getAppointmentById(id: string): Promise<Appointment | null> {
    return await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        dentist: {
          select: {
            id: true,
            name: true,
            email: true,
            specialization: true,
            licenseNumber: true
          }
        }
      }
    });
  }

  /**
   * Update appointment details
   */
  async updateAppointment(
    appointmentId: string,
    data: UpdateAppointmentInput,
    userId: string
  ): Promise<Appointment> {
    try {
      const validatedData = UpdateAppointmentSchema.parse(data);

      const existingAppointment = await prisma.appointment.findUnique({
        where: { id: appointmentId }
      });

      if (!existingAppointment) {
        throw new Error('Appointment not found');
      }

      // If date or duration is changing, check for conflicts
      if (validatedData.appointmentDate || validatedData.durationMinutes) {
        const newDate = validatedData.appointmentDate as Date || existingAppointment.appointmentDate;
        const newDuration = validatedData.durationMinutes || existingAppointment.durationMinutes;

        const conflicts = await this.checkConflicts(
          existingAppointment.dentistId,
          newDate,
          newDuration,
          appointmentId
        );

        if (conflicts.length > 0) {
          const conflictMessages = conflicts.map(c => c.message).join(', ');
          throw new Error(`Cannot update appointment: ${conflictMessages}`);
        }
      }

      const updated = await prisma.$transaction(async (tx) => {
        const updatedAppointment = await tx.appointment.update({
          where: { id: appointmentId },
          data: {
            ...validatedData,
            appointmentDate: validatedData.appointmentDate as Date | undefined,
            updatedAt: new Date()
          },
          include: {
            patient: true,
            dentist: {
              select: {
                id: true,
                name: true,
                email: true,
                specialization: true
              }
            }
          }
        });

        await tx.auditLog.create({
          data: {
            userId,
            action: 'UPDATE_APPOINTMENT',
            entityType: 'Appointment',
            entityId: appointmentId,
            oldData: existingAppointment as any,
            newData: updatedAppointment as any,
            createdAt: new Date()
          }
        });

        return updatedAppointment;
      });

      return updated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${JSON.stringify(error.issues)}`);
      }
      throw error;
    }
  }
}

// Export singleton instance
export const appointmentService = new AppointmentService();

// Export for testing
export default AppointmentService;