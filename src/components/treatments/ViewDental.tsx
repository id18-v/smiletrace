import React, { useState, useEffect } from 'react';
import { Loader2, Save, RotateCcw, AlertCircle, CheckCircle, X, Activity } from 'lucide-react';

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

interface SinglePatientDentalChartProps {
  patientId: string;
  patientName?: string;
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
        isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400 rounded-lg' : ''
      }`}
      onClick={onClick}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <div className={`w-full h-full flex items-center justify-center text-2xl rounded-lg border-2 transition-colors ${
        status === 'HEALTHY' ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700' :
        status === 'CAVITY' ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/30' :
        status === 'CROWN' ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30' :
        status === 'TREATED' ? 'border-orange-400 dark:border-orange-500 bg-orange-50 dark:bg-orange-900/30' :
        status === 'IMPLANT' ? 'border-purple-400 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/30' :
        status === 'BRIDGE' ? 'border-green-400 dark:border-green-500 bg-green-50 dark:bg-green-900/30' :
        'border-gray-200 dark:border-gray-700 bg-transparent text-gray-400 dark:text-gray-600'
      }`}>
        {status !== 'MISSING' ? '🦷' : '✕'}
      </div>
      {status === 'CAVITY' && <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 dark:text-gray-400">
        {number}
      </div>
    </div>
  );
};

export default function SinglePatientDentalChart({ patientId, patientName }: SinglePatientDentalChartProps) {
  const [toothData, setToothData] = useState<Map<number, ToothData>>(new Map());
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    if (patientId) {
      loadToothData(patientId);
    }
  }, [patientId]);

  const loadToothData = async (id: string) => {
    setIsLoading(true);
    setSelectedTooth(null);
    try {
      const res = await fetch(`/api/patients/${id}/tooth-status`);
      if (!res.ok && res.status !== 404) throw new Error('Failed to load');
      const data: ToothData[] = res.ok ? await res.json() : [];
      const map = new Map<number, ToothData>();
      data.forEach(tooth => map.set(tooth.toothNumber, tooth));
      setToothData(map);
      setHasChanges(false);
    } catch (error) {
      console.error('Error:', error);
      setToothData(new Map());
      setAlert({ type: 'error', message: 'Eroare la încărcarea datelor dentare' });
    } finally {
      setIsLoading(false);
    }
  };

  const saveChanges = async () => {
    if (!patientId) return;
    setIsSaving(true);
    try {
      const dataArray = Array.from(toothData.values()).map(tooth => ({
        toothNumber: tooth.toothNumber,
        status: tooth.status,
        surfaces: tooth.surfaces || [],
        notes: tooth.notes || ''
      }));
      
      const res = await fetch(`/api/patients/${patientId}/tooth-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teeth: dataArray })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save');
      }
      
      setAlert({ type: 'success', message: 'Starea dentară a fost salvată cu succes!' });
      setHasChanges(false);
      setTimeout(() => setAlert(null), 3000);
    } catch (error: any) {
      console.error('Error:', error);
      setAlert({ type: 'error', message: error.message || 'Eroare la salvare' });
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
    if (confirm('Sigur vrei să resetezi toate datele dentare pentru acest pacient?')) {
      setToothData(new Map());
      setHasChanges(true);
    }
  };

  const selectedToothData = selectedTooth ? toothData.get(selectedTooth) : undefined;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 flex justify-center">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Se încarcă datele dentare...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hartă Dentară</h3>
            {patientName && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{patientName}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {hasChanges && (
            <button
              onClick={resetChart}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
          <button
            onClick={saveChanges}
            disabled={!hasChanges || isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              hasChanges && !isSaving
                ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Se salvează...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvează
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`rounded-lg p-4 flex items-start gap-3 ${
          alert.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
          alert.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
          'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex-shrink-0 mt-0.5">
            {alert.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" /> :
             alert.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" /> :
             <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          </div>
          <div className="flex-1">
            <p className={`font-medium ${
              alert.type === 'success' ? 'text-green-900 dark:text-green-200' :
              alert.type === 'error' ? 'text-red-900 dark:text-red-200' :
              'text-blue-900 dark:text-blue-200'
            }`}>
              {alert.message}
            </p>
          </div>
          <button onClick={() => setAlert(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Tooth Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="mb-8">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">Maxilar Superior</p>
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

        <div className="border-t-2 border-gray-200 dark:border-gray-700 relative my-6">
          <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-4 text-xs text-gray-500 dark:text-gray-400">
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
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-4">Maxilar Inferior</p>
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border-2 ${
                  status === 'HEALTHY' ? 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600' :
                  status === 'CAVITY' ? 'bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-500' :
                  status === 'CROWN' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-500' :
                  status === 'TREATED' ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-400 dark:border-orange-500' :
                  status === 'IMPLANT' ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-400 dark:border-purple-500' :
                  status === 'BRIDGE' ? 'bg-green-50 dark:bg-green-900/30 border-green-400 dark:border-green-500' :
                  'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`} />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooth Editor */}
      {selectedTooth && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Editează Dintele #{selectedTooth}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <button
                key={status}
                onClick={() => updateToothStatus(status as ToothStatus)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedToothData?.status === status
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-700'
                }`}
              >
                <div className="font-medium text-sm text-gray-900 dark:text-white">{label}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}