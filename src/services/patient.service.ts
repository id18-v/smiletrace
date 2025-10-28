// src/services/patient.service.ts
import prisma from "@/lib/db";
import { Prisma, Gender } from "@prisma/client";

export interface CreatePatientInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  dateOfBirth: Date;
  gender: Gender;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  medicalHistory?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceGroupNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  notes?: string;
  createdById: string;
}

export interface UpdateMedicalHistoryInput {
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
  bloodType?: string;
}

export interface SearchPatientsFilters {
  query?: string;
  gender?: Gender;
  city?: string;
  state?: string;
  insuranceProvider?: string;
  isActive?: boolean;
  minAge?: number;
  maxAge?: number;
  hasAllergies?: boolean;
  hasMedications?: boolean;
}

export interface PatientSummary {
  patient: any;
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  totalTreatments: number;
  totalSpent: number;
  balanceDue: number;
  lastVisit?: Date;
  nextAppointment?: Date;
}

export class PatientService {
  // Create a new patient with full registration
  static async createPatient(data: CreatePatientInput) {
    try {
      // Check for duplicate email if provided
      if (data.email) {
        const existingPatient = await prisma.patient.findUnique({
          where: { email: data.email },
        });

        if (existingPatient) {
          throw new Error("Un pacient cu acest email există deja");
        }
      }

      // Check for duplicate phone
      const existingPhone = await prisma.patient.findFirst({
        where: { phone: data.phone },
      });

      if (existingPhone) {
        throw new Error("Un pacient cu acest număr de telefon există deja");
      }

      const patient = await prisma.patient.create({
        data: {
          ...data,
          country: data.country || "USA",
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: data.createdById,
          action: "PATIENT_CREATED",
          entityType: "Patient",
          entityId: patient.id,
          newData: patient as any,
        },
      });

      return patient;
    } catch (error) {
      console.error("Error creating patient:", error);
      throw error;
    }
  }

  // Update medical history and related information
  static async updateMedicalHistory(
    patientId: string,
    data: UpdateMedicalHistoryInput,
    updatedById: string
  ) {
    try {
      const oldPatient = await prisma.patient.findUnique({
        where: { id: patientId },
      });

      if (!oldPatient) {
        throw new Error("Pacientul nu a fost găsit");
      }

      const updatedPatient = await prisma.patient.update({
        where: { id: patientId },
        data: {
          medicalHistory: data.medicalHistory,
          allergies: data.allergies,
          medications: data.medications,
          bloodType: data.bloodType,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: updatedById,
          action: "PATIENT_MEDICAL_HISTORY_UPDATED",
          entityType: "Patient",
          entityId: patientId,
          oldData: {
            medicalHistory: oldPatient.medicalHistory,
            allergies: oldPatient.allergies,
            medications: oldPatient.medications,
            bloodType: oldPatient.bloodType,
          } as any,
          newData: {
            medicalHistory: updatedPatient.medicalHistory,
            allergies: updatedPatient.allergies,
            medications: updatedPatient.medications,
            bloodType: updatedPatient.bloodType,
          } as any,
        },
      });

      return updatedPatient;
    } catch (error) {
      console.error("Error updating medical history:", error);
      throw error;
    }
  }

  // Advanced search with multiple filters
  static async searchPatients(
    filters: SearchPatientsFilters,
    page: number = 1,
    pageSize: number = 20
  ) {
    try {
      const where: Prisma.PatientWhereInput = {};

      // Text search across multiple fields
      if (filters.query) {
        where.OR = [
          { firstName: { contains: filters.query, mode: "insensitive" } },
          { lastName: { contains: filters.query, mode: "insensitive" } },
          { email: { contains: filters.query, mode: "insensitive" } },
          { phone: { contains: filters.query } },
        ];
      }

      // Filter by gender
      if (filters.gender) {
        where.gender = filters.gender;
      }

      // Filter by location
      if (filters.city) {
        where.city = { contains: filters.city, mode: "insensitive" };
      }

      if (filters.state) {
        where.state = filters.state;
      }

      // Filter by insurance
      if (filters.insuranceProvider) {
        where.insuranceProvider = {
          contains: filters.insuranceProvider,
          mode: "insensitive",
        };
      }

      // Filter by active status
      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      // Filter by age range
      if (filters.minAge || filters.maxAge) {
        const today = new Date();

        const dateFilter: { gte?: Date; lte?: Date } = {};

        if (filters.maxAge) {
          const minDate = new Date(
            today.getFullYear() - filters.maxAge,
            today.getMonth(),
            today.getDate()
          );
          dateFilter.gte = minDate;
        }

        if (filters.minAge) {
          const maxDate = new Date(
            today.getFullYear() - filters.minAge,
            today.getMonth(),
            today.getDate()
          );
          dateFilter.lte = maxDate;
        }

        where.dateOfBirth = dateFilter;
      }

      // Filter by allergies
      if (filters.hasAllergies) {
        where.allergies = { isEmpty: false };
      }

      // Filter by medications
      if (filters.hasMedications) {
        where.medications = { isEmpty: false };
      }

      const [patients, total] = await Promise.all([
        prisma.patient.findMany({
          where,
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                appointments: true,
                treatments: true,
              },
            },
          },
          orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.patient.count({ where }),
      ]);

      return {
        patients,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error) {
      console.error("Error searching patients:", error);
      throw error;
    }
  }

  // Get complete patient summary with statistics
  static async getPatientSummary(patientId: string): Promise<PatientSummary> {
    try {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!patient) {
        throw new Error("Pacientul nu a fost găsit");
      }

      // Get appointment statistics
      const [
        totalAppointments,
        completedAppointments,
        upcomingAppointments,
        nextAppointment,
      ] = await Promise.all([
        prisma.appointment.count({
          where: { patientId },
        }),
        prisma.appointment.count({
          where: {
            patientId,
            status: "COMPLETED",
          },
        }),
        prisma.appointment.count({
          where: {
            patientId,
            status: { in: ["SCHEDULED", "CONFIRMED"] },
            appointmentDate: { gte: new Date() },
          },
        }),
        prisma.appointment.findFirst({
          where: {
            patientId,
            status: { in: ["SCHEDULED", "CONFIRMED"] },
            appointmentDate: { gte: new Date() },
          },
          orderBy: { appointmentDate: "asc" },
        }),
      ]);

      // Get treatment statistics
      const treatments = await prisma.treatment.findMany({
        where: { patientId },
        select: {
          totalCost: true,
          paidAmount: true,
          paymentStatus: true,
        },
      });

      const totalSpent = treatments.reduce(
        (sum, t) => sum + t.paidAmount,
        0
      );
      const balanceDue = treatments.reduce(
        (sum, t) => sum + (t.totalCost - t.paidAmount),
        0
      );

      return {
        patient,
        totalAppointments,
        upcomingAppointments,
        completedAppointments,
        totalTreatments: treatments.length,
        totalSpent,
        balanceDue,
        lastVisit: patient.lastVisitAt || undefined,
        nextAppointment: nextAppointment?.appointmentDate || undefined,
      };
    } catch (error) {
      console.error("Error getting patient summary:", error);
      throw error;
    }
  }

  // Merge duplicate patient records
  static async mergePatientRecords(
    primaryPatientId: string,
    duplicatePatientId: string,
    mergedById: string
  ) {
    try {
      return await prisma.$transaction(async (tx) => {
        const [primaryPatient, duplicatePatient] = await Promise.all([
          tx.patient.findUnique({ where: { id: primaryPatientId } }),
          tx.patient.findUnique({
            where: { id: duplicatePatientId },
            include: {
              appointments: true,
              treatments: true,
            },
          }),
        ]);

        if (!primaryPatient || !duplicatePatient) {
          throw new Error("Unul dintre pacienți nu a fost găsit");
        }

        // Move all appointments to primary patient
        await tx.appointment.updateMany({
          where: { patientId: duplicatePatientId },
          data: { patientId: primaryPatientId },
        });

        // Move all treatments to primary patient
        await tx.treatment.updateMany({
          where: { patientId: duplicatePatientId },
          data: { patientId: primaryPatientId },
        });

        // Merge medical information if missing in primary
        const updateData: Prisma.PatientUpdateInput = {};
        
        if (!primaryPatient.medicalHistory && duplicatePatient.medicalHistory) {
          updateData.medicalHistory = duplicatePatient.medicalHistory;
        }

        if (duplicatePatient.allergies.length > 0) {
          const mergedAllergies = [
            ...new Set([...primaryPatient.allergies, ...duplicatePatient.allergies]),
          ];
          updateData.allergies = mergedAllergies;
        }

        if (duplicatePatient.medications.length > 0) {
          const mergedMedications = [
            ...new Set([...primaryPatient.medications, ...duplicatePatient.medications]),
          ];
          updateData.medications = mergedMedications;
        }

        // Update primary patient with merged data
        const updatedPatient = await tx.patient.update({
          where: { id: primaryPatientId },
          data: updateData,
        });

        // Delete duplicate patient
        await tx.patient.delete({
          where: { id: duplicatePatientId },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: mergedById,
            action: "PATIENTS_MERGED",
            entityType: "Patient",
            entityId: primaryPatientId,
            oldData: {
              primaryPatient,
              duplicatePatient,
            } as any,
            newData: updatedPatient as any,
          },
        });

        return updatedPatient;
      });
    } catch (error) {
      console.error("Error merging patients:", error);
      throw error;
    }
  }

  // Bulk import patients
  static async importPatients(
    patients: CreatePatientInput[],
    createdById: string
  ) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as { index: number; patient: any; error: string }[],
    };

    for (let i = 0; i < patients.length; i++) {
      try {
        await this.createPatient({ ...patients[i], createdById });
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          index: i,
          patient: patients[i],
          error: error.message,
        });
      }
    }

    // Create audit log for bulk import
    await prisma.auditLog.create({
      data: {
        userId: createdById,
        action: "PATIENTS_BULK_IMPORT",
        entityType: "Patient",
        newData: results as any,
      },
    });

    return results;
  }
}