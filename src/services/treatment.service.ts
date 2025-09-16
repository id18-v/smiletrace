// src/services/treatment.service.ts

import { z } from 'zod';
import { Prisma, PaymentStatus, PaymentMethod } from '@prisma/client';
import  prisma  from '@/lib/db';
// Initialize Prisma client

// Validation schemas
const CreateTreatmentSchema = z.object({
  patientId: z.string().cuid(),
  dentistId: z.string().cuid(),
  chiefComplaint: z.string().min(1),
  diagnosis: z.string().min(1),
  treatmentPlan: z.string().min(1),
  notes: z.string().optional(),
  treatmentDate: z.date().optional(),
  discount: z.number().min(0).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
});

const AddProcedureToToothSchema = z.object({
  treatmentId: z.string().cuid(),
  procedureId: z.string().cuid(),
  toothNumbers: z.array(z.number().min(1).max(32)),
  toothSurfaces: z.array(z.string()).optional(),
  quantity: z.number().min(1).optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
});

const UpdateTreatmentPaymentSchema = z.object({
  treatmentId: z.string().cuid(),
  paidAmount: z.number().min(0),
  paymentMethod: z.nativeEnum(PaymentMethod),
  transactionId: z.string().optional(),
});

// Types
export type CreateTreatmentInput = z.infer<typeof CreateTreatmentSchema>;
export type AddProcedureToToothInput = z.infer<typeof AddProcedureToToothSchema>;
export type UpdateTreatmentPaymentInput = z.infer<typeof UpdateTreatmentPaymentSchema>;

export interface TreatmentHistoryFilters {
  patientId?: string;
  dentistId?: string;
  startDate?: Date;
  endDate?: Date;
  paymentStatus?: PaymentStatus;
  limit?: number;
  offset?: number;
}

export interface ToothChartData {
  toothNumber: number;
  procedures: {
    id: string;
    name: string;
    category: string;
    date: Date;
    status: string;
    surfaces?: string[];
  }[];
}

class TreatmentService {
  /**
   * Create a new treatment session for a patient
   */
  async createTreatment(data: CreateTreatmentInput) {
    try {
      // Validate input
      const validatedData = CreateTreatmentSchema.parse(data);

      // Verify patient exists and is active
      const patient = await prisma.patient.findUnique({
        where: { id: validatedData.patientId },
        select: { id: true, isActive: true, firstName: true, lastName: true },
      });

      if (!patient) {
        throw new Error('Patient not found');
      }

      if (!patient.isActive) {
        throw new Error('Patient account is inactive');
      }

      // Verify dentist exists and is active
      const dentist = await prisma.user.findUnique({
        where: { id: validatedData.dentistId },
        select: { id: true, isActive: true, role: true },
      });

      if (!dentist) {
        throw new Error('Dentist not found');
      }

      if (!dentist.isActive) {
        throw new Error('Dentist account is inactive');
      }

      if (dentist.role !== 'DENTIST' && dentist.role !== 'ADMIN') {
        throw new Error('User does not have dentist privileges');
      }

      // Create treatment with initial cost of 0
      const treatment = await prisma.treatment.create({
        data: {
          patientId: validatedData.patientId,
          dentistId: validatedData.dentistId,
          chiefComplaint: validatedData.chiefComplaint,
          diagnosis: validatedData.diagnosis,
          treatmentPlan: validatedData.treatmentPlan,
          notes: validatedData.notes,
          treatmentDate: validatedData.treatmentDate || new Date(),
          totalCost: 0,
          paidAmount: 0,
          discount: validatedData.discount || 0,
          paymentStatus: 'PENDING',
          paymentMethod: validatedData.paymentMethod,
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          dentist: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: true,
        },
      });

      // Log audit
      await this.createAuditLog({
        userId: validatedData.dentistId,
        action: 'CREATE_TREATMENT',
        entityType: 'Treatment',
        entityId: treatment.id,
        newData: treatment,
      });

      return treatment;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.issues.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Add a procedure to specific teeth in a treatment
   */
  async addProcedureToTooth(data: AddProcedureToToothInput) {
    try {
      // Validate input
      const validatedData = AddProcedureToToothSchema.parse(data);

      // Verify treatment exists
      const treatment = await prisma.treatment.findUnique({
        where: { id: validatedData.treatmentId },
        select: { id: true, totalCost: true, discount: true },
      });

      if (!treatment) {
        throw new Error('Treatment not found');
      }

      // Verify procedure exists and is active
      const procedure = await prisma.procedure.findUnique({
        where: { id: validatedData.procedureId },
        select: {
          id: true,
          name: true,
          defaultCost: true,
          insuranceCost: true,
          isActive: true,
          category: true,
        },
      });

      if (!procedure) {
        throw new Error('Procedure not found');
      }

      if (!procedure.isActive) {
        throw new Error('Procedure is not active');
      }

      // Validate tooth numbers (1-32 for permanent teeth)
      const invalidTeeth = validatedData.toothNumbers.filter(
        tooth => tooth < 1 || tooth > 32
      );
      if (invalidTeeth.length > 0) {
        throw new Error(`Invalid tooth numbers: ${invalidTeeth.join(', ')}`);
      }

      // Calculate costs
      const quantity = validatedData.quantity || 1;
      const unitCost = procedure.defaultCost;
      const totalCost = unitCost * quantity * validatedData.toothNumbers.length;

      // Create treatment item
      const treatmentItem = await prisma.treatmentItem.create({
        data: {
          treatmentId: validatedData.treatmentId,
          procedureId: validatedData.procedureId,
          toothNumbers: validatedData.toothNumbers,
          toothSurfaces: validatedData.toothSurfaces || [],
          quantity,
          unitCost,
          totalCost,
          status: validatedData.status || 'PLANNED',
          notes: validatedData.notes,
        },
        include: {
          procedure: {
            select: {
              id: true,
              code: true,
              name: true,
              category: true,
            },
          },
        },
      });

      // Update treatment total cost
      await this.recalculateTreatmentCost(validatedData.treatmentId);

      // Log audit
      await this.createAuditLog({
        action: 'ADD_PROCEDURE_TO_TREATMENT',
        entityType: 'TreatmentItem',
        entityId: treatmentItem.id,
        newData: {
          treatmentId: validatedData.treatmentId,
          procedure: procedure.name,
          teeth: validatedData.toothNumbers,
          cost: totalCost,
        },
      });

      return treatmentItem;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.issues.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Calculate or recalculate treatment cost based on procedures
   */
  async calculateTreatmentCost(treatmentId: string): Promise<number> {
    try {
      // Get all treatment items
      const treatmentItems = await prisma.treatmentItem.findMany({
        where: { treatmentId },
        select: { totalCost: true },
      });

      // Calculate total cost
      const totalCost = treatmentItems.reduce((sum, item) => sum + item.totalCost, 0);

      // Get treatment discount
      const treatment = await prisma.treatment.findUnique({
        where: { id: treatmentId },
        select: { discount: true },
      });

      if (!treatment) {
        throw new Error('Treatment not found');
      }

      // Apply discount
      const finalCost = totalCost - (treatment.discount || 0);

      // Update treatment with new cost
      await prisma.treatment.update({
        where: { id: treatmentId },
        data: { totalCost: finalCost },
      });

      return finalCost;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get patient treatment history with filters
   */
  async getTreatmentHistory(filters: TreatmentHistoryFilters) {
    try {
      // Build where clause
      const where: Prisma.TreatmentWhereInput = {};

      if (filters.patientId) {
        where.patientId = filters.patientId;
      }

      if (filters.dentistId) {
        where.dentistId = filters.dentistId;
      }

      if (filters.startDate || filters.endDate) {
        where.treatmentDate = {};
        if (filters.startDate) {
          where.treatmentDate.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.treatmentDate.lte = filters.endDate;
        }
      }

      if (filters.paymentStatus) {
        where.paymentStatus = filters.paymentStatus;
      }

      // Get treatments with pagination
      const [treatments, totalCount] = await Promise.all([
        prisma.treatment.findMany({
          where,
          skip: filters.offset || 0,
          take: filters.limit || 20,
          orderBy: { treatmentDate: 'desc' },
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
            dentist: {
              select: {
                id: true,
                name: true,
                email: true,
                specialization: true,
              },
            },
            items: {
              include: {
                procedure: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                    category: true,
                  },
                },
              },
            },
            receipt: {
              select: {
                id: true,
                receiptNumber: true,
                totalAmount: true,
                paidAmount: true,
                balanceDue: true,
                status: true,
              },
            },
          },
        }),
        prisma.treatment.count({ where }),
      ]);

      // Calculate summary statistics
      const stats = await this.calculateTreatmentStats(where);

      return {
        treatments,
        totalCount,
        stats,
        pagination: {
          offset: filters.offset || 0,
          limit: filters.limit || 20,
          hasMore: totalCount > (filters.offset || 0) + (filters.limit || 20),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get tooth chart data for a patient
   */
  async getToothChartData(patientId: string): Promise<ToothChartData[]> {
    try {
      // Get all treatments for the patient
      const treatments = await prisma.treatment.findMany({
        where: { patientId },
        include: {
          items: {
            include: {
              procedure: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                },
              },
            },
          },
        },
        orderBy: { treatmentDate: 'desc' },
      });

      // Build tooth chart data
      const toothMap = new Map<number, ToothChartData>();

      for (const treatment of treatments) {
        for (const item of treatment.items) {
          for (const toothNumber of item.toothNumbers) {
            if (!toothMap.has(toothNumber)) {
              toothMap.set(toothNumber, {
                toothNumber,
                procedures: [],
              });
            }

            const toothData = toothMap.get(toothNumber)!;
            toothData.procedures.push({
              id: item.id,
              name: item.procedure.name,
              category: item.procedure.category,
              date: treatment.treatmentDate,
              status: item.status,
              surfaces: item.toothSurfaces,
            });
          }
        }
      }

      // Convert map to array and sort by tooth number
      return Array.from(toothMap.values()).sort((a, b) => a.toothNumber - b.toothNumber);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update treatment payment information
   */
  async updateTreatmentPayment(data: UpdateTreatmentPaymentInput) {
    try {
      // Validate input
      const validatedData = UpdateTreatmentPaymentSchema.parse(data);

      // Get current treatment
      const treatment = await prisma.treatment.findUnique({
        where: { id: validatedData.treatmentId },
        select: {
          id: true,
          totalCost: true,
          paidAmount: true,
          discount: true,
        },
      });

      if (!treatment) {
        throw new Error('Treatment not found');
      }

      // Calculate new paid amount and payment status
      const newPaidAmount = treatment.paidAmount + validatedData.paidAmount;
      const finalCost = treatment.totalCost;

      let paymentStatus: PaymentStatus;
      if (newPaidAmount >= finalCost) {
        paymentStatus = 'PAID';
      } else if (newPaidAmount > 0) {
        paymentStatus = 'PARTIAL';
      } else {
        paymentStatus = 'PENDING';
      }

      // Update treatment
      const updatedTreatment = await prisma.treatment.update({
        where: { id: validatedData.treatmentId },
        data: {
          paidAmount: newPaidAmount,
          paymentStatus,
          paymentMethod: validatedData.paymentMethod,
        },
      });

      // Log audit
      await this.createAuditLog({
        action: 'UPDATE_TREATMENT_PAYMENT',
        entityType: 'Treatment',
        entityId: validatedData.treatmentId,
        oldData: { paidAmount: treatment.paidAmount },
        newData: { paidAmount: newPaidAmount, paymentStatus },
      });

      return updatedTreatment;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.issues.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Helper: Recalculate treatment cost
   */
  private async recalculateTreatmentCost(treatmentId: string) {
    const items = await prisma.treatmentItem.findMany({
      where: { treatmentId },
      select: { totalCost: true },
    });

    const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0);

    const treatment = await prisma.treatment.findUnique({
      where: { id: treatmentId },
      select: { discount: true, paidAmount: true },
    });

    if (!treatment) return;

    const finalCost = totalCost - (treatment.discount || 0);

    // Update payment status based on paid amount
    let paymentStatus: PaymentStatus;
    if (treatment.paidAmount >= finalCost) {
      paymentStatus = 'PAID';
    } else if (treatment.paidAmount > 0) {
      paymentStatus = 'PARTIAL';
    } else {
      paymentStatus = 'PENDING';
    }

    await prisma.treatment.update({
      where: { id: treatmentId },
      data: { 
        totalCost: finalCost,
        paymentStatus,
      },
    });
  }

  /**
   * Helper: Calculate treatment statistics
   */
  private async calculateTreatmentStats(where: Prisma.TreatmentWhereInput) {
    const treatments = await prisma.treatment.findMany({
      where,
      select: {
        totalCost: true,
        paidAmount: true,
        discount: true,
        paymentStatus: true,
      },
    });

    const stats = {
      totalTreatments: treatments.length,
      totalRevenue: treatments.reduce((sum, t) => sum + t.paidAmount, 0),
      totalOutstanding: treatments.reduce((sum, t) => sum + (t.totalCost - t.paidAmount), 0),
      totalDiscounts: treatments.reduce((sum, t) => sum + t.discount, 0),
      paymentStatusBreakdown: {
        paid: treatments.filter(t => t.paymentStatus === 'PAID').length,
        partial: treatments.filter(t => t.paymentStatus === 'PARTIAL').length,
        pending: treatments.filter(t => t.paymentStatus === 'PENDING').length,
        refunded: treatments.filter(t => t.paymentStatus === 'REFUNDED').length,
        cancelled: treatments.filter(t => t.paymentStatus === 'CANCELLED').length,
      },
    };

    return stats;
  }

  /**
   * Helper: Create audit log
   */
  private async createAuditLog(data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldData?: any;
    newData?: any;
  }) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          oldData: data.oldData,
          newData: data.newData,
        },
      });
    } catch (error) {
      // Log error but don't throw - audit logging shouldn't break main flow
      console.error('Failed to create audit log:', error);
    }
  }

  /**
   * Delete a treatment item
   */
  async deleteTreatmentItem(itemId: string, userId: string) {
    try {
      const item = await prisma.treatmentItem.findUnique({
        where: { id: itemId },
        select: { treatmentId: true, totalCost: true },
      });

      if (!item) {
        throw new Error('Treatment item not found');
      }

      // Delete the item
      await prisma.treatmentItem.delete({
        where: { id: itemId },
      });

      // Recalculate treatment cost
      await this.recalculateTreatmentCost(item.treatmentId);

      // Log audit
      await this.createAuditLog({
        userId,
        action: 'DELETE_TREATMENT_ITEM',
        entityType: 'TreatmentItem',
        entityId: itemId,
        oldData: item,
      });

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update treatment item status
   */
  async updateTreatmentItemStatus(itemId: string, status: string, userId: string) {
    try {
      const item = await prisma.treatmentItem.findUnique({
        where: { id: itemId },
        select: { id: true, status: true },
      });

      if (!item) {
        throw new Error('Treatment item not found');
      }

      const updatedItem = await prisma.treatmentItem.update({
        where: { id: itemId },
        data: { status },
      });

      // Log audit
      await this.createAuditLog({
        userId,
        action: 'UPDATE_TREATMENT_ITEM_STATUS',
        entityType: 'TreatmentItem',
        entityId: itemId,
        oldData: { status: item.status },
        newData: { status },
      });

      return updatedItem;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const treatmentService = new TreatmentService();

// Export for testing
export default TreatmentService;



/*  // Create a treatment
const treatment = await treatmentService.createTreatment({
  patientId: "patient123",
  dentistId: "dentist456",
  chiefComplaint: "Tooth pain",
  diagnosis: "Cavity in tooth #14",
  treatmentPlan: "Filling required",
  treatmentDate: new Date()
});

// Add procedure to specific teeth
await treatmentService.addProcedureToTooth({
  treatmentId: treatment.id,
  procedureId: "proc789",
  toothNumbers: [14],
  toothSurfaces: ["O"], // Occlusal surface
  quantity: 1,
  status: "COMPLETED"
});

// Get patient history
const history = await treatmentService.getTreatmentHistory({
  patientId: "patient123",
  limit: 10
});        */