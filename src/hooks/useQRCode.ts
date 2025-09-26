// src/hooks/useQRCode.ts
import { useState, useEffect, useCallback } from 'react';
import { QRCodeType } from '@/lib/qr';

interface UseQRCodeOptions {
  type: QRCodeType;
  data: any;
  autoGenerate?: boolean;
}

interface QRCodeState {
  qrUrl: string | null;
  loading: boolean;
  error: string | null;
  generated: boolean;
}

export function useQRCode({ type, data, autoGenerate = false }: UseQRCodeOptions) {
  const [state, setState] = useState<QRCodeState>({
    qrUrl: null,
    loading: false,
    error: null,
    generated: false
  });

  const generateQR = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate QR code');
      }

      setState(prev => ({
        ...prev,
        qrUrl: result.qrUrl,
        loading: false,
        generated: true
      }));

      return result.qrUrl;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate QR code';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, [type, data]);

  const regenerateQR = useCallback(async () => {
    setState(prev => ({ ...prev, generated: false, qrUrl: null }));
    return await generateQR();
  }, [generateQR]);

  const reset = useCallback(() => {
    setState({
      qrUrl: null,
      loading: false,
      error: null,
      generated: false
    });
  }, []);

  useEffect(() => {
    if (autoGenerate && !state.generated && !state.loading) {
      generateQR();
    }
  }, [autoGenerate, generateQR, state.generated, state.loading]);

  return {
    ...state,
    generateQR,
    regenerateQR,
    reset
  };
}

// Specialized hooks for different QR code types

export function useReceiptQR(receiptData: {
  receiptId: string;
  receiptNumber: string;
  patientName: string;
  totalAmount: number;
  date: string;
  clinicName?: string;
}) {
  return useQRCode({
    type: QRCodeType.TREATMENT_DETAILS,
    data: receiptData,
    autoGenerate: true
  });
}

export function useAppointmentBookingQR(patientId: string, clinicId?: string) {
  return useQRCode({
    type: QRCodeType.APPOINTMENT_BOOKING,
    data: { patientId, clinicId },
    autoGenerate: true
  });
}

export function usePatientPortalQR(patientId: string, accessToken?: string) {
  return useQRCode({
    type: QRCodeType.PATIENT_PORTAL,
    data: { patientId, accessToken },
    autoGenerate: true
  });
}

export function useVerificationQR(receiptId: string, receiptNumber: string) {
  return useQRCode({
    type: QRCodeType.RECEIPT_VERIFICATION,
    data: { receiptId, receiptNumber },
    autoGenerate: true
  });
}

export function useClinicInfoQR(clinicInfo: {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
}) {
  return useQRCode({
    type: QRCodeType.CLINIC_INFO,
    data: clinicInfo,
    autoGenerate: true
  });
}

// Batch QR code hook
export function useBatchQRCodes() {
  const [state, setState] = useState<{
    loading: boolean;
    results: Array<{id: string; qrUrl: string; error?: string}>;
    error: string | null;
  }>({
    loading: false,
    results: [],
    error: null
  });

  const generateBatch = useCallback(async (requests: Array<{
    id: string;
    type: QRCodeType;
    data: any;
  }>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/qr', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate batch QR codes');
      }

      setState(prev => ({
        ...prev,
        results: result.results,
        loading: false
      }));

      return result.results;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate batch QR codes';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      loading: false,
      results: [],
      error: null
    });
  }, []);

  return {
    ...state,
    generateBatch,
    reset
  };
}