"use client";

import React, { useState, useEffect } from 'react';

const ReceiptDemoPage = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // Demo form data
  const [treatmentId, setTreatmentId] = useState('cm1234567890abcdef');
  const [discountCode, setDiscountCode] = useState('UTMBEST');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [paymentAmount, setPaymentAmount] = useState('100');
  const [emailAddress, setEmailAddress] = useState('patient@example.com');

  const addResult = (title: string, data: any, success: boolean = true) => {
    const newResult = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      title,
      data,
      success
    };
    setResults(prev => [newResult, ...prev.slice(0, 9)]);
  };

  const apiCall = async (url: string, options: any = {}) => {
    setLoading(true);
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      const data = await response.json();
      
      if (response.ok) {
        addResult(`✅ ${options.method || 'GET'} ${url}`, data, true);
        return data;
      } else {
        addResult(`❌ ${options.method || 'GET'} ${url}`, data, false);
        return null;
      }
    } catch (error: any) {
      addResult(`💥 ${options.method || 'GET'} ${url}`, { error: error.message }, false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Test Functions
  const testCreateReceipt = async () => {
    const data = await apiCall('/api/receipts', {
      method: 'POST',
      body: JSON.stringify({
        treatmentId,
        discountCode,
        paymentMethod,
        customDiscount: 25,
        taxRate: 0.08,
        emailAddress
      })
    });
    
    if (data?.receipt) {
      setSelectedReceipt(data.receipt);
      loadReceipts();
    }
  };

  const testGetReceipts = async () => {
    const data = await apiCall('/api/receipts');
    if (data?.receipts) {
      setReceipts(data.receipts);
    }
  };

  const testGetReceiptDetails = async () => {
    if (!selectedReceipt?.id) {
      alert('Te rog să creezi sau să selectezi un receipt mai întâi');
      return;
    }
    await apiCall(`/api/receipts/${selectedReceipt.id}`);
  };

  const testRecordPayment = async () => {
    if (!selectedReceipt?.id) {
      alert('Te rog să creezi sau să selectezi un receipt mai întâi');
      return;
    }
    
    const data = await apiCall(`/api/receipts/${selectedReceipt.id}/payment`, {
      method: 'PUT',
      body: JSON.stringify({
        paymentMethod,
        paidAmount: parseFloat(paymentAmount),
        transactionId: `txn_${Date.now()}`
      })
    });
    
    if (data?.payment) {
      setSelectedReceipt(data.payment);
      loadReceipts();
    }
  };

  const testSendEmail = async () => {
    if (!selectedReceipt?.id) {
      alert('Te rog să creezi sau să selectezi un receipt mai întâi');
      return;
    }
    
    await apiCall(`/api/receipts/${selectedReceipt.id}/email`, {
      method: 'POST',
      body: JSON.stringify({
        emailAddress,
        subject: `Receipt #${selectedReceipt.receiptNumber} - Demo`
      })
    });
  };

  const testGetPaymentHistory = async () => {
    if (!selectedReceipt?.id) {
      alert('Te rog să creezi sau să selectezi un receipt mai întâi');
      return;
    }
    
    await apiCall(`/api/receipts/${selectedReceipt.id}/payment`);
  };

  const loadReceipts = async () => {
    const data = await apiCall('/api/receipts');
    if (data?.receipts) {
      setReceipts(data.receipts);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1629] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Receipt API Demo
          </h1>
          <p className="text-[#94a3b8]">
            Testează toate endpoint-urile pentru receipturi inclusiv codul de reducere UTMBEST (20% reducere)
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-400">📄</span>
              </div>
              <span className="text-[#64748b] text-sm">+2 față de ieri</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{receipts.length}</div>
            <div className="text-[#94a3b8] text-sm">Receipt-uri Total</div>
          </div>

          <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-green-400">💰</span>
              </div>
              <span className="text-[#64748b] text-sm">+8% această săptămână</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {receipts.reduce((sum, r) => sum + (r.totalAmount || 0), 0).toLocaleString()} RON
            </div>
            <div className="text-[#94a3b8] text-sm">Venituri Totale</div>
          </div>

          <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-purple-400">🎯</span>
              </div>
              <span className="text-[#64748b] text-sm">în așteptare</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {results.filter(r => r.success).length}
            </div>
            <div className="text-[#94a3b8] text-sm">API-uri Reușite</div>
          </div>

          <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <span className="text-orange-400">🔥</span>
              </div>
              <span className="text-[#64748b] text-sm">20% reducere</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">UTMBEST</div>
            <div className="text-[#94a3b8] text-sm">Cod Reducere</div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Configuration */}
          <div className="xl:col-span-1 space-y-6">
            {/* Configuration Panel */}
            <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
              <h2 className="text-xl font-semibold text-white mb-6">Configurare</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#e2e8f0] mb-2">
                    Treatment ID
                  </label>
                  <input
                    type="text"
                    value={treatmentId}
                    onChange={(e) => setTreatmentId(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f1629] border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-[#64748b]"
                    placeholder="Introdu ID tratament"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#e2e8f0] mb-2">
                    Cod Reducere
                  </label>
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f1629] border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-[#64748b]"
                    placeholder="Încearcă UTMBEST pentru 20% reducere"
                  />
                  <p className="text-xs text-[#64748b] mt-1">Folosește "UTMBEST" pentru 20% reducere</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#e2e8f0] mb-2">
                    Metoda de Plată
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f1629] border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  >
                    <option value="CREDIT_CARD">Card de Credit</option>
                    <option value="CASH">Numerar</option>
                    <option value="DEBIT_CARD">Card de Debit</option>
                    <option value="BANK_TRANSFER">Transfer Bancar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#e2e8f0] mb-2">
                    Suma de Plată (RON)
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f1629] border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-[#64748b]"
                    placeholder="100.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#e2e8f0] mb-2">
                    Adresă Email
                  </label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f1629] border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-[#64748b]"
                    placeholder="patient@example.com"
                  />
                </div>
              </div>
            </div>

            {/* API Test Buttons */}
            <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
              <h2 className="text-xl font-semibold text-white mb-6">Testare API</h2>
              
              <div className="space-y-3">
                <button
                  onClick={testCreateReceipt}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : null}
                  1. Creează Receipt
                </button>

                <button
                  onClick={testGetReceipts}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  2. Lista Receipt-uri
                </button>

                <button
                  onClick={testGetReceiptDetails}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  3. Detalii Receipt
                </button>

                <button
                  onClick={testRecordPayment}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  4. Înregistrează Plata
                </button>

                <button
                  onClick={testSendEmail}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  5. Trimite Email
                </button>

                <button
                  onClick={testGetPaymentHistory}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  6. Istoric Plăți
                </button>

                <button
                  onClick={clearResults}
                  className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-colors border border-red-600/30"
                >
                  Șterge Rezultate
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Results and Receipts */}
          <div className="xl:col-span-2 space-y-6">
            {/* Results Panel */}
            <div className="bg-[#1e293b] rounded-xl border border-[#334155]">
              <div className="p-6 border-b border-[#334155]">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Rezultate API</h2>
                  {loading && (
                    <div className="flex items-center text-blue-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                      Se încarcă...
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {results.length === 0 ? (
                    <div className="text-center py-8 text-[#64748b]">
                      <div className="w-16 h-16 bg-[#334155] rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📊</span>
                      </div>
                      <p className="text-lg font-medium mb-2">Niciun apel API încă</p>
                      <p className="text-sm">Folosește butoanele din stânga pentru a testa API-urile.</p>
                    </div>
                  ) : (
                    results.map((result) => (
                      <div
                        key={result.id}
                        className={`p-4 rounded-lg border-l-4 ${
                          result.success
                            ? 'bg-green-500/10 border-green-400'
                            : 'bg-red-500/10 border-red-400'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium text-white text-sm">{result.title}</h3>
                          <span className="text-xs text-[#64748b]">{result.timestamp}</span>
                        </div>
                        <pre className="text-xs bg-[#0f1629] p-3 rounded border border-[#334155] overflow-x-auto text-[#e2e8f0]">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Receipts List */}
            {receipts.length > 0 && (
              <div className="bg-[#1e293b] rounded-xl border border-[#334155]">
                <div className="p-6 border-b border-[#334155]">
                  <h2 className="text-xl font-semibold text-white">Receipt-uri Existente</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {receipts.map((receipt: any) => (
                      <div
                        key={receipt.id}
                        onClick={() => setSelectedReceipt(receipt)}
                        className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedReceipt?.id === receipt.id
                            ? 'bg-blue-500/20 border-2 border-blue-400 ring-1 ring-blue-400/30'
                            : 'bg-[#0f1629] hover:bg-[#334155]/30 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-white">{receipt.receiptNumber}</p>
                            <p className="text-sm text-[#94a3b8]">
                              {receipt.patient?.firstName} {receipt.patient?.lastName}
                            </p>
                            <p className="text-xs text-[#64748b] mt-1">
                              {new Date(receipt.createdAt).toLocaleDateString('ro-RO')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white text-lg">{receipt.totalAmount} RON</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              receipt.status === 'PAID' 
                                ? 'bg-green-500/20 text-green-400'
                                : receipt.status === 'PARTIAL'
                                ? 'bg-yellow-500/20 text-yellow-400' 
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {receipt.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Selected Receipt Details */}
            {selectedReceipt && (
              <div className="bg-[#1e293b] rounded-xl border border-[#334155]">
                <div className="p-6 border-b border-[#334155]">
                  <h2 className="text-xl font-semibold text-white">Detalii Receipt Selectat</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                    <div>
                      <p className="font-medium text-[#94a3b8] mb-1">Numărul Receipt</p>
                      <p className="text-white font-mono">{selectedReceipt.receiptNumber}</p>
                    </div>
                    <div>
                      <p className="font-medium text-[#94a3b8] mb-1">Suma Totală</p>
                      <p className="text-white font-bold">{selectedReceipt.totalAmount} RON</p>
                    </div>
                    <div>
                      <p className="font-medium text-[#94a3b8] mb-1">Suma Plătită</p>
                      <p className="text-white">{selectedReceipt.paidAmount} RON</p>
                    </div>
                    <div>
                      <p className="font-medium text-[#94a3b8] mb-1">Rest de Plată</p>
                      <p className={selectedReceipt.balanceDue > 0 ? 'text-red-400 font-medium' : 'text-green-400'}>
                        {selectedReceipt.balanceDue} RON
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-[#94a3b8] mb-1">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        selectedReceipt.status === 'PAID' 
                          ? 'bg-green-500/20 text-green-400'
                          : selectedReceipt.status === 'PARTIAL'
                          ? 'bg-yellow-500/20 text-yellow-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {selectedReceipt.status}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-[#94a3b8] mb-1">Email Trimis</p>
                      <p className={selectedReceipt.emailSent ? 'text-green-400' : 'text-red-400'}>
                        {selectedReceipt.emailSent ? 'Da' : 'Nu'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptDemoPage;