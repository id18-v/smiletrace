// src/types/qr.ts
// Type definitions for QR code functionality

export interface QRCodeOptions {
  size?: number;
  format?: 'png' | 'jpg' | 'gif' | 'svg';
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
}

export enum QRCodeType {
  APPOINTMENT_BOOKING = 'appointment_booking',
  RECEIPT_VERIFICATION = 'receipt_verification',
  PATIENT_PORTAL = 'patient_portal',
  TREATMENT_DETAILS = 'treatment_details',
  CLINIC_INFO = 'clinic_info'
}

export interface ReceiptQRData {
  receiptId: string;
  receiptNumber: string;
  patientName: string;
  totalAmount: number;
  date: string;
  clinicName?: string;
}

export interface ClinicQRInfo {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
}

export interface QRCodeRequest {
  id: string;
  type: QRCodeType;
  data: any;
  options?: QRCodeOptions;
}

export interface QRCodeResult {
  id: string;
  qrUrl: string;
  error?: string;
}

export interface SecureQRData {
  expires: number;
  signature: string;
  [key: string]: any;
}

export interface AppointmentBookingQRData {
  patientId: string;
  clinicId?: string;
}

export interface PatientPortalQRData {
  patientId: string;
  accessToken?: string;
}

export interface ReceiptVerificationQRData {
  receiptId: string;
  receiptNumber: string;
}