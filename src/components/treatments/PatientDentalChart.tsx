import React, { useState, useEffect } from 'react';
import { Loader2, Save, RotateCcw, AlertCircle, CheckCircle, User, Heart, X } from 'lucide-react';

// Types
type ToothStatus = 'HEALTHY' | 'TREATED' | 'MISSING' | 'CAVITY' | 'CROWN' | 'IMPLANT' | 'BRIDGE';

interface ToothData {
  id?: string;
  toothNumber: number;
  status: ToothStatus;
  surfaces?: string[];
  notes?: string;
  lastUpdated?: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  allergies?: string[];
}

const TOOTH_POSITIONS: Record<number, { type: string }> = {
  17: { type: 'molar' }, 18: { type: 'molar' }, 19: { type: 'molar' }, 20: { type: 'premolar' },
  21: { type: 'premolar' }, 22: { type: 'canine' }, 23: { type: 'incisor' }, 24: { type: 'incisor' },
  25: { type: 'incisor' }, 26: { type: 'incisor' }, 27: { type: 'canine' }, 28: { type: 'premolar' },
  29: { type: 'premolar' }, 30: { type: 'molar' }, 31: { type: 'molar' }, 32: { type: 'molar' },
  1: { type: 'molar' }, 2: { type: 'molar' }, 3: { type: 'molar' }, 4: { type: 'premolar' },
  5: { type: 'premolar' }, 6: { type: 'canine' }, 7: { type: 'incisor' }, 8: { type: 'incisor' },
  9: { type: 'incisor' }, 10: { type: 'incisor' }, 11: { type: 'canine' }, 12: { type: 'premolar' },
  13: { type: 'premolar' }, 14: { type: 'molar' }, 15: { type: 'molar' }, 16: { type: 'molar' }
};

const STATUS_LABELS: Record<ToothStatus, string> = {
  HEALTHY: 'Sănătos', TREATED: 'Tratat', MISSING: 'Lipsă',
  CAVITY: 'Carie', CROWN: 'Coroană', IMPLANT: 'Implant', BRIDGE: 'Punte'
};

const ToothItem: React.FC<{
  number: number;
  data?: ToothData;
  isSelected: boolean;
  onClick: () => void;
}> = ({ number, data, isSelected, onClick }) => {
  const position = TOOTH_POSITIONS[number];
  const size = position.type === 'molar' ? 45 : position.type === 'premolar' ? 40 : 35;
  const status = data?.status || 'HEALTHY';

  return (
    <div
      className={`relative inline-block transition-all duration-200 cursor-pointer hover:scale-110 ${
        isSelected ? 'ring-2 ring-blue-500 rounded-lg' : ''
      }`}
      onClick={onClick}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <div className={`w-full h-full flex items-center justify-center text-2xl bg-gray-100 rounded-lg border-2 ${
        status === 'HEALTHY' ? 'border-gray-300 bg-white' :
        status === 'CAVITY' ? 'border-red-400 bg-red-50' :
        status === 'CROWN' ? 'border-blue-400 bg-blue-50' :
        status === 'TREATED' ? 'border-orange-400 bg-orange-50' :
        status === 'IMPLANT' ? 'border-purple-400 bg-purple-50' :
        status === 'BRIDGE' ? 'border-green-400 bg-green-50' :
        'border-gray-200 bg-transparent text-gray-400'
      }`}>
        {status !== 'MISSING' ? '🦷' : '✕'}
      </div>
      {status === 'CAVITY' && <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">
        {number}
      </div>
    </div>
  );
};

export default function PatientDentalChart() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [toothData, setToothData] = useState<Map<number, ToothData>>(new Map());
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      loadToothData(selectedPatient.id);
    }
  }, [selectedPatient]);

  const loadPatients = async () => {
    setIsLoadingPatients(true);
    try {
      const res = await fetch('/api/patients');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setPatients(data.patients || []);
    } catch (error) {
      console.error('Error:', error);
      setAlert({ type: 'error', message: 'Eroare la încărcarea pacienților' });
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const loadToothData = async (patientId: string) => {
    setIsLoading(true);
    setSelectedTooth(null);
    try {
      const res = await fetch(`/api/patients/${patientId}/tooth-status`);
      if (!res.ok && res.status !== 404) throw new Error('Failed to load');
      const data: ToothData[] = res.ok ? await res.json() : [];
      const map = new Map<number, ToothData>();
      data.forEach(tooth => map.set(tooth.toothNumber, tooth));
      setToothData(map);
      setHasChanges(false);
    } catch (error) {
      console.error('Error:', error);
      setToothData(new Map());
    } finally {
      setIsLoading(false);
    }
  };

  const saveChanges = async () => {
    if (!selectedPatient) return;
    setIsSaving(true);
    try {
      const dataArray = Array.from(toothData.values());
      const res = await fetch(`/api/patients/${selectedPatient.id}/tooth-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teeth: dataArray })
      });
      if (!res.ok) throw new Error('Failed to save');
      setAlert({ type: 'success', message: 'Salvat cu succes!' });
      setHasChanges(false);
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      setAlert({ type: 'error', message: 'Eroare la salvare' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateToothStatus = (status: ToothStatus) => {
    if (!selectedTooth) return;
    const newData = new Map(toothData);
    if (status === 'HEALTHY') {
      newData.delete(selectedTooth);
    } else {
      newData.set(selectedTooth, {
        toothNumber: selectedTooth,
        status,
        lastUpdated: new Date().toISOString()
      });
    }
    setToothData(newData);
    setHasChanges(true);
  };

  const resetChart = () => {
    if (confirm('Sigur vrei să resetezi?')) {
      setToothData(new Map());
      setHasChanges(true);
    }
  };

  const selectedToothData = selectedTooth ? toothData.get(selectedTooth) : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hartă Dentară Pacienți</h1>
          <p className="text-gray-600">Gestionează starea dentară pentru fiecare pacient</p>
        </div>

        {alert && (
          <div className={`rounded-lg p-4 flex items-center gap-3 ${
            alert.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {alert.type === 'success' ? 
              <CheckCircle className="w-5 h-5 text-green-600" /> :
              <AlertCircle className="w-5 h-5 text-red-600" />
            }
            <p className={`font-medium ${alert.type === 'success' ? 'text-green-900' : 'text-red-900'}`}>
              {alert.message}
            </p>
            <button onClick={() => setAlert(null)} className="ml-auto">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pacienți ({patients.length})</h2>
              {isLoadingPatients ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : patients.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">Nu există pacienți</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {patients.map(patient => (
                    <button
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedPatient?.id === patient.id
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="font-medium text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-sm text-gray-600">{patient.phone}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {selectedPatient ? (
              <>
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-xl text-gray-900">
                          {selectedPatient.firstName} {selectedPatient.lastName}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {selectedPatient.email} • {selectedPatient.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={resetChart}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                      </button>
                      <button
                        onClick={saveChanges}
                        disabled={!hasChanges || isSaving}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? 'Se salvează...' : 'Salvează'}
                      </button>
                    </div>
                  </div>
                  {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-700 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Alergii: {selectedPatient.allergies.join(', ')}
                      </p>
                    </div>
                  )}
                </div>

                {isLoading ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Hartă Dentară</h3>
                    
                    <div className="mb-8">
                      <p className="text-sm text-gray-600 text-center mb-4">Maxilar Superior</p>
                      <div className="flex justify-center gap-1 flex-wrap">
                        {Array.from({ length: 16 }, (_, i) => i + 17).map(num => (
                          <ToothItem
                            key={num}
                            number={num}
                            data={toothData.get(num)}
                            isSelected={selectedTooth === num}
                            onClick={() => setSelectedTooth(num)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="border-t-2 border-gray-200 relative my-6">
                      <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs text-gray-500">
                        Linia mediană
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-center gap-1 flex-wrap">
                        {Array.from({ length: 16 }, (_, i) => 16 - i).map(num => (
                          <ToothItem
                            key={num}
                            number={num}
                            data={toothData.get(num)}
                            isSelected={selectedTooth === num}
                            onClick={() => setSelectedTooth(num)}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 text-center mt-4">Maxilar Inferior</p>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(STATUS_LABELS).map(([status, label]) => (
                          <div key={status} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border-2 ${
                              status === 'HEALTHY' ? 'bg-white border-gray-300' :
                              status === 'CAVITY' ? 'bg-red-50 border-red-400' :
                              status === 'CROWN' ? 'bg-blue-50 border-blue-400' :
                              status === 'TREATED' ? 'bg-orange-50 border-orange-400' :
                              status === 'IMPLANT' ? 'bg-purple-50 border-purple-400' :
                              status === 'BRIDGE' ? 'bg-green-50 border-green-400' :
                              'bg-gray-50 border-gray-200'
                            }`} />
                            <span className="text-sm text-gray-700">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedTooth && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Editează Dintele #{selectedTooth}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(STATUS_LABELS).map(([status, label]) => (
                        <button
                          key={status}
                          onClick={() => updateToothStatus(status as ToothStatus)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedToothData?.status === status
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="font-medium text-sm text-gray-900">{label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Selectează un pacient pentru a vedea harta dentară</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}