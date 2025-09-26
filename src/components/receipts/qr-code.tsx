// src/components/receipts/qr-code.tsx
'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Printer, 
  RefreshCw, 
  QrCode,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useReceiptQR } from '@/hooks/useQRCode';

interface ReceiptQRCodeProps {
  receiptId: string;
  receiptNumber: string;
  patientName: string;
  totalAmount: number;
  date: string;
  clinicName?: string;
  className?: string;
  showHeader?: boolean;
  defaultSize?: 'small' | 'medium' | 'large' | 'xl';
  showControls?: boolean;
  printMode?: boolean;
}

const QR_SIZES = {
  small: { size: 120, label: 'Small' },
  medium: { size: 200, label: 'Medium' },
  large: { size: 280, label: 'Large' },
  xl: { size: 400, label: 'Extra Large' }
} as const;

export function ReceiptQRCode({
  receiptId,
  receiptNumber,
  patientName,
  totalAmount,
  date,
  clinicName = 'Dental Clinic',
  className,
  showHeader = true,
  defaultSize = 'medium',
  showControls = true,
  printMode = false
}: ReceiptQRCodeProps) {
  const [selectedSize, setSelectedSize] = useState<keyof typeof QR_SIZES>(defaultSize);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const receiptData = {
    receiptId,
    receiptNumber,
    patientName,
    totalAmount,
    date,
    clinicName
  };

  const { qrUrl, loading, error, generateQR, regenerateQR } = useReceiptQR(receiptData);

  const currentSize = QR_SIZES[selectedSize];

  const downloadQRCode = useCallback(async () => {
    if (!qrUrl) {
      toast.error('No QR code to download');
      return;
    }

    try {
      // Create a larger version for download
      const downloadSize = 500;
      const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=${downloadSize}x${downloadSize}&data=${encodeURIComponent(JSON.stringify(receiptData))}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch QR code');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-qr-${receiptNumber}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('QR code downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download QR code');
    }
  }, [qrUrl, receiptData, receiptNumber]);

  const printQRCode = useCallback(() => {
    if (!qrRef.current) {
      toast.error('QR code not ready for printing');
      return;
    }

    const printContent = qrRef.current.cloneNode(true) as HTMLElement;
    
    // Create print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Unable to open print window');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt QR Code - ${receiptNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              background: white;
            }
            .print-header {
              text-align: center;
              margin-bottom: 20px;
            }
            .print-header h1 {
              margin: 0 0 10px 0;
              font-size: 24px;
              color: #333;
            }
            .print-header p {
              margin: 0;
              color: #666;
              font-size: 14px;
            }
            .qr-container {
              text-align: center;
              border: 2px solid #333;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
            }
            .qr-image {
              border: 1px solid #ddd;
              border-radius: 4px;
            }
            .receipt-info {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .receipt-info div {
              margin: 2px 0;
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .print-header h1 { font-size: 18px; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>${clinicName}</h1>
            <p>Receipt QR Code</p>
          </div>
          <div class="qr-container">
            <img src="${qrUrl}" alt="Receipt QR Code" class="qr-image" width="300" height="300" />
            <div class="receipt-info">
              <div><strong>Receipt:</strong> ${receiptNumber}</div>
              <div><strong>Patient:</strong> ${patientName}</div>
              <div><strong>Amount:</strong> $${totalAmount.toFixed(2)}</div>
              <div><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</div>
              <div style="margin-top: 10px; font-size: 10px;">
                Scan this QR code to view receipt details and book appointments
              </div>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);

    toast.success('Print dialog opened');
  }, [qrUrl, receiptNumber, patientName, totalAmount, date, clinicName]);

  const copyQRUrl = useCallback(async () => {
    if (!qrUrl) {
      toast.error('No QR code to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      toast.success('QR code URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy QR code URL');
    }
  }, [qrUrl]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  if (printMode) {
    return (
      <div className="text-center">
        {qrUrl ? (
          <img 
            src={qrUrl} 
            alt="Receipt QR Code" 
            width={currentSize.size}
            height={currentSize.size}
            className="border border-gray-300 rounded"
          />
        ) : (
          <div 
            className="border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50"
            style={{ width: currentSize.size, height: currentSize.size }}
          >
            <QrCode className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Card className={`${className} ${isFullscreen ? 'fixed inset-4 z-50 overflow-auto' : ''}`}>
        {showHeader && (
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Receipt QR Code
                {error && <AlertCircle className="h-4 w-4 text-red-500" />}
              </CardTitle>
              {showControls && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
        )}

        <CardContent className="space-y-4">
          {/* Size Controls */}
          {showControls && (
            <div className="flex gap-2 justify-center flex-wrap">
              {Object.entries(QR_SIZES).map(([key, { label }]) => (
                <Button
                  key={key}
                  variant={selectedSize === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSize(key as keyof typeof QR_SIZES)}
                  className="text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
          )}

          {/* QR Code Display */}
          <div className="flex justify-center" ref={qrRef}>
            {loading ? (
              <div 
                className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded bg-gray-50"
                style={{ width: currentSize.size, height: currentSize.size }}
              >
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : qrUrl ? (
              <div className="text-center">
                <img
                  src={qrUrl}
                  alt="Receipt QR Code"
                  width={currentSize.size}
                  height={currentSize.size}
                  className="border border-gray-300 rounded mx-auto"
                />
                <div className="mt-2 text-xs text-gray-500">
                  {currentSize.label} ({currentSize.size}px)
                </div>
              </div>
            ) : error ? (
              <div 
                className="flex flex-col items-center justify-center border-2 border-dashed border-red-300 rounded bg-red-50 text-red-600"
                style={{ width: currentSize.size, height: currentSize.size }}
              >
                <AlertCircle className="h-8 w-8 mb-2" />
                <p className="text-sm text-center px-4">Failed to load QR code</p>
              </div>
            ) : (
              <div 
                className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded bg-gray-50"
                style={{ width: currentSize.size, height: currentSize.size }}
              >
                <QrCode className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Receipt Information */}
          <div className="text-center space-y-1">
            <div className="flex justify-center gap-2 text-sm text-gray-600">
              <Badge variant="outline">{receiptNumber}</Badge>
              <Badge variant="outline">${totalAmount.toFixed(2)}</Badge>
            </div>
            <p className="text-sm font-medium">{patientName}</p>
            <p className="text-xs text-gray-500">
              {new Date(date).toLocaleDateString()}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-center">
              <p className="text-sm text-red-600">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={regenerateQR}
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          {showControls && qrUrl && (
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadQRCode}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={printQRCode}
                disabled={loading}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={copyQRUrl}
                disabled={loading}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? 'Copied!' : 'Copy URL'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={regenerateQR}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
            </div>
          )}

          {/* QR Code Info */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Scan to view receipt details and book appointments
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleFullscreen}
        />
      )}
    </>
  );
}

// Simplified version for embedding in receipts
interface ReceiptQRCodeSimpleProps {
  receiptId: string;
  receiptNumber: string;
  patientName: string;
  totalAmount: number;
  date: string;
  clinicName?: string;
  size?: number;
}

export function ReceiptQRCodeSimple({
  receiptId,
  receiptNumber,
  patientName,
  totalAmount,
  date,
  clinicName = 'Dental Clinic',
  size = 150
}: ReceiptQRCodeSimpleProps) {
  const receiptData = {
    receiptId,
    receiptNumber,
    patientName,
    totalAmount,
    date,
    clinicName
  };

  const { qrUrl, loading, error } = useReceiptQR(receiptData);

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center border border-gray-300 rounded bg-gray-50"
        style={{ width: size, height: size }}
      >
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !qrUrl) {
    return (
      <div 
        className="flex items-center justify-center border border-gray-300 rounded bg-gray-50"
        style={{ width: size, height: size }}
      >
        <QrCode className="h-6 w-6 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={qrUrl}
      alt="Receipt QR Code"
      width={size}
      height={size}
      className="border border-gray-300 rounded"
    />
  );
}

// Print-optimized version
export function ReceiptQRCodePrint(props: ReceiptQRCodeProps) {
  return <ReceiptQRCode {...props} printMode={true} showControls={false} showHeader={false} />;
}