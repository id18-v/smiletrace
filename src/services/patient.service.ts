// src/services/patient.service.ts
import prisma from '@/lib/db';
import { 
  Prisma, 
  Patient, 
  Gender,
  AppointmentStatus,
  PaymentStatus 
} from '@prisma/client';
import { z } from 'zod';

// Validation schemas
export const createPatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email').optional().nullable(),
  phone: z.string().min(10, 'Valid phone number required').max(20),
  dateOfBirth: z.string().or(z.date()).transform(val => new Date(val)),
  gender: z.nativeEnum(Gender),
  address: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  zipCode: z.string().max(20).optional().nullable(),
  country: z.string().max(100).default('USA'),
  bloodType: z.string().max(10).optional().nullable(),
  allergies: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  medicalHistory: z.string().optional().nullable(),
  insuranceProvider: z.string().max(100).optional().nullable(),
  insurancePolicyNumber: z.string().max(50).optional().nullable(),
  insuranceGroupNumber: z.string().max(50).optional().nullable(),
  emergencyContactName: z.string().max(100).optional().nullable(),
  emergencyContactPhone: z.string().max(20).optional().nullable(),
  emergencyContactRelation: z.string().max(50).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateMedicalHistorySchema = z.object({
  bloodType: z.string().max(10).optional().nullable(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  medicalHistory: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const searchPatientsSchema = z.object({
  query: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  insuranceProvider: z.string().optional(),
  hasAllergies: z.boolean().optional(),
  hasMedications: z.boolean().optional(),
  isActive: z.boolean().optional(),
  createdAfter: z.string().optional(),
  createdBefore: z.string().optional(),
  lastVisitAfter: z.string().optional(),
  lastVisitBefore: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'lastName', 'firstName', 'lastVisitAt']).default('lastName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const bulkImportSchema = z.object({
  patients: z.array(createPatientSchema),
  options: z.object({
    skipDuplicates: z.boolean().default(false),
    updateExisting: z.boolean().default(false),
  }).default({ skipDuplicates: false, updateExisting: false })
});

export const mergePatientSchema = z.object({
  primaryPatientId: z.string().uuid(),
  duplicatePatientId: z.string().uuid(),
});

// Types
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdateMedicalHistoryInput = z.infer<typeof updateMedicalHistorySchema>;
export type SearchPatientsInput = z.infer<typeof searchPatientsSchema>;
export type BulkImportInput = z.infer<typeof bulkImportSchema>;
export type MergePatientInput = z.infer<typeof mergePatientSchema>;

// Service Class
export class PatientService {
  /**
   * Create a new patient with full validation and duplicate checking
   */
  static async createPatient(data: CreatePatientInput, createdById: string): Promise<Patient> {
    // Validate input
    const validatedData = createPatientSchema.parse(data);

    // Check for existing patient with same email (if provided)
    if (validatedData.email) {
      const existingEmail = await prisma.patient.findFirst({
        where: { 
          email: validatedData.email,
          isActive: true 
        }
      });
      
      if (existingEmail) {
        throw new Error('A patient with this email already exists');
      }
    }

    // Check for existing patient with same phone
    const existingPhone = await prisma.patient.findFirst({
      where: { 
        phone: validatedData.phone,
        isActive: true 
      }
    });
    
    if (existingPhone) {
      throw new Error('A patient with this phone number already exists');
    }

    // Create patient with audit log in transaction
    const patient = await prisma.$transaction(async (tx) => {
      const newPatient = await tx.patient.create({
        data: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          phone: validatedData.phone,
          dateOfBirth: validatedData.dateOfBirth,
          gender: validatedData.gender,
          address: validatedData.address,
          city: validatedData.city,
          state: validatedData.state,
          zipCode: validatedData.zipCode,
          country: validatedData.country,
          bloodType: validatedData.bloodType,
          allergies: validatedData.allergies,
          medications: validatedData.medications,
          medicalHistory: validatedData.medicalHistory,
          insuranceProvider: validatedData.insuranceProvider,
          insurancePolicyNumber: validatedData.insurancePolicyNumber,
          insuranceGroupNumber: validatedData.insuranceGroupNumber,
          emergencyContactName: validatedData.emergencyContactName,
          emergencyContactPhone: validatedData.emergencyContactPhone,
          emergencyContactRelation: validatedData.emergencyContactRelation,
          notes: validatedData.notes,
          createdById,
          isActive: true,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: createdById,
          action: 'CREATE_PATIENT',
          entityType: 'Patient',
          entityId: newPatient.id,
          newData: newPatient as any,
        }
      });

      return newPatient;
    });

    return patient;
  }

  /**
   * Update patient medical history with validation and audit trail
   */
  static async updateMedicalHistory(
    patientId: string, 
    data: UpdateMedicalHistoryInput,
    userId: string
  ): Promise<Patient> {
    // Validate input
    const validatedData = updateMedicalHistorySchema.parse(data);

    // Get existing patient
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    if (!patient.isActive) {
      throw new Error('Cannot update inactive patient');
    }

    // Update with transaction and audit log
    const updatedPatient = await prisma.$transaction(async (tx) => {
      // Store old data for audit
      const oldData = {
        bloodType: patient.bloodType,
        allergies: patient.allergies,
        medications: patient.medications,
        medicalHistory: patient.medicalHistory,
        notes: patient.notes,
      };

      // Update patient
      const updated = await tx.patient.update({
        where: { id: patientId },
        data: {
          bloodType: validatedData.bloodType !== undefined ? validatedData.bloodType : patient.bloodType,
          allergies: validatedData.allergies !== undefined ? validatedData.allergies : patient.allergies,
          medications: validatedData.medications !== undefined ? validatedData.medications : patient.medications,
          medicalHistory: validatedData.medicalHistory !== undefined ? validatedData.medicalHistory : patient.medicalHistory,
          notes: validatedData.notes !== undefined ? validatedData.notes : patient.notes,
          updatedAt: new Date(),
        },
        include: {
          treatments: {
            take: 5,
            orderBy: { treatmentDate: 'desc' },
            include: {
              dentist: {
                select: {
                  id: true,
                  name: true,
                  specialization: true,
                }
              }
            }
          },
          appointments: {
            take: 5,
            orderBy: { appointmentDate: 'desc' },
            include: {
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

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'UPDATE_MEDICAL_HISTORY',
          entityType: 'Patient',
          entityId: patientId,
          oldData: oldData as any,
          newData: validatedData as any,
        }
      });

      return updated;
    });

    return updatedPatient;
  }

  /**
   * Advanced patient search with multiple filters and pagination
   */
  static async searchPatients(filters: SearchPatientsInput) {
    // Validate input
    const validatedFilters = searchPatientsSchema.parse(filters);
    
    const {
      query,
      page = 1,
      limit = 20,
      sortBy = 'lastName',
      sortOrder = 'asc',
      ...searchFilters
    } = validatedFilters;

    // Build where clause
    const where: Prisma.PatientWhereInput = {};
    const andConditions: Prisma.PatientWhereInput[] = [];

    // General text search
    if (query) {
      andConditions.push({
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
          { notes: { contains: query, mode: 'insensitive' } },
        ]
      });
    }

    // Specific field filters
    if (searchFilters.firstName) {
      andConditions.push({ firstName: { contains: searchFilters.firstName, mode: 'insensitive' } });
    }
    if (searchFilters.lastName) {
      andConditions.push({ lastName: { contains: searchFilters.lastName, mode: 'insensitive' } });
    }
    if (searchFilters.email) {
      andConditions.push({ email: { contains: searchFilters.email, mode: 'insensitive' } });
    }
    if (searchFilters.phone) {
      andConditions.push({ phone: { contains: searchFilters.phone } });
    }
    if (searchFilters.gender) {
      andConditions.push({ gender: searchFilters.gender });
    }
    if (searchFilters.city) {
      andConditions.push({ city: { contains: searchFilters.city, mode: 'insensitive' } });
    }
    if (searchFilters.state) {
      andConditions.push({ state: { contains: searchFilters.state, mode: 'insensitive' } });
    }
    if (searchFilters.insuranceProvider) {
      andConditions.push({ 
        insuranceProvider: { contains: searchFilters.insuranceProvider, mode: 'insensitive' } 
      });
    }

    // Boolean filters
    if (searchFilters.hasAllergies === true) {
      andConditions.push({ 
        NOT: { allergies: { isEmpty: true } }
      });
    }
    if (searchFilters.hasMedications === true) {
      andConditions.push({ 
        NOT: { medications: { isEmpty: true } }
      });
    }
    if (searchFilters.isActive !== undefined) {
      andConditions.push({ isActive: searchFilters.isActive });
    }

    // Date filters
    if (searchFilters.dateOfBirth) {
      const dob = new Date(searchFilters.dateOfBirth);
      const nextDay = new Date(dob);
      nextDay.setDate(nextDay.getDate() + 1);
      andConditions.push({ 
        dateOfBirth: {
          gte: dob,
          lt: nextDay
        }
      });
    }
    if (searchFilters.createdAfter) {
      andConditions.push({ createdAt: { gte: new Date(searchFilters.createdAfter) } });
    }
    if (searchFilters.createdBefore) {
      andConditions.push({ createdAt: { lte: new Date(searchFilters.createdBefore) } });
    }
    if (searchFilters.lastVisitAfter) {
      andConditions.push({ lastVisitAt: { gte: new Date(searchFilters.lastVisitAfter) } });
    }
    if (searchFilters.lastVisitBefore) {
      andConditions.push({ lastVisitAt: { lte: new Date(searchFilters.lastVisitBefore) } });
    }

    // Apply conditions
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    // Execute query with pagination
    const [patients, total] = await prisma.$transaction([
      prisma.patient.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              appointments: true,
              treatments: true,
            }
          },
          appointments: {
            take: 1,
            orderBy: { appointmentDate: 'desc' },
            where: {
              status: 'SCHEDULED'
            },
            select: {
              id: true,
              appointmentDate: true,
              status: true,
              type: true,
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      }),
      prisma.patient.count({ where })
    ]);

    return {
      data: patients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit)
      }
    };
  }

  /**
   * Merge duplicate patient records
   */
  static async mergePatientRecords(
    primaryPatientId: string,
    duplicatePatientId: string,
    userId: string
  ): Promise<Patient> {
    // Validate IDs are different
    if (primaryPatientId === duplicatePatientId) {
      throw new Error('Cannot merge a patient with itself');
    }

    // Get both patients
    const [primaryPatient, duplicatePatient] = await Promise.all([
      prisma.patient.findUnique({ 
        where: { id: primaryPatientId },
        include: {
          appointments: true,
          treatments: true
        }
      }),
      prisma.patient.findUnique({ 
        where: { id: duplicatePatientId },
        include: {
          appointments: true,
          treatments: true
        }
      })
    ]);

    if (!primaryPatient) {
      throw new Error('Primary patient not found');
    }
    if (!duplicatePatient) {
      throw new Error('Duplicate patient not found');
    }

    // Perform merge in transaction
    const mergedPatient = await prisma.$transaction(async (tx) => {
      // Transfer all appointments to primary patient
      await tx.appointment.updateMany({
        where: { patientId: duplicatePatientId },
        data: { patientId: primaryPatientId }
      });

      // Transfer all treatments to primary patient
      await tx.treatment.updateMany({
        where: { patientId: duplicatePatientId },
        data: { patientId: primaryPatientId }
      });

      // Prepare merged data
      const mergedNotes = [primaryPatient.notes, duplicatePatient.notes]
        .filter(Boolean)
        .join('\n\n--- Merged from duplicate record ---\n\n');

      const mergedMedicalHistory = [primaryPatient.medicalHistory, duplicatePatient.medicalHistory]
        .filter(Boolean)
        .join('\n\n--- Merged from duplicate record ---\n\n');

      // Merge arrays without duplicates
      const mergedAllergies = Array.from(new Set([
        ...primaryPatient.allergies,
        ...duplicatePatient.allergies
      ]));

      const mergedMedications = Array.from(new Set([
        ...primaryPatient.medications,
        ...duplicatePatient.medications
      ]));

      // Update primary patient with merged data
      const updated = await tx.patient.update({
        where: { id: primaryPatientId },
        data: {
          // Keep primary patient basic info, fill missing from duplicate
          email: primaryPatient.email || duplicatePatient.email,
          address: primaryPatient.address || duplicatePatient.address,
          city: primaryPatient.city || duplicatePatient.city,
          state: primaryPatient.state || duplicatePatient.state,
          zipCode: primaryPatient.zipCode || duplicatePatient.zipCode,
          bloodType: primaryPatient.bloodType || duplicatePatient.bloodType,
          allergies: mergedAllergies,
          medications: mergedMedications,
          medicalHistory: mergedMedicalHistory || undefined,
          insuranceProvider: primaryPatient.insuranceProvider || duplicatePatient.insuranceProvider,
          insurancePolicyNumber: primaryPatient.insurancePolicyNumber || duplicatePatient.insurancePolicyNumber,
          insuranceGroupNumber: primaryPatient.insuranceGroupNumber || duplicatePatient.insuranceGroupNumber,
          emergencyContactName: primaryPatient.emergencyContactName || duplicatePatient.emergencyContactName,
          emergencyContactPhone: primaryPatient.emergencyContactPhone || duplicatePatient.emergencyContactPhone,
          emergencyContactRelation: primaryPatient.emergencyContactRelation || duplicatePatient.emergencyContactRelation,
          lastVisitAt: duplicatePatient.lastVisitAt && 
            (!primaryPatient.lastVisitAt || duplicatePatient.lastVisitAt > primaryPatient.lastVisitAt)
            ? duplicatePatient.lastVisitAt 
            : primaryPatient.lastVisitAt,
          notes: mergedNotes || undefined,
          updatedAt: new Date()
        },
        include: {
          appointments: {
            orderBy: { appointmentDate: 'desc' },
            take: 5
          },
          treatments: {
            orderBy: { treatmentDate: 'desc' },
            take: 5
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });

      // Soft delete duplicate patient
      await tx.patient.update({
        where: { id: duplicatePatientId },
        data: { 
          isActive: false,
          notes: `Merged into patient ${primaryPatientId} on ${new Date().toISOString()}`
        }
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'MERGE_PATIENTS',
          entityType: 'Patient',
          entityId: primaryPatientId,
          oldData: { 
            primaryPatient: {
              id: primaryPatient.id,
              name: `${primaryPatient.firstName} ${primaryPatient.lastName}`
            },
            duplicatePatient: {
              id: duplicatePatient.id,
              name: `${duplicatePatient.firstName} ${duplicatePatient.lastName}`
            }
          } as any,
          newData: { mergedPatientId: primaryPatientId } as any,
        }
      });

      return updated;
    });

    return mergedPatient;
  }

  /**
   * Get comprehensive patient summary with all related data
   */
  static async getPatientSummary(patientId: string) {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        treatments: {
          orderBy: { treatmentDate: 'desc' },
          include: {
            dentist: {
              select: {
                id: true,
                name: true,
                specialization: true,
              }
            },
            items: {
              include: {
                procedure: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                    code: true,
                  }
                }
              }
            },
            receipt: {
              select: {
                id: true,
                receiptNumber: true,
                totalAmount: true,
                paidAmount: true,
                balanceDue: true,
                status: true,
              }
            },
          }
        },
        appointments: {
          orderBy: { appointmentDate: 'desc' },
          include: {
            dentist: {
              select: {
                id: true,
                name: true,
                specialization: true,
              }
            }
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    // Calculate statistics
    const now = new Date();
    const stats = {
      totalAppointments: patient.appointments.length,
      completedAppointments: patient.appointments.filter(
        a => a.status === AppointmentStatus.COMPLETED
      ).length,
      upcomingAppointments: patient.appointments.filter(
        a => a.status === AppointmentStatus.SCHEDULED && a.appointmentDate > now
      ).length,
      cancelledAppointments: patient.appointments.filter(
        a => a.status === AppointmentStatus.CANCELLED
      ).length,
      noShowAppointments: patient.appointments.filter(
        a => a.status === AppointmentStatus.NO_SHOW
      ).length,
      totalTreatments: patient.treatments.length,
      totalSpent: patient.treatments.reduce((sum, t) => sum + t.paidAmount, 0),
      totalOwed: patient.treatments
        .filter(t => t.paymentStatus !== PaymentStatus.PAID)
        .reduce((sum, t) => sum + (t.totalCost - t.paidAmount), 0),
      averageTreatmentCost: patient.treatments.length > 0
        ? patient.treatments.reduce((sum, t) => sum + t.totalCost, 0) / patient.treatments.length
        : 0,
      lastVisit: patient.lastVisitAt,
      nextAppointment: patient.appointments
        .filter(a => a.status === AppointmentStatus.SCHEDULED && a.appointmentDate > now)
        .sort((a, b) => a.appointmentDate.getTime() - b.appointmentDate.getTime())[0] || null,
    };

    // Calculate age
    const today = new Date();
    const birthDate = new Date(patient.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return {
      patient: {
        ...patient,
        age,
        fullName: `${patient.firstName} ${patient.lastName}`,
      },
      statistics: stats,
      recentActivity: {
        lastAppointment: patient.appointments.find(a => a.status === AppointmentStatus.COMPLETED) || null,
        lastTreatment: patient.treatments[0] || null,
        upcomingAppointments: patient.appointments
          .filter(a => a.status === AppointmentStatus.SCHEDULED && a.appointmentDate > now)
          .slice(0, 3),
      }
    };
  }

  /**
   * Bulk import patients from array
   */
  static async bulkImportPatients(
    data: BulkImportInput,
    createdById: string
  ) {
    const { patients, options } = bulkImportSchema.parse(data);
    
    const results = {
      success: [] as Patient[],
      failed: [] as { data: any; error: string }[],
      skipped: [] as { data: any; reason: string }[],
      updated: [] as Patient[],
    };

    for (const patientData of patients) {
      try {
        // Validate individual patient data
        const validatedData = createPatientSchema.parse(patientData);

        // Check for existing patient
        const existing = await prisma.patient.findFirst({
          where: {
            OR: [
              ...(validatedData.email ? [{ email: validatedData.email }] : []),
              { phone: validatedData.phone }
            ],
            isActive: true
          }
        });

        if (existing) {
          if (options.skipDuplicates) {
            results.skipped.push({
              data: patientData,
              reason: `Duplicate: ${existing.firstName} ${existing.lastName}`
            });
            continue;
          } else if (options.updateExisting) {
            const updated = await prisma.patient.update({
              where: { id: existing.id },
              data: {
                ...validatedData,
                updatedAt: new Date()
              }
            });
            results.updated.push(updated);
            continue;
          } else {
            results.failed.push({
              data: patientData,
              error: `Duplicate patient found: ${existing.firstName} ${existing.lastName}`
            });
            continue;
          }
        }

        // Create new patient
        const newPatient = await prisma.patient.create({
          data: {
            ...validatedData,
            createdById,
          }
        });
        results.success.push(newPatient);

      } catch (error: any) {
        results.failed.push({
          data: patientData,
          error: error.message || 'Unknown error'
        });
      }
    }

    // Create audit log for bulk import
    await prisma.auditLog.create({
      data: {
        userId: createdById,
        action: 'BULK_IMPORT_PATIENTS',
        entityType: 'Patient',
        newData: {
          total: patients.length,
          success: results.success.length,
          failed: results.failed.length,
          skipped: results.skipped.length,
          updated: results.updated.length,
        } as any,
      }
    });

    return {
      summary: {
        total: patients.length,
        successful: results.success.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
        updated: results.updated.length,
      },
      results
    };
  }
}

export default PatientService;