// src/app/(dashboard)/treatments/new/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ToothChartImages } from '@/components/treatments/teeth-visual';
import { ProcedureSelector } from '@/components/treatments/procedure-selector';
import { 
  Save, 
  Loader2, 
  FileText, 
  Activity,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  Info,
  Stethoscope,
  ClipboardList,
  Euro,
  Eye,
  Grid3x3,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Heart
} from 'lucide-react';
import SimplifiedToothChart from '@/components/treatments/simplified-tooth-chart';
import type { ProcedureItem, ProcedureCategory } from '@/config/procedures';
// Types
export type ToothSurface = 'mesial' | 'distal' | 'occlusal' | 'buccal' | 'lingual' | 'incisal';
export type ToothStatus = 'healthy' | 'treated' | 'missing' | 'cavity' | 'crown' | 'implant' | 'bridge';

interface SelectedTooth {
  number: number;
  surfaces: ToothSurface[];
}

interface ToothData {
  number: number;
  status: ToothStatus;
  procedures?: string[];
}

interface TreatmentFormData {
  chiefComplaint: string;
  diagnosis: string;
  treatmentPlan: string;
  notes: string;
  treatmentDate: string;
  discount: number;
}

interface PatientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  city?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  allergies?: string;
  medications?: string;
}

interface PatientInfo extends PatientFormData {
  id: string;
}

export default function NewTreatmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get('patientId');
  
  // State Management
  const [selectedTeeth, setSelectedTeeth] = useState<SelectedTooth[]>([]);
  const [selectedProcedures, setSelectedProcedures] = useState<ProcedureItem[]>([]);
  const [activeTab, setActiveTab] = useState<'visualization' | 'selection'>('visualization');
  const [showLabels, setShowLabels] = useState(true);
  const [showQuadrants, setShowQuadrants] = useState(true);
  const [showPatientForm, setShowPatientForm] = useState(!patientIdParam);
  
  const [treatmentData, setTreatmentData] = useState<TreatmentFormData>({
    chiefComplaint: '',
    diagnosis: '',
    treatmentPlan: '',
    notes: '',
    treatmentDate: new Date().toISOString().split('T')[0],
    discount: 0
  });

  const [patientFormData, setPatientFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    address: '',
    city: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    allergies: '',
    medications: ''
  });
  
  // Tooth status data
  const [toothData] = useState<ToothData[]>([
    { number: 3, status: 'cavity', procedures: ['Obturație necesară'] },
    { number: 14, status: 'crown', procedures: ['Coroană ceramică'] },
    { number: 19, status: 'treated', procedures: ['Tratament canal', 'Coroană'] },
    { number: 28, status: 'missing', procedures: [] },
    { number: 30, status: 'cavity', procedures: ['Obturație MOD'] },
    { number: 31, status: 'implant', procedures: ['Implant dentar'] },
  ]);
  
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [useInsurancePricing, setUseInsurancePricing] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Load patient info if ID provided
  useEffect(() => {
    if (patientIdParam) {
      loadPatientInfo(patientIdParam);
    }
  }, [patientIdParam]);

  const loadPatientInfo = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/patients/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPatientInfo(data);
        setShowPatientForm(false);
      }
    } catch (error) {
      console.error('Error loading patient:', error);
      setAlert({ type: 'error', message: 'Eroare la încărcarea datelor pacientului' });
    } finally {
      setIsLoading(false);
    }
  };

  // Save new patient
  const handleSavePatient = async () => {
    // Validate patient form
    if (!patientFormData.firstName || !patientFormData.lastName) {
      setAlert({ type: 'error', message: 'Completează numele și prenumele pacientului' });
      return;
    }
    if (!patientFormData.phone) {
      setAlert({ type: 'error', message: 'Completează numărul de telefon' });
      return;
    }
    if (!patientFormData.dateOfBirth) {
      setAlert({ type: 'error', message: 'Completează data nașterii' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...patientFormData,
          allergies: patientFormData.allergies ? patientFormData.allergies.split(',').map(a => a.trim()) : [],
          medications: patientFormData.medications ? patientFormData.medications.split(',').map(m => m.trim()) : []
        })
      });

      if (!response.ok) throw new Error('Failed to create patient');
      
      const patient = await response.json();
      setPatientInfo(patient);
      setShowPatientForm(false);
      setAlert({ type: 'success', message: 'Pacient înregistrat cu succes!' });
    } catch (error) {
      console.error('Error saving patient:', error);
      setAlert({ type: 'error', message: 'Eroare la salvarea pacientului' });
    } finally {
      setIsLoading(false);
    }
  };

  // Simple tooth selection handler - NO upper/lower sync
  const handleToothSelection = (toothNumber: number) => {
    setSelectedTeeth(prev => {
      const exists = prev.find(t => t.number === toothNumber);
      
      if (exists) {
        // Remove tooth
        return prev.filter(t => t.number !== toothNumber);
      } else {
        // Add tooth
        return [...prev, { number: toothNumber, surfaces: [] }];
      }
    });
  };

  // Handler for ToothChartImages (Chart 1)
  const handleChart1Select = (toothNumber: number) => {
    handleToothSelection(toothNumber);
  };

  // Handler for multiple selection from Chart 1
  const handleChart1MultiSelect = (teethNumbers: number[]) => {
    const newSelection: SelectedTooth[] = teethNumbers.map(num => ({
      number: num,
      surfaces: []
    }));
    setSelectedTeeth(newSelection);
  };

  // Handler for SimplifiedToothChart (Chart 2)
  const handleChart2SelectionChange = (teeth: SelectedTooth[]) => {
    setSelectedTeeth(teeth);
  };

  // Procedure handlers
  const handleProcedureAdd = (procedure: ProcedureItem) => {
    if (!selectedProcedures.find(p => p.id === procedure.id)) {
      setSelectedProcedures([...selectedProcedures, procedure]);
    }
  };

  const handleProcedureRemove = (procedureId: string) => {
    setSelectedProcedures(prev => prev.filter(p => p.id !== procedureId));
  };

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    let duration = 0;

    selectedProcedures.forEach(proc => {
      const multiplier = proc.perTooth ? selectedTeeth.length || 1 : 1;
      const price = useInsurancePricing && proc.insuranceCost ? proc.insuranceCost : proc.defaultCost;
      subtotal += price * multiplier;
      duration += proc.estimatedDurationMinutes * multiplier;
    });

    const total = Math.max(0, subtotal - treatmentData.discount);
    
    return { subtotal, total, duration };
  };

  // Validation
  const validateForm = () => {
    if (!patientInfo) {
      setAlert({ type: 'error', message: 'Înregistrează mai întâi pacientul' });
      return false;
    }
    if (!treatmentData.chiefComplaint.trim()) {
      setAlert({ type: 'error', message: 'Completează simptomatologia' });
      return false;
    }
    if (!treatmentData.diagnosis.trim()) {
      setAlert({ type: 'error', message: 'Completează diagnosticul' });
      return false;
    }
    if (selectedTeeth.length === 0) {
      setAlert({ type: 'error', message: 'Selectează cel puțin un dinte' });
      return false;
    }
    if (selectedProcedures.length === 0) {
      setAlert({ type: 'error', message: 'Selectează cel puțin o procedură' });
      return false;
    }
    return true;
  };

  // Save treatment
  const handleSaveTreatment = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // Create treatment
      const treatmentResponse = await fetch('/api/treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patientInfo!.id,
          ...treatmentData,
          treatmentDate: new Date(treatmentData.treatmentDate)
        })
      });

      if (!treatmentResponse.ok) throw new Error('Failed to create treatment');
      const treatment = await treatmentResponse.json();

      // Add procedures for each tooth
      for (const procedure of selectedProcedures) {
        if (procedure.perTooth) {
          for (const tooth of selectedTeeth) {
            await fetch(`/api/treatments/${treatment.id}/items`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                procedureId: procedure.id,
                toothNumbers: [tooth.number],
                toothSurfaces: tooth.surfaces || [],
                quantity: 1,
                unitCost: useInsurancePricing && procedure.insuranceCost ? 
                  procedure.insuranceCost : procedure.defaultCost
              })
            });
          }
        } else {
          await fetch(`/api/treatments/${treatment.id}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              procedureId: procedure.id,
              toothNumbers: selectedTeeth.map(t => t.number),
              toothSurfaces: selectedTeeth.flatMap(t => t.surfaces || []),
              quantity: 1,
              unitCost: useInsurancePricing && procedure.insuranceCost ? 
                procedure.insuranceCost : procedure.defaultCost
            })
          });
        }
      }

      setAlert({ type: 'success', message: 'Tratament salvat cu succes!' });
      
      setTimeout(() => {
        router.push(`/treatments/${treatment.id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error saving treatment:', error);
      setAlert({ type: 'error', message: 'Eroare la salvarea tratamentului' });
    } finally {
      setIsSaving(false);
    }
  };

  const { subtotal, total, duration } = calculateTotals();

  // Adapt ProcedureItem[] to shape expected by ProcedureSelector (surfaces: string[] | undefined)
  const selectedProceduresForSelector = selectedProcedures.map((p) => {
    const { surfaces, ...rest } = p as ProcedureItem & { surfaces?: boolean };
    return { ...rest, surfaces: undefined as string[] | undefined };
  });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins} min`;
  };
  // Get selected teeth numbers for visualization
  const selectedTeethNumbers = selectedTeeth.map(t => t.number);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tratament Nou
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Înregistrează pacient și creează plan de tratament
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveTreatment}
          disabled={isSaving || !patientInfo}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 font-medium"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Se salvează...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvează Tratament
            </>
          )}
        </button>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`rounded-lg p-4 flex items-start gap-3 ${
          alert.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
          alert.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
          'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
        }`}>
          {alert.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
           alert.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-600" /> :
           <Info className="w-5 h-5 text-blue-600" />}
          <div className="flex-1">
            <p className={`font-medium ${
              alert.type === 'success' ? 'text-green-900 dark:text-green-200' :
              alert.type === 'error' ? 'text-red-900 dark:text-red-200' :
              'text-blue-900 dark:text-blue-200'
            }`}>
              {alert.message}
            </p>
          </div>
          <button onClick={() => setAlert(null)}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>
      )}

      {/* Patient Registration Form or Info */}
      {showPatientForm ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Înregistrare Pacient Nou
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nume *
              </label>
              <input
                type="text"
                value={patientFormData.lastName}
                onChange={(e) => setPatientFormData({...patientFormData, lastName: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="ex: Popescu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prenume *
              </label>
              <input
                type="text"
                value={patientFormData.firstName}
                onChange={(e) => setPatientFormData({...patientFormData, firstName: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="ex: Ion"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefon *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={patientFormData.phone}
                  onChange={(e) => setPatientFormData({...patientFormData, phone: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="07XX XXX XXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={patientFormData.email}
                  onChange={(e) => setPatientFormData({...patientFormData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="pacient@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data nașterii *
              </label>
              <input
                type="date"
                value={patientFormData.dateOfBirth}
                onChange={(e) => setPatientFormData({...patientFormData, dateOfBirth: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gen *
              </label>
              <select
                value={patientFormData.gender}
                onChange={(e) => setPatientFormData({...patientFormData, gender: e.target.value as any})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="MALE">Masculin</option>
                <option value="FEMALE">Feminin</option>
                <option value="OTHER">Altul</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alergii
              </label>
              <input
                type="text"
                value={patientFormData.allergies}
                onChange={(e) => setPatientFormData({...patientFormData, allergies: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="ex: Penicilină, Latex (separate prin virgulă)"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSavePatient}
              disabled={isLoading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Se salvează...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Înregistrează Pacient
                </>
              )}
            </button>
          </div>
        </div>
      ) : patientInfo && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
                  {patientInfo.firstName} {patientInfo.lastName}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {patientInfo.email} • {patientInfo.phone}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={treatmentData.treatmentDate}
                onChange={(e) => setTreatmentData({...treatmentData, treatmentDate: e.target.value})}
                className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>
          {patientInfo.allergies && (
            <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                <Heart className="inline w-4 h-4 mr-1" />
                Alergii: {patientInfo.allergies}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Treatment Information Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-blue-600" />
          Informații Medicale
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Simptomatologie *
            </label>
            <input
              type="text"
              value={treatmentData.chiefComplaint}
              onChange={(e) => setTreatmentData({...treatmentData, chiefComplaint: e.target.value})}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="ex: Durere acută la masticație"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Diagnostic *
            </label>
            <input
              type="text"
              value={treatmentData.diagnosis}
              onChange={(e) => setTreatmentData({...treatmentData, diagnosis: e.target.value})}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="ex: Carie profundă dinte 36"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Plan de Tratament
            </label>
            <textarea
              value={treatmentData.treatmentPlan}
              onChange={(e) => setTreatmentData({...treatmentData, treatmentPlan: e.target.value})}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              rows={3}
              placeholder="Descriere detaliată a tratamentului propus..."
            />
          </div>
        </div>
      </div>

      {/* Tooth Selection Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Selectează Dinții Problematici
        </h3>

        {/* Tabs pentru switch între vizualizări */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('visualization')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'visualization'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <Eye className="w-4 h-4" />
              Vizualizare Simplă
            </button>
            <button
              onClick={() => setActiveTab('selection')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'selection'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              Vizualizare Avansată
            </button>
          </nav>
        </div>

        {/* Tab Content - Both charts synchronized but without upper/lower auto-selection */}
        {activeTab === 'visualization' ? (
          <div>
            {/* Controls */}
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Afișează Numere</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showQuadrants}
                  onChange={(e) => setShowQuadrants(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Afișează Cadrane</span>
              </label>
            </div>
            
            {/* Chart 1 - ToothChartImages */}
            <ToothChartImages
              selectedTeeth={selectedTeethNumbers}
              toothData={toothData}
              onToothSelect={handleChart1Select}
              onMultiSelect={handleChart1MultiSelect}
              showLabels={showLabels}
              showQuadrants={showQuadrants}
              readOnly={false}
            />
          </div>
        ) : (
          /* Chart 2 - SimplifiedToothChart */
          <SimplifiedToothChart
            selectedTeeth={selectedTeeth}
            toothData={toothData}
            onSelectionChange={handleChart2SelectionChange}
            showLabels={true}
            showQuadrants={true}
            readOnly={false}
          />
        )}

        {/* Selected teeth summary */}
        {selectedTeeth.length > 0 && (
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-2">
              Dinți selectați ({selectedTeeth.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedTeeth.sort((a, b) => a.number - b.number).map(tooth => (
                <div
                  key={tooth.number}
                  className="px-2 py-1 bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg text-sm border border-gray-300 dark:border-gray-600"
                >
                  <span className="font-medium">#{tooth.number}</span>
                  {tooth.surfaces.length > 0 && (
                    <span className="ml-1 text-xs opacity-75">
                      ({tooth.surfaces.join(',')})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Procedure Selection */}
      <ProcedureSelector
        selectedProcedures={selectedProceduresForSelector}
        onProcedureAdd={handleProcedureAdd}
        onProcedureRemove={handleProcedureRemove}
        useInsurancePricing={useInsurancePricing}
        showQuickSelect={true}
      />

      {/* Cost Summary */}
      {(selectedTeeth.length > 0 && selectedProcedures.length > 0) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Euro className="w-5 h-5 text-blue-600" />
            Sumar Tratament
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Dinți Afectați</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {selectedTeeth.length}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Proceduri</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {selectedProcedures.length}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Durată Estimată</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatDuration(duration)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Cost Total</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {total} RON
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}