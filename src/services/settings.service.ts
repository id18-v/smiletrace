import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Types for better type safety
export interface ClinicSettingsData {
  clinicName: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  licenseNumber?: string;
  workingHours?: WorkingHours;
  appointmentDuration?: number;
  appointmentBuffer?: number;
  reminderEnabled?: boolean;
  reminderAdvanceHours?: number;
  receiptPrefix?: string;
  receiptFooter?: string;
}

export interface WorkingHours {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DaySchedule {
  isWorking: boolean;
  openTime?: string; // Format: "09:00"
  closeTime?: string; // Format: "17:00"
  breakStart?: string; // Format: "12:00"
  breakEnd?: string; // Format: "13:00"
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

export interface EmailTemplates {
  appointmentConfirmation?: EmailTemplate;
  appointmentReminder?: EmailTemplate;
  appointmentCancellation?: EmailTemplate;
  treatmentComplete?: EmailTemplate;
  paymentReceived?: EmailTemplate;
  receiptGenerated?: EmailTemplate;
}

export class SettingsService {
  /**
   * Retrieve all clinic settings
   */
  async getClinicSettings(): Promise<ClinicSettingsData | null> {
    try {
      const settings = await prisma.clinicSettings.findFirst({
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (!settings) {
        return null;
      }

      return {
        clinicName: settings.clinicName,
        address: settings.address || undefined,
        city: settings.city || undefined,
        state: settings.state || undefined,
        zipCode: settings.zipCode || undefined,
        country: settings.country || undefined,
        phone: settings.phone || undefined,
        email: settings.email || undefined,
        website: settings.website || undefined,
        taxId: settings.taxId || undefined,
        licenseNumber: settings.licenseNumber || undefined,
        workingHours: settings.workingHours as WorkingHours || undefined,
        appointmentDuration: settings.appointmentDuration,
        appointmentBuffer: settings.appointmentBuffer,
        reminderEnabled: settings.reminderEnabled,
        reminderAdvanceHours: settings.reminderAdvanceHours,
        receiptPrefix: settings.receiptPrefix,
        receiptFooter: settings.receiptFooter || undefined
      };
    } catch (error) {
      console.error('Error retrieving clinic settings:', error);
      throw new Error('Failed to retrieve clinic settings');
    }
  }

  /**
   * Update clinic settings (creates new if none exist)
   */
  async updateClinicSettings(data: ClinicSettingsData): Promise<ClinicSettingsData> {
    try {
      // Check if settings exist
      const existingSettings = await prisma.clinicSettings.findFirst();

      const settingsData = {
        clinicName: data.clinicName,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zipCode: data.zipCode || null,
        country: data.country || 'USA',
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        taxId: data.taxId || null,
        licenseNumber: data.licenseNumber || null,
        workingHours: (data.workingHours as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        appointmentDuration: data.appointmentDuration || 30,
        appointmentBuffer: data.appointmentBuffer || 5,
        reminderEnabled: data.reminderEnabled ?? true,
        reminderAdvanceHours: data.reminderAdvanceHours || 24,
        receiptPrefix: data.receiptPrefix || 'RCP',
        receiptFooter: data.receiptFooter || null
      };

      let updatedSettings;

      if (existingSettings) {
        // Update existing settings
        updatedSettings = await prisma.clinicSettings.update({
          where: { id: existingSettings.id },
          data: settingsData
        });
      } else {
        // Create new settings
        updatedSettings = await prisma.clinicSettings.create({
          data: settingsData
        });
      }

      return {
        clinicName: updatedSettings.clinicName,
        address: updatedSettings.address || undefined,
        city: updatedSettings.city || undefined,
        state: updatedSettings.state || undefined,
        zipCode: updatedSettings.zipCode || undefined,
        country: updatedSettings.country || undefined,
        phone: updatedSettings.phone || undefined,
        email: updatedSettings.email || undefined,
        website: updatedSettings.website || undefined,
        taxId: updatedSettings.taxId || undefined,
        licenseNumber: updatedSettings.licenseNumber || undefined,
        workingHours: updatedSettings.workingHours as WorkingHours || undefined,
        appointmentDuration: updatedSettings.appointmentDuration,
        appointmentBuffer: updatedSettings.appointmentBuffer,
        reminderEnabled: updatedSettings.reminderEnabled,
        reminderAdvanceHours: updatedSettings.reminderAdvanceHours,
        receiptPrefix: updatedSettings.receiptPrefix,
        receiptFooter: updatedSettings.receiptFooter || undefined
      };
    } catch (error) {
      console.error('Error updating clinic settings:', error);
      throw new Error('Failed to update clinic settings');
    }
  }

  /**
   * Get working hours specifically
   */
  async getWorkingHours(): Promise<WorkingHours | null> {
    try {
      const settings = await prisma.clinicSettings.findFirst({
        select: {
          workingHours: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return settings?.workingHours as WorkingHours || null;
    } catch (error) {
      console.error('Error retrieving working hours:', error);
      throw new Error('Failed to retrieve working hours');
    }
  }

  /**
   * Update working hours specifically
   */
  async updateWorkingHours(workingHours: WorkingHours): Promise<WorkingHours> {
    try {
      const existingSettings = await prisma.clinicSettings.findFirst();

      if (!existingSettings) {
        throw new Error('Clinic settings not found. Please create clinic settings first.');
      }

      const updatedSettings = await prisma.clinicSettings.update({
        where: { id: existingSettings.id },
        data: {
          workingHours: workingHours as Prisma.InputJsonValue
        }
      });

      return updatedSettings.workingHours as WorkingHours;
    } catch (error) {
      console.error('Error updating working hours:', error);
      throw new Error('Failed to update working hours');
    }
  }

  /**
   * Get default email templates
   * Since email templates aren't in your schema, this provides a structure
   * for future email template management
   */
  async getEmailTemplates(): Promise<EmailTemplates> {
    // This is a placeholder implementation
    // You might want to store these in a separate table or configuration system
    const defaultTemplates: EmailTemplates = {
      appointmentConfirmation: {
        id: 'appointment_confirmation',
        name: 'Appointment Confirmation',
        subject: 'Appointment Confirmed - {{clinicName}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Appointment Confirmed</h2>
            <p>Dear {{patientName}},</p>
            <p>Your appointment has been confirmed for:</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Date:</strong> {{appointmentDate}}</p>
              <p><strong>Time:</strong> {{appointmentTime}}</p>
              <p><strong>Doctor:</strong> {{doctorName}}</p>
              <p><strong>Type:</strong> {{appointmentType}}</p>
            </div>
            <p>Please arrive 15 minutes early for your appointment.</p>
            <p>Best regards,<br>{{clinicName}}</p>
          </div>
        `,
        textContent: `Appointment Confirmed\n\nDear {{patientName}},\n\nYour appointment has been confirmed for:\nDate: {{appointmentDate}}\nTime: {{appointmentTime}}\nDoctor: {{doctorName}}\nType: {{appointmentType}}\n\nPlease arrive 15 minutes early for your appointment.\n\nBest regards,\n{{clinicName}}`,
        variables: ['patientName', 'appointmentDate', 'appointmentTime', 'doctorName', 'appointmentType', 'clinicName']
      },
      appointmentReminder: {
        id: 'appointment_reminder',
        name: 'Appointment Reminder',
        subject: 'Reminder: Upcoming Appointment - {{clinicName}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Appointment Reminder</h2>
            <p>Dear {{patientName}},</p>
            <p>This is a friendly reminder about your upcoming appointment:</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Date:</strong> {{appointmentDate}}</p>
              <p><strong>Time:</strong> {{appointmentTime}}</p>
              <p><strong>Doctor:</strong> {{doctorName}}</p>
              <p><strong>Type:</strong> {{appointmentType}}</p>
            </div>
            <p>Please arrive 15 minutes early. If you need to reschedule, please call us at {{clinicPhone}}.</p>
            <p>Best regards,<br>{{clinicName}}</p>
          </div>
        `,
        textContent: `Appointment Reminder\n\nDear {{patientName}},\n\nThis is a friendly reminder about your upcoming appointment:\nDate: {{appointmentDate}}\nTime: {{appointmentTime}}\nDoctor: {{doctorName}}\nType: {{appointmentType}}\n\nPlease arrive 15 minutes early. If you need to reschedule, please call us at {{clinicPhone}}.\n\nBest regards,\n{{clinicName}}`,
        variables: ['patientName', 'appointmentDate', 'appointmentTime', 'doctorName', 'appointmentType', 'clinicName', 'clinicPhone']
      },
      receiptGenerated: {
        id: 'receipt_generated',
        name: 'Receipt Generated',
        subject: 'Receipt for Your Treatment - {{receiptNumber}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Payment Receipt</h2>
            <p>Dear {{patientName}},</p>
            <p>Thank you for your payment. Please find your receipt details below:</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Receipt Number:</strong> {{receiptNumber}}</p>
              <p><strong>Date:</strong> {{paymentDate}}</p>
              <p><strong>Amount Paid:</strong> \${{paidAmount}}</p>
              <p><strong>Payment Method:</strong> {{paymentMethod}}</p>
              <p><strong>Treatment:</strong> {{treatmentDescription}}</p>
            </div>
            <p>Thank you for choosing our clinic!</p>
            <p>Best regards,<br>{{clinicName}}</p>
          </div>
        `,
        textContent: `Payment Receipt\n\nDear {{patientName}},\n\nThank you for your payment. Please find your receipt details below:\n\nReceipt Number: {{receiptNumber}}\nDate: {{paymentDate}}\nAmount Paid: \${{paidAmount}}\nPayment Method: {{paymentMethod}}\nTreatment: {{treatmentDescription}}\n\nThank you for choosing our clinic!\n\nBest regards,\n{{clinicName}}`,
        variables: ['patientName', 'receiptNumber', 'paymentDate', 'paidAmount', 'paymentMethod', 'treatmentDescription', 'clinicName']
      }
    };

    return defaultTemplates;
  }

  /**
   * Update email templates
   * This is a placeholder for future email template management
   */
  async updateEmailTemplates(templates: Partial<EmailTemplates>): Promise<EmailTemplates> {
    try {
      // In a real implementation, you might store these in the database
      // For now, this returns the updated templates
      const currentTemplates = await this.getEmailTemplates();
      
      const updatedTemplates = {
        ...currentTemplates,
        ...templates
      };

      // Here you would typically save to database
      // await this.saveEmailTemplatesToDatabase(updatedTemplates);

      return updatedTemplates;
    } catch (error) {
      console.error('Error updating email templates:', error);
      throw new Error('Failed to update email templates');
    }
  }

  /**
   * Get business hours for a specific day
   */
  getBusinessHoursForDay(workingHours: WorkingHours, day: string): DaySchedule | null {
    const dayKey = day.toLowerCase() as keyof WorkingHours;
    return workingHours[dayKey] || null;
  }

  /**
   * Check if clinic is open at a specific time
   */
  isClinicOpen(workingHours: WorkingHours, day: string, time: string): boolean {
    const daySchedule = this.getBusinessHoursForDay(workingHours, day);
    
    if (!daySchedule || !daySchedule.isWorking || !daySchedule.openTime || !daySchedule.closeTime) {
      return false;
    }

    const timeMinutes = this.timeToMinutes(time);
    const openMinutes = this.timeToMinutes(daySchedule.openTime);
    const closeMinutes = this.timeToMinutes(daySchedule.closeTime);

    // Check if during break time
    if (daySchedule.breakStart && daySchedule.breakEnd) {
      const breakStartMinutes = this.timeToMinutes(daySchedule.breakStart);
      const breakEndMinutes = this.timeToMinutes(daySchedule.breakEnd);
      
      if (timeMinutes >= breakStartMinutes && timeMinutes < breakEndMinutes) {
        return false;
      }
    }

    return timeMinutes >= openMinutes && timeMinutes < closeMinutes;
  }

  /**
   * Helper function to convert time string to minutes
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Validate working hours format
   */
  validateWorkingHours(workingHours: WorkingHours): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    for (const day of days) {
      const dayKey = day as keyof WorkingHours;
      const schedule = workingHours[dayKey];

      if (schedule && schedule.isWorking) {
        if (!schedule.openTime || !schedule.closeTime) {
          errors.push(`${day}: Open and close times are required when working`);
        } else {
          const openMinutes = this.timeToMinutes(schedule.openTime);
          const closeMinutes = this.timeToMinutes(schedule.closeTime);

          if (openMinutes >= closeMinutes) {
            errors.push(`${day}: Close time must be after open time`);
          }

          if (schedule.breakStart && schedule.breakEnd) {
            const breakStartMinutes = this.timeToMinutes(schedule.breakStart);
            const breakEndMinutes = this.timeToMinutes(schedule.breakEnd);

            if (breakStartMinutes >= breakEndMinutes) {
              errors.push(`${day}: Break end time must be after break start time`);
            }

            if (breakStartMinutes < openMinutes || breakEndMinutes > closeMinutes) {
              errors.push(`${day}: Break times must be within working hours`);
            }
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export a singleton instance
export const settingsService = new SettingsService();

// Export default for ES6 imports
export default settingsService;