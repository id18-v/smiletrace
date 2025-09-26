// src/services/receipt-qr.service.ts
import prisma from '@/lib/db';
import {
  generateReceiptVerificationQR,
  generateReceiptDataQR,
  generateAppointmentBookingQR
} from '@/lib/qr';

export class ReceiptQRService {
  /**
   * Generate QR code for a receipt and update the database
   * @param receiptId Receipt ID
   * @returns Promise<string> QR code URL
   */
  static async generateAndSaveReceiptQR(receiptId: string): Promise<string> {
    try {
      // Get receipt with related data
      const receipt = await prisma.receipt.findUnique({
        where: { id: receiptId },
        include: {
          treatment: {
            include: {
              patient: true
            }
          }
        }
      });

      if (!receipt) {
        throw new Error('Receipt not found');
      }

      if (!receipt.treatment?.patient) {
        throw new Error('Receipt patient information not found');
      }

      // Generate comprehensive receipt data QR
      const receiptDataQR = await generateReceiptDataQR({
        receiptId: receipt.id,
        receiptNumber: receipt.receiptNumber,
        patientName: `${receipt.treatment.patient.firstName} ${receipt.treatment.patient.lastName}`,
        totalAmount: receipt.totalAmount,
        date: receipt.createdAt.toISOString(),
        clinicName: 'Dental Clinic' // You can get this from clinic settings
      });

      // Update receipt with QR code
      await prisma.receipt.update({
        where: { id: receiptId },
        data: { qrCode: receiptDataQR }
      });

      return receiptDataQR;

    } catch (error) {
      console.error('Error generating receipt QR:', error);
      throw new Error('Failed to generate receipt QR code');
    }
  }

  /**
   * Generate verification QR code for a receipt
   * @param receiptId Receipt ID
   * @returns Promise<string> Verification QR code URL
   */
  static async generateVerificationQR(receiptId: string): Promise<string> {
    try {
      const receipt = await prisma.receipt.findUnique({
        where: { id: receiptId },
        select: {
          id: true,
          receiptNumber: true
        }
      });

      if (!receipt) {
        throw new Error('Receipt not found');
      }

      return await generateReceiptVerificationQR(receipt.id, receipt.receiptNumber);

    } catch (error) {
      console.error('Error generating verification QR:', error);
      throw new Error('Failed to generate verification QR code');
    }
  }

  /**
   * Generate appointment booking QR for receipt patient
   * @param receiptId Receipt ID
   * @returns Promise<string> Appointment booking QR code URL
   */
  static async generateAppointmentQRForReceipt(receiptId: string): Promise<string> {
    try {
      const receipt = await prisma.receipt.findUnique({
        where: { id: receiptId },
        include: {
          treatment: {
            include: {
              patient: true
            }
          }
        }
      });

      if (!receipt?.treatment?.patient) {
        throw new Error('Receipt or patient not found');
      }

      return await generateAppointmentBookingQR(receipt.treatment.patient.id);

    } catch (error) {
      console.error('Error generating appointment QR:', error);
      throw new Error('Failed to generate appointment QR code');
    }
  }

  /**
   * Get receipt QR code (generate if not exists)
   * @param receiptId Receipt ID
   * @returns Promise<string> QR code URL
   */
  static async getReceiptQR(receiptId: string): Promise<string> {
    try {
      const receipt = await prisma.receipt.findUnique({
        where: { id: receiptId },
        select: {
          id: true,
          qrCode: true
        }
      });

      if (!receipt) {
        throw new Error('Receipt not found');
      }

      // Return existing QR code if available
      if (receipt.qrCode) {
        return receipt.qrCode;
      }

      // Generate new QR code
      return await this.generateAndSaveReceiptQR(receiptId);

    } catch (error) {
      console.error('Error getting receipt QR:', error);
      throw new Error('Failed to get receipt QR code');
    }
  }

  /**
   * Generate multiple QR codes for a receipt
   * @param receiptId Receipt ID
   * @returns Promise<object> Multiple QR code URLs
   */
  static async generateMultipleQRCodesForReceipt(receiptId: string): Promise<{
    receiptDataQR: string;
    verificationQR: string;
    appointmentBookingQR: string;
  }> {
    try {
      const [receiptDataQR, verificationQR, appointmentBookingQR] = await Promise.all([
        this.generateAndSaveReceiptQR(receiptId),
        this.generateVerificationQR(receiptId),
        this.generateAppointmentQRForReceipt(receiptId)
      ]);

      return {
        receiptDataQR,
        verificationQR,
        appointmentBookingQR
      };

    } catch (error) {
      console.error('Error generating multiple QR codes:', error);
      throw new Error('Failed to generate multiple QR codes');
    }
  }

  /**
   * Update receipt QR code in database
   * @param receiptId Receipt ID
   * @param qrCodeUrl QR code URL
   * @returns Promise<void>
   */
  static async updateReceiptQR(receiptId: string, qrCodeUrl: string): Promise<void> {
    try {
      await prisma.receipt.update({
        where: { id: receiptId },
        data: { qrCode: qrCodeUrl }
      });
    } catch (error) {
      console.error('Error updating receipt QR:', error);
      throw new Error('Failed to update receipt QR code');
    }
  }

  /**
   * Generate QR codes for all receipts without QR codes
   * @param limit Maximum number of receipts to process
   * @returns Promise<number> Number of QR codes generated
   */
  static async generateMissingQRCodes(limit: number = 100): Promise<number> {
    try {
      // Get receipts without QR codes
      const receipts = await prisma.receipt.findMany({
        where: {
          qrCode: null
        },
        take: limit,
        select: {
          id: true
        }
      });

      let generated = 0;

      for (const receipt of receipts) {
        try {
          await this.generateAndSaveReceiptQR(receipt.id);
          generated++;
        } catch (error) {
          console.error(`Failed to generate QR for receipt ${receipt.id}:`, error);
        }
      }

      return generated;

    } catch (error) {
      console.error('Error generating missing QR codes:', error);
      throw new Error('Failed to generate missing QR codes');
    }
  }
}