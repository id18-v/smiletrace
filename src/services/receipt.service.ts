// Simple version with minimal typing to avoid errors
import { generateQRCode } from '../lib/qr';
import prisma from '../lib/db';

// Use any for Prisma types to avoid import issues
export interface ReceiptGenerationData {
  treatmentId: string;
  issuedById: string;
  paymentMethod?: any;
  paymentDate?: Date;
  transactionId?: string;
  emailAddress?: string;
  customDiscount?: number;
  discountCode?: string;
  taxRate?: number;
}

export interface PaymentProcessingData {
  receiptId: string;
  paymentMethod: any;
  paidAmount: number;
  transactionId?: string;
  paymentDate?: Date;
}

export interface ReceiptTotals {
  subtotal: number;
  discount: number;
  discountCodeApplied?: string;
  discountCodeValue?: number;
  tax: number;
  totalAmount: number;
  balanceDue: number;
}

/**
 * Receipt Service for handling payment processing and receipt generation
 */
export class ReceiptService {
  
  // Discount codes configuration
  private readonly DISCOUNT_CODES: any = {
    'UTMBEST': {
      percentage: 0.20, // 20% discount
      description: 'UTM Best Student Discount',
      isActive: true
    }
  };

  /**
   * Validate and apply discount code
   */
  private validateDiscountCode(discountCode: string, subtotal: number) {
    const code = discountCode.toUpperCase().trim();
    const discountConfig = this.DISCOUNT_CODES[code];
    
    if (!discountConfig || !discountConfig.isActive) {
      throw new Error(`Invalid or inactive discount code: ${discountCode}`);
    }
    
    const discountAmount = subtotal * discountConfig.percentage;
    
    return {
      code,
      percentage: discountConfig.percentage,
      amount: Math.round(discountAmount * 100) / 100,
      description: discountConfig.description
    };
  }
  
  /**
   * Generate a new receipt from a treatment record
   */
  async generateReceipt(data: ReceiptGenerationData) {
    try {
      // Get treatment with all related data
      const treatment = await prisma.treatment.findUnique({
        where: { id: data.treatmentId },
        include: {
          patient: true,
          dentist: true,
          items: {
            include: {
              procedure: true
            }
          }
        }
      });

      if (!treatment) {
        throw new Error('Treatment not found');
      }

      // Check if receipt already exists
      const existingReceipt = await prisma.receipt.findUnique({
        where: { treatmentId: data.treatmentId }
      });

      if (existingReceipt) {
        throw new Error('Receipt already exists for this treatment');
      }

      // Calculate totals
      const totals = await this.calculateTotals({
        treatmentTotalCost: treatment.totalCost,
        treatmentDiscount: treatment.discount,
        customDiscount: data.customDiscount,
        discountCode: data.discountCode,
        taxRate: data.taxRate
      });

      // Generate unique receipt number
      const receiptNumber = await this.generateReceiptNumber();

      // Generate QR code for appointment booking
      const qrCodeData = `${process.env.NEXTAUTH_URL}/appointments/book?patient=${treatment.patientId}`;
      const qrCode = await generateQRCode(qrCodeData);

      // Create receipt record
      const receipt = await prisma.receipt.create({
        data: {
          treatmentId: data.treatmentId,
          issuedById: data.issuedById,
          receiptNumber,
          subtotal: totals.subtotal,
          discount: totals.discount,
          tax: totals.tax,
          totalAmount: totals.totalAmount,
          paidAmount: treatment.paidAmount,
          balanceDue: totals.balanceDue,
          paymentMethod: data.paymentMethod,
          paymentDate: data.paymentDate,
          transactionId: data.transactionId,
          qrCode,
          emailAddress: data.emailAddress || treatment.patient.email,
          status: totals.balanceDue > 0 ? 'PARTIAL' : 'PAID'
        },
        include: {
          treatment: {
            include: {
              patient: true,
              dentist: true,
              items: {
                include: {
                  procedure: true
                }
              }
            }
          },
          issuedBy: true
        }
      });

      // Update treatment payment status
      let paymentStatus = 'PENDING';
      if (treatment.paidAmount >= totals.totalAmount) {
        paymentStatus = 'PAID';
      } else if (treatment.paidAmount > 0) {
        paymentStatus = 'PARTIAL';
      }

      await prisma.treatment.update({
        where: { id: data.treatmentId },
        data: {
          paymentStatus: paymentStatus as any,
          paymentMethod: data.paymentMethod
        }
      });

      return receipt;

    } catch (error) {
      console.error('Error generating receipt:', error);
      throw error;
    }
  }

  /**
   * Calculate receipt totals
   */
  async calculateTotals(params: {
    treatmentTotalCost: number;
    treatmentDiscount?: number;
    customDiscount?: number;
    discountCode?: string;
    taxRate?: number;
  }): Promise<ReceiptTotals> {
    try {
      const { treatmentTotalCost, treatmentDiscount = 0, customDiscount = 0, discountCode, taxRate = 0.08 } = params;

      const subtotal = treatmentTotalCost;
      let totalDiscount = treatmentDiscount + customDiscount;
      let discountCodeInfo = null;

      // Apply discount code if provided
      if (discountCode) {
        try {
          discountCodeInfo = this.validateDiscountCode(discountCode, subtotal);
          totalDiscount += discountCodeInfo.amount;
        } catch (error) {
          console.warn('Invalid discount code:', discountCode);
        }
      }

      const discountedAmount = Math.max(0, subtotal - totalDiscount);
      const tax = discountedAmount * taxRate;
      const totalAmount = discountedAmount + tax;
      
      return {
        subtotal: Math.round(subtotal * 100) / 100,
        discount: Math.round(totalDiscount * 100) / 100,
        discountCodeApplied: discountCodeInfo?.code,
        discountCodeValue: discountCodeInfo?.amount,
        tax: Math.round(tax * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        balanceDue: Math.round(totalAmount * 100) / 100
      };

    } catch (error) {
      console.error('Error calculating totals:', error);
      throw error;
    }
  }

  /**
   * Generate unique receipt number
   */
  async generateReceiptNumber(): Promise<string> {
    try {
      const clinicSettings = await prisma.clinicSettings.findFirst();
      const prefix = clinicSettings?.receiptPrefix || 'RCP';

      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');

      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const latestReceipt = await prisma.receipt.findFirst({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      let sequenceNumber = 1;
      if (latestReceipt) {
        const lastReceiptNumber = latestReceipt.receiptNumber;
        const lastSequence = lastReceiptNumber.split('-').pop();
        if (lastSequence) {
          sequenceNumber = parseInt(lastSequence) + 1;
        }
      }

      const receiptNumber = `${prefix}-${year}${month}-${sequenceNumber.toString().padStart(3, '0')}`;

      const existing = await prisma.receipt.findUnique({
        where: { receiptNumber }
      });

      if (existing) {
        const timestamp = Date.now().toString().slice(-4);
        return `${receiptNumber}-${timestamp}`;
      }

      return receiptNumber;

    } catch (error) {
      console.error('Error generating receipt number:', error);
      return `RCP-${Date.now()}`;
    }
  }

  /**
   * Process payment
   */
  async processPayment(data: PaymentProcessingData) {
    try {
      const receipt = await prisma.receipt.findUnique({
        where: { id: data.receiptId },
        include: { treatment: true }
      });

      if (!receipt) {
        throw new Error('Receipt not found');
      }

      if (data.paidAmount <= 0) {
        throw new Error('Payment amount must be greater than 0');
      }

      if (data.paidAmount > receipt.balanceDue) {
        throw new Error('Payment amount cannot exceed balance due');
      }

      const newPaidAmount = receipt.paidAmount + data.paidAmount;
      const newBalanceDue = receipt.totalAmount - newPaidAmount;
      const newStatus = newBalanceDue <= 0 ? 'PAID' : 'PARTIAL';

      // Simple transaction without complex typing
      const updatedReceipt = await prisma.$transaction(async (tx: any) => {
        const updated = await tx.receipt.update({
          where: { id: data.receiptId },
          data: {
            paidAmount: newPaidAmount,
            balanceDue: Math.max(0, newBalanceDue),
            paymentMethod: data.paymentMethod,
            paymentDate: data.paymentDate || new Date(),
            transactionId: data.transactionId,
            status: newStatus
          },
          include: {
            treatment: {
              include: {
                patient: true,
                dentist: true,
                items: { include: { procedure: true } }
              }
            },
            issuedBy: true
          }
        });

        let treatmentPaymentStatus = 'PENDING';
        if (newPaidAmount >= receipt.totalAmount) {
          treatmentPaymentStatus = 'PAID';
        } else if (newPaidAmount > 0) {
          treatmentPaymentStatus = 'PARTIAL';
        }

        await tx.treatment.update({
          where: { id: receipt.treatmentId },
          data: {
            paidAmount: newPaidAmount,
            paymentStatus: treatmentPaymentStatus as any,
            paymentMethod: data.paymentMethod
          }
        });

        return updated;
      });

      return updatedReceipt;

    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Get receipt by ID
   */
  async getReceiptById(receiptId: string) {
    try {
      const receipt = await prisma.receipt.findUnique({
        where: { id: receiptId },
        include: {
          treatment: {
            include: {
              patient: true,
              dentist: true,
              items: { include: { procedure: true } }
            }
          },
          issuedBy: true
        }
      });

      if (!receipt) {
        throw new Error('Receipt not found');
      }

      return receipt;

    } catch (error) {
      console.error('Error getting receipt:', error);
      throw error;
    }
  }

  /**
   * Validate discount code publicly
   */
  async validateDiscountCodePublic(discountCode: string, subtotal: number) {
    try {
      return this.validateDiscountCode(discountCode, subtotal);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get available discount codes
   */
  getAvailableDiscountCodes() {
    return Object.entries(this.DISCOUNT_CODES).map(([code, config]: [string, any]) => ({
      code,
      percentage: config.percentage,
      description: config.description,
      isActive: config.isActive,
      discountText: `${(config.percentage * 100).toFixed(0)}% off`
    }));
  }
}

// Export singleton instance
export const receiptService = new ReceiptService();