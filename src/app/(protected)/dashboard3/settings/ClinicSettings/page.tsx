// src/app/(dashboard)/settings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  Clock,
  Calendar,
  Save,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  Upload,
  Image,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Trash2,
  Coffee,
  Sun,
  Moon,
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

interface DaySchedule {
  isWorking: boolean;
  openTime?: string;
  closeTime?: string;
  breakStart?: string;
  breakEnd?: string;
  slots?: TimeSlot[];
}

interface TimeSlot {
  start: string;
  end: string;
  type: 'working' | 'break';
}

interface Holiday {
  id: string;
  date: string;
  name: string;
  isRecurring: boolean;
}

interface SpecialHours {
  id: string;
  date: string;
  openTime: string;
  closeTime: string;
  reason: string;
}

interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

const ClinicSettingsPage = () => {
  const [activeTab, setActiveTab] = useState<'clinic' | 'hours' | 'holidays'>('clinic');
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

  // Working Hours State
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: { isWorking: true, openTime: '09:00', closeTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    tuesday: { isWorking: true, openTime: '09:00', closeTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    wednesday: { isWorking: true, openTime: '09:00', closeTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    thursday: { isWorking: true, openTime: '09:00', closeTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    friday: { isWorking: true, openTime: '09:00', closeTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    saturday: { isWorking: true, openTime: '09:00', closeTime: '14:00' },
    sunday: { isWorking: false }
  });

  // Holidays State
  const [holidays, setHolidays] = useState<Holiday[]>([
    { id: '1', date: '2024-12-25', name: 'Crăciun', isRecurring: true },
    { id: '2', date: '2024-01-01', name: 'Anul Nou', isRecurring: true },
    { id: '3', date: '2024-05-01', name: '1 Mai', isRecurring: true }
  ]);

  // Special Hours State
  const [specialHours, setSpecialHours] = useState<SpecialHours[]>([]);
  
  // Form states for adding new items
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '', isRecurring: false });
  const [newSpecialHour, setNewSpecialHour] = useState({ date: '', openTime: '', closeTime: '', reason: '' });
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [showSpecialHoursForm, setShowSpecialHoursForm] = useState(false);

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
      // setWorkingHours(data.workingHours);
      // setHolidays(data.holidays);
      
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

  const handleSaveWorkingHours = async () => {
    setIsSaving(true);
    try {
      // Validate working hours
      for (const [day, schedule] of Object.entries(workingHours)) {
        if (schedule.isWorking && (!schedule.openTime || !schedule.closeTime)) {
          throw new Error(`Vă rugăm completați programul pentru ${day}`);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAlert({ type: 'success', message: 'Programul de lucru a fost salvat cu succes!' });
    } catch (error) {
      console.error('Error saving working hours:', error);
      setAlert({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Eroare la salvarea programului' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddHoliday = () => {
    if (!newHoliday.date || !newHoliday.name) {
      setAlert({ type: 'error', message: 'Completați data și numele sărbătorii' });
      return;
    }

    const holiday: Holiday = {
      id: Date.now().toString(),
      ...newHoliday
    };

    setHolidays([...holidays, holiday]);
    setNewHoliday({ date: '', name: '', isRecurring: false });
    setShowHolidayForm(false);
  };

  const handleRemoveHoliday = (id: string) => {
    setHolidays(holidays.filter(h => h.id !== id));
  };

  const handleAddSpecialHours = () => {
    if (!newSpecialHour.date || !newSpecialHour.openTime || !newSpecialHour.closeTime) {
      setAlert({ type: 'error', message: 'Completați toate câmpurile' });
      return;
    }

    const special: SpecialHours = {
      id: Date.now().toString(),
      ...newSpecialHour
    };

    setSpecialHours([...specialHours, special]);
    setNewSpecialHour({ date: '', openTime: '', closeTime: '', reason: '' });
    setShowSpecialHoursForm(false);
  };

  const handleRemoveSpecialHours = (id: string) => {
    setSpecialHours(specialHours.filter(s => s.id !== id));
  };

  const updateDaySchedule = (day: keyof WorkingHours, field: keyof DaySchedule, value: any) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const applyToAllDays = (sourceDay: keyof WorkingHours) => {
    const sourceSchedule = workingHours[sourceDay];
    const updatedHours = { ...workingHours };
    
    Object.keys(updatedHours).forEach(day => {
      if (day !== sourceDay && day !== 'sunday') {
        updatedHours[day as keyof WorkingHours] = { ...sourceSchedule };
      }
    });
    
    setWorkingHours(updatedHours);
    setAlert({ type: 'info', message: 'Programul a fost aplicat pentru toate zilele lucrătoare' });
  };

  const dayNames = {
    monday: 'Luni',
    tuesday: 'Marți',
    wednesday: 'Miercuri',
    thursday: 'Joi',
    friday: 'Vineri',
    saturday: 'Sâmbătă',
    sunday: 'Duminică'
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
              Configurează informațiile și programul clinicii
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

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-8">
          {[
            { id: 'clinic', label: 'Informații Clinică', icon: Building2 },
            { id: 'hours', label: 'Program de Lucru', icon: Clock },
            { id: 'holidays', label: 'Sărbători și Ore Speciale', icon: Calendar }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        {/* Clinic Information Tab */}
        {activeTab === 'clinic' && (
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
        )}

        {/* Working Hours Tab */}
        {activeTab === 'hours' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Program de Lucru Săptămânal
              </h3>
              <button
                onClick={handleSaveWorkingHours}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Se salvează...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvează Program
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              {(Object.keys(dayNames) as Array<keyof WorkingHours>).map((day) => {
                const schedule = workingHours[day];
                const dayLabel = dayNames[day];
                
                return (
                  <div key={day} className="border dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white text-lg">
                        {dayLabel}
                      </h4>
                      <div className="flex items-center gap-4">
                        {day === 'monday' && (
                          <button
                            onClick={() => applyToAllDays('monday')}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Aplică pentru toate zilele
                          </button>
                        )}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={schedule.isWorking}
                            onChange={(e) => updateDaySchedule(day, 'isWorking', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Zi Lucrătoare
                          </span>
                        </label>
                      </div>
                    </div>

                    {schedule.isWorking && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            <Sun className="inline w-3 h-3 mr-1" />
                            Deschidere
                          </label>
                          <input
                            type="time"
                            value={schedule.openTime || '09:00'}
                            onChange={(e) => updateDaySchedule(day, 'openTime', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            <Moon className="inline w-3 h-3 mr-1" />
                            Închidere
                          </label>
                          <input
                            type="time"
                            value={schedule.closeTime || '18:00'}
                            onChange={(e) => updateDaySchedule(day, 'closeTime', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            <Coffee className="inline w-3 h-3 mr-1" />
                            Pauză Start
                          </label>
                          <input
                            type="time"
                            value={schedule.breakStart || ''}
                            onChange={(e) => updateDaySchedule(day, 'breakStart', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            <Coffee className="inline w-3 h-3 mr-1" />
                            Pauză Sfârșit
                          </label>
                          <input
                            type="time"
                            value={schedule.breakEnd || ''}
                            onChange={(e) => updateDaySchedule(day, 'breakEnd', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Working Hours Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                Sumar Program
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-blue-800 dark:text-blue-300">
                {(Object.keys(dayNames) as Array<keyof WorkingHours>).map((day) => {
                  const schedule = workingHours[day];
                  if (!schedule.isWorking) return null;
                  return (
                    <div key={day}>
                      <span className="font-medium">{dayNames[day]}:</span> {schedule.openTime} - {schedule.closeTime}
                      {schedule.breakStart && schedule.breakEnd && (
                        <span className="text-xs"> (Pauză: {schedule.breakStart} - {schedule.breakEnd})</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Holidays and Special Hours Tab */}
        {activeTab === 'holidays' && (
          <div className="space-y-6">
            {/* Holidays Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sărbători și Zile Libere
                </h3>
                <button
                  onClick={() => setShowHolidayForm(!showHolidayForm)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adaugă Sărbătoare
                </button>
              </div>

              {showHolidayForm && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Data
                      </label>
                      <input
                        type="date"
                        value={newHoliday.date}
                        onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nume Sărbătoare
                      </label>
                      <input
                        type="text"
                        value={newHoliday.name}
                        onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                        placeholder="ex: Ziua Națională"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newHoliday.isRecurring}
                          onChange={(e) => setNewHoliday({ ...newHoliday, isRecurring: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Recurentă</span>
                      </label>
                      <button
                        onClick={handleAddHoliday}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        Adaugă
                      </button>
                      <button
                        onClick={() => {
                          setShowHolidayForm(false);
                          setNewHoliday({ date: '', name: '', isRecurring: false });
                        }}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                      >
                        Anulează
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {holidays.map(holiday => (
                  <div key={holiday.id} className="bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">{holiday.name}</h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(holiday.date).toLocaleDateString('ro-RO', {
                            day: 'numeric',
                            month: 'long',
                            year: holiday.isRecurring ? undefined : 'numeric'
                          })}
                        </p>
                        {holiday.isRecurring && (
                          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded">
                            Anual
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveHoliday(holiday.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Hours Section */}
            <div className="border-t dark:border-gray-700 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Ore Speciale
                </h3>
                <button
                  onClick={() => setShowSpecialHoursForm(!showSpecialHoursForm)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adaugă Ore Speciale
                </button>
              </div>

              {showSpecialHoursForm && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Data
                      </label>
                      <input
                        type="date"
                        value={newSpecialHour.date}
                        onChange={(e) => setNewSpecialHour({ ...newSpecialHour, date: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Deschidere
                      </label>
                      <input
                        type="time"
                        value={newSpecialHour.openTime}
                        onChange={(e) => setNewSpecialHour({ ...newSpecialHour, openTime: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Închidere
                      </label>
                      <input
                        type="time"
                        value={newSpecialHour.closeTime}
                        onChange={(e) => setNewSpecialHour({ ...newSpecialHour, closeTime: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <input
                        type="text"
                        value={newSpecialHour.reason}
                        onChange={(e) => setNewSpecialHour({ ...newSpecialHour, reason: e.target.value })}
                        placeholder="Motiv (opțional)"
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={handleAddSpecialHours}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        Adaugă
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {specialHours.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-600">
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Data</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Ore</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Motiv</th>
                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {specialHours.map(special => (
                        <tr key={special.id} className="border-b dark:border-gray-600">
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {new Date(special.date).toLocaleDateString('ro-RO')}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {special.openTime} - {special.closeTime}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {special.reason || '-'}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              onClick={() => handleRemoveSpecialHours(special.id)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Nu există ore speciale configurate
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicSettingsPage;