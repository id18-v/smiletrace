// src/app/(dashboard)/qr-demo/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ReceiptQRCode,
  ReceiptQRCodeSimple,
  ReceiptQRCodePrint 
} from '@/components/receipts/qr-code';
import {
  useReceiptQR,
  useAppointmentBookingQR,
  usePatientPortalQR,
  useVerificationQR,
  useClinicInfoQR,
  useBatchQRCodes
} from '@/hooks/useQRCode';
import { Separator } from '@/components/ui/separator';

export default function QRCodeDemoPage() {
  // Sample data for demonstration
  const [receiptData, setReceiptData] = useState({
    receiptId: 'receipt_123',
    receiptNumber: 'RCP-2024-001',
    patientName: 'John Doe',
    totalAmount: 250.00,
    date: new Date().toISOString(),
    clinicName: 'Smile Dental Clinic'
  });

  const [patientId, setPatientId] = useState('patient_456');
  const [clinicId, setClinicId] = useState('clinic_789');

  // Using QR code hooks
  const receiptQR = useReceiptQR(receiptData);
  const appointmentQR = useAppointmentBookingQR(patientId, clinicId);
  const portalQR = usePatientPortalQR(patientId);
  const verificationQR = useVerificationQR(receiptData.receiptId, receiptData.receiptNumber);
  const clinicQR = useClinicInfoQR({
    name: 'Smile Dental Clinic',
    phone: '+1 (555) 123-4567',
    email: 'info@smiledentalclinic.com',
    address: '123 Main St, City, State 12345',
    website: 'https://smiledentalclinic.com'
  });

  const batchQR = useBatchQRCodes();

  const handleBatchGenerate = async () => {
    const requests = [
      {
        id: 'receipt-1',
        type: 'treatment_details' as any,
        data: receiptData
      },
      {
        id: 'appointment-1',
        type: 'appointment_booking' as any,
        data: { patientId, clinicId }
      },
      {
        id: 'portal-1',
        type: 'patient_portal' as any,
        data: { patientId }
      }
    ];

    try {
      await batchQR.generateBatch(requests);
    } catch (error) {
      console.error('Batch generation failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QR Code Integration Demo</h1>
          <p className="text-muted-foreground">
            Advanced Receipt QR Code functionality for the dental platform
          </p>
        </div>
      </div>

      <Tabs defaultValue="receipt-qr" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="receipt-qr">Receipt QR Components</TabsTrigger>
          <TabsTrigger value="batch">Batch Generation</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        {/* Advanced Receipt QR Tab */}
        <TabsContent value="receipt-qr" className="space-y-6">
          <div className="grid gap-6">
            {/* Full Featured Receipt QR */}
            <Card>
              <CardHeader>
                <CardTitle>Advanced Receipt QR Component</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Full-featured receipt QR with download, print, size options, and fullscreen mode
                </p>
              </CardHeader>
              <CardContent>
                <ReceiptQRCode
                  receiptId={receiptData.receiptId}
                  receiptNumber={receiptData.receiptNumber}
                  patientName={receiptData.patientName}
                  totalAmount={receiptData.totalAmount}
                  date={receiptData.date}
                  clinicName={receiptData.clinicName}
                  defaultSize="medium"
                  className="max-w-md mx-auto"
                />
              </CardContent>
            </Card>

            {/* Component Variants */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Simple Version */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Simple Version</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Minimal component for embedding
                  </p>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ReceiptQRCodeSimple
                    receiptId={receiptData.receiptId}
                    receiptNumber={receiptData.receiptNumber}
                    patientName={receiptData.patientName}
                    totalAmount={receiptData.totalAmount}
                    date={receiptData.date}
                    clinicName={receiptData.clinicName}
                    size={150}
                  />
                </CardContent>
              </Card>

              {/* Print Version */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Print Version</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Optimized for printing
                  </p>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ReceiptQRCodePrint
                    receiptId={receiptData.receiptId}
                    receiptNumber={receiptData.receiptNumber}
                    patientName={receiptData.patientName}
                    totalAmount={receiptData.totalAmount}
                    date={receiptData.date}
                    clinicName={receiptData.clinicName}
                    defaultSize="medium"
                  />
                </CardContent>
              </Card>

              {/* Size Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Size Comparison</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Different sizes for different uses
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Small (120px)</p>
                    <ReceiptQRCodeSimple
                      receiptId={receiptData.receiptId}
                      receiptNumber={receiptData.receiptNumber}
                      patientName={receiptData.patientName}
                      totalAmount={receiptData.totalAmount}
                      date={receiptData.date}
                      size={120}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Medium (180px)</p>
                    <ReceiptQRCodeSimple
                      receiptId={receiptData.receiptId}
                      receiptNumber={receiptData.receiptNumber}
                      patientName={receiptData.patientName}
                      totalAmount={receiptData.totalAmount}
                      date={receiptData.date}
                      size={180}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hook Status Display */}
            <Card>
              <CardHeader>
                <CardTitle>QR Code Hook Status</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Current status of QR code generation hooks
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Receipt QR Status</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={receiptQR.generated ? 'text-green-600' : receiptQR.loading ? 'text-blue-600' : 'text-yellow-600'}>
                          {receiptQR.loading ? 'Loading...' : receiptQR.generated ? 'Generated' : 'Not Generated'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>URL:</span>
                        <span className="text-xs text-gray-500 truncate max-w-32">
                          {receiptQR.qrUrl ? 'Available' : 'Not Available'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Error:</span>
                        <span className="text-red-600 text-xs">
                          {receiptQR.error || 'None'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Other QR Status</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Appointment QR:</span>
                        <span className={appointmentQR.generated ? 'text-green-600' : 'text-yellow-600'}>
                          {appointmentQR.loading ? 'Loading...' : appointmentQR.generated ? 'Generated' : 'Not Generated'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Portal QR:</span>
                        <span className={portalQR.generated ? 'text-green-600' : 'text-yellow-600'}>
                          {portalQR.loading ? 'Loading...' : portalQR.generated ? 'Generated' : 'Not Generated'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Verification QR:</span>
                        <span className={verificationQR.generated ? 'text-green-600' : 'text-yellow-600'}>
                          {verificationQR.loading ? 'Loading...' : verificationQR.generated ? 'Generated' : 'Not Generated'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Full Featured Component</h4>
                    <pre className="p-3 bg-gray-100 rounded-md text-sm overflow-x-auto">
{`import { ReceiptQRCode } from '@/components/receipts/qr-code';

<ReceiptQRCode
  receiptId="receipt_123"
  receiptNumber="RCP-2024-001"
  patientName="John Doe"
  totalAmount={250.00}
  date={new Date().toISOString()}
  clinicName="Smile Dental Clinic"
  defaultSize="medium"
  showControls={true}
  showHeader={true}
/>`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Simple Embedded Version</h4>
                    <pre className="p-3 bg-gray-100 rounded-md text-sm overflow-x-auto">
{`import { ReceiptQRCodeSimple } from '@/components/receipts/qr-code';

<ReceiptQRCodeSimple
  receiptId="receipt_123"
  receiptNumber="RCP-2024-001"
  patientName="John Doe"
  totalAmount={250.00}
  date={new Date().toISOString()}
  size={150}
/>`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Print-Optimized Version</h4>
                    <pre className="p-3 bg-gray-100 rounded-md text-sm overflow-x-auto">
{`import { ReceiptQRCodePrint } from '@/components/receipts/qr-code';

<ReceiptQRCodePrint
  receiptId="receipt_123"
  receiptNumber="RCP-2024-001"
  patientName="John Doe"
  totalAmount={250.00}
  date={new Date().toISOString()}
  defaultSize="large"
/>`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Component Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Download Features</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• High-quality PNG download (500px)</li>
                      <li>• Automatic filename with receipt number</li>
                      <li>• Error handling and toast notifications</li>
                      <li>• One-click download functionality</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Print Features</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Print-optimized layout</li>
                      <li>• Clinic header and receipt info</li>
                      <li>• Clean formatting for physical receipts</li>
                      <li>• Automatic print dialog</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Size Options</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Small (120px) - For compact layouts</li>
                      <li>• Medium (200px) - Standard size</li>
                      <li>• Large (280px) - For emphasis</li>
                      <li>• XL (400px) - For detailed viewing</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">User Experience</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Fullscreen viewing mode</li>
                      <li>• Copy URL functionality</li>
                      <li>• QR code regeneration</li>
                      <li>• Loading and error states</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Batch Generation Tab */}
        <TabsContent value="batch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Batch QR Code Generation</CardTitle>
              <p className="text-sm text-muted-foreground">
                Generate multiple QR codes in a single request
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleBatchGenerate}
                disabled={batchQR.loading}
                className="w-full"
              >
                {batchQR.loading ? 'Generating...' : 'Generate Batch QR Codes'}
              </Button>

              {batchQR.results.length > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <h4 className="font-semibold">Generated QR Codes ({batchQR.results.length})</h4>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    {batchQR.results.map(result => (
                      <Card key={result.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">
                            {result.id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {result.error ? (
                            <div className="text-center p-4 text-red-500 text-sm">
                              {result.error}
                            </div>
                          ) : (
                            <div className="text-center">
                              <img 
                                src={result.qrUrl} 
                                alt={`QR Code for ${result.id}`}
                                width={120}
                                height={120}
                                className="mx-auto border border-gray-300 rounded"
                              />
                              <p className="text-xs text-green-600 mt-2">Successfully generated</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {batchQR.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{batchQR.error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Receipt Data Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Receipt Data</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Modify receipt data to see QR codes update in real-time
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="receiptId">Receipt ID</Label>
                  <Input
                    id="receiptId"
                    value={receiptData.receiptId}
                    onChange={(e) => setReceiptData(prev => ({
                      ...prev,
                      receiptId: e.target.value
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="receiptNumber">Receipt Number</Label>
                  <Input
                    id="receiptNumber"
                    value={receiptData.receiptNumber}
                    onChange={(e) => setReceiptData(prev => ({
                      ...prev,
                      receiptNumber: e.target.value
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input
                    id="patientName"
                    value={receiptData.patientName}
                    onChange={(e) => setReceiptData(prev => ({
                      ...prev,
                      patientName: e.target.value
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="totalAmount">Total Amount</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    value={receiptData.totalAmount}
                    onChange={(e) => setReceiptData(prev => ({
                      ...prev,
                      totalAmount: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="clinicName">Clinic Name</Label>
                  <Input
                    id="clinicName"
                    value={receiptData.clinicName}
                    onChange={(e) => setReceiptData(prev => ({
                      ...prev,
                      clinicName: e.target.value
                    }))}
                  />
                </div>

                <Button
                  onClick={() => setReceiptData({
                    receiptId: `receipt_${Math.random().toString(36).substr(2, 9)}`,
                    receiptNumber: `RCP-2024-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
                    patientName: ['John Doe', 'Jane Smith', 'Michael Johnson', 'Sarah Wilson'][Math.floor(Math.random() * 4)],
                    totalAmount: Math.floor(Math.random() * 500 + 50),
                    date: new Date().toISOString(),
                    clinicName: receiptData.clinicName
                  })}
                  variant="outline"
                  className="w-full"
                >
                  Generate Random Data
                </Button>
              </CardContent>
            </Card>

            {/* API Usage Examples */}
            <Card>
              <CardHeader>
                <CardTitle>API Usage Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Generate Receipt QR Code</h4>
                    <pre className="p-3 bg-gray-100 rounded-md text-sm overflow-x-auto">
{`POST /api/qr
{
  "type": "treatment_details",
  "data": {
    "receiptId": "${receiptData.receiptId}",
    "receiptNumber": "${receiptData.receiptNumber}",
    "patientName": "${receiptData.patientName}",
    "totalAmount": ${receiptData.totalAmount},
    "date": "${receiptData.date}",
    "clinicName": "${receiptData.clinicName}"
  }
}`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Get Receipt QR Codes</h4>
                    <pre className="p-3 bg-gray-100 rounded-md text-sm overflow-x-auto">
{`GET /api/receipts/${receiptData.receiptId}/qr?type=receipt
GET /api/receipts/${receiptData.receiptId}/qr?type=verification  
GET /api/receipts/${receiptData.receiptId}/qr?type=appointment
GET /api/receipts/${receiptData.receiptId}/qr?type=all`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}