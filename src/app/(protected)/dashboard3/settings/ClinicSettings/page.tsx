"use client";
import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  Save,
  Loader2,
  FileText,
  Upload,
  Image,
  AlertCircle,
  CheckCircle,
  X,
  Info
} from 'lucide-react';

// Types
interface ClinicSettings {
  // Basic Information
  clinicName: string;
  tagline?: string;
  description?: string;
  
  // Contact Information
  phone: string;
  alternatePhone?: string;
  email: string;
  website?: string;
  
  // Address
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Legal Information
  taxId: string;
  licenseNumber: string;
  registrationNumber?: string;
  vatNumber?: string;
  
  // Additional Settings
  appointmentDuration: number;
  appointmentBuffer: number;
  maxAdvanceBookingDays: number;
  cancellationPolicyHours: number;
  
  // Branding
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

const ClinicSettingsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Clinic Settings State
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>({
    clinicName: '',
    tagline: '',
    description: '',
    phone: '',
    alternatePhone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'România',
    taxId: '',
    licenseNumber: '',
    registrationNumber: '',
    vatNumber: '',
    appointmentDuration: 30,
    appointmentBuffer: 15,
    maxAdvanceBookingDays: 90,
    cancellationPolicyHours: 24,
    logoUrl: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981'
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, fetch from API:
      // const response = await fetch('/api/settings/clinic');
      // const data = await response.json();
      // setClinicSettings(data.clinic);
      
    } catch (error) {
      console.error('Error loading settings:', error);
      setAlert({ type: 'error', message: 'Eroare la încărcarea setărilor' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveClinicSettings = async () => {
    setIsSaving(true);
    try {
      // Validate required fields
      if (!clinicSettings.clinicName || !clinicSettings.email || !clinicSettings.phone) {
        throw new Error('Vă rugăm completați toate câmpurile obligatorii');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real implementation:
      // const response = await fetch('/api/settings/clinic', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(clinicSettings)
      // });

      setAlert({ type: 'success', message: 'Setările clinicii au fost salvate cu succes!' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setAlert({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Eroare la salvarea setărilor' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Se încarcă setările...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Setări Clinică
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configurează informațiile clinicii
            </p>
          </div>
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
             <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
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
          <button onClick={() => setAlert(null)} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="border-b dark:border-gray-700 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Logo și Branding
            </h3>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                  {clinicSettings.logoUrl ? (
                    <img src={clinicSettings.logoUrl} alt="Logo" className="max-w-full max-h-full" />
                  ) : (
                    <Image className="w-8 h-8 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors">
                  <Upload className="w-4 h-4" />
                  Încarcă Logo
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  PNG, JPG sau SVG. Maxim 2MB. Dimensiune recomandată: 500x500px
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Informații Generale
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Număr Licență *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={clinicSettings.licenseNumber}
                    onChange={(e) => setClinicSettings({ ...clinicSettings, licenseNumber: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Număr Înregistrare Registrul Comerțului
                </label>
                <input
                  type="text"
                  value={clinicSettings.registrationNumber}
                  onChange={(e) => setClinicSettings({ ...clinicSettings, registrationNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                  placeholder="J00/0000/2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cod TVA
                </label>
                <input
                  type="text"
                  value={clinicSettings.vatNumber}
                  onChange={(e) => setClinicSettings({ ...clinicSettings, vatNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                  placeholder="RO12345678"
                />
              </div>
            </div>
          </div>

          {/* Appointment Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Setări Programări
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Durata Standard Programare (minute)
                </label>
                <select
                  value={clinicSettings.appointmentDuration}
                  onChange={(e) => setClinicSettings({ ...clinicSettings, appointmentDuration: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                >
                  <option value="15">15 minute</option>
                  <option value="30">30 minute</option>
                  <option value="45">45 minute</option>
                  <option value="60">60 minute</option>
                  <option value="90">90 minute</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timp Buffer între Programări (minute)
                </label>
                <select
                  value={clinicSettings.appointmentBuffer}
                  onChange={(e) => setClinicSettings({ ...clinicSettings, appointmentBuffer: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                >
                  <option value="0">Fără buffer</option>
                  <option value="5">5 minute</option>
                  <option value="10">10 minute</option>
                  <option value="15">15 minute</option>
                  <option value="30">30 minute</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Programare în Avans Maxim (zile)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={clinicSettings.maxAdvanceBookingDays}
                  onChange={(e) => setClinicSettings({ ...clinicSettings, maxAdvanceBookingDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Anulare Înainte de (ore)
                </label>
                <input
                  type="number"
                  min="0"
                  max="168"
                  value={clinicSettings.cancellationPolicyHours}
                  onChange={(e) => setClinicSettings({ ...clinicSettings, cancellationPolicyHours: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t dark:border-gray-700">
            <button
              onClick={handleSaveClinicSettings}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Se salvează...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvează Setările Clinicii
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicSettingsPage;