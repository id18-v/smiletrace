// src/app/(dashboard)/settings/notifications/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Bell,
  Clock,
  MessageSquare,
  Save,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  Code,
  FileText,
  Calendar,
  CreditCard,
  User,
  Smartphone,
  Monitor,
  TestTube,
  Plus,
  Trash2,
  Copy,
  Info,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

// Types
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: TemplateVariable[];
  category: 'appointment' | 'reminder' | 'financial' | 'general';
  isActive: boolean;
}

interface TemplateVariable {
  key: string;
  label: string;
  example: string;
  description: string;
}

interface NotificationSettings {
  // Reminder Settings
  appointmentReminder: {
    enabled: boolean;
    advanceHours: number;
    channels: NotificationChannel[];
  };
  appointmentConfirmation: {
    enabled: boolean;
    immediate: boolean;
    channels: NotificationChannel[];
  };
  cancellationNotice: {
    enabled: boolean;
    channels: NotificationChannel[];
  };
  
  // Financial Notifications
  paymentReceipt: {
    enabled: boolean;
    channels: NotificationChannel[];
  };
  paymentReminder: {
    enabled: boolean;
    daysAfterDue: number;
    channels: NotificationChannel[];
  };
  
  // SMS Settings
  smsEnabled: boolean;
  smsProvider: 'twilio' | 'vonage' | 'textmagic';
  smsCredentials: {
    accountSid?: string;
    authToken?: string;
    phoneNumber?: string;
  };
  
  // Email Settings
  emailEnabled: boolean;
  emailProvider: 'smtp' | 'sendgrid' | 'mailgun';
  emailFrom: string;
  emailFromName: string;
  smtpSettings?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
  };
}

interface NotificationChannel {
  type: 'email' | 'sms' | 'push';
  enabled: boolean;
}

interface TestEmailData {
  to: string;
  template: string;
  testData: Record<string, string>;
}

const EmailNotificationsPage = () => {
  const [activeTab, setActiveTab] = useState<'templates' | 'settings' | 'test'>('templates');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Email Templates State
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Confirmare Programare',
      subject: 'Programarea dvs. la {{clinicName}} - {{appointmentDate}}',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #3B82F6; color: white; padding: 20px; text-align: center;">
            <h1>Confirmare Programare</h1>
          </div>
          <div style="padding: 20px;">
            <p>Bună ziua {{patientName}},</p>
            <p>Vă confirmăm programarea la clinica noastră:</p>
            <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Data:</strong> {{appointmentDate}}</p>
              <p><strong>Ora:</strong> {{appointmentTime}}</p>
              <p><strong>Medic:</strong> {{doctorName}}</p>
              <p><strong>Tip consultație:</strong> {{appointmentType}}</p>
            </div>
            <p>Vă rugăm să ajungeți cu 10 minute înainte de ora programată.</p>
            <p>Pentru anulare sau reprogramare, contactați-ne la {{clinicPhone}}.</p>
            <p>Cu stimă,<br>{{clinicName}}</p>
          </div>
        </div>
      `,
      textContent: `Confirmare Programare\n\nBună ziua {{patientName}},\n\nVă confirmăm programarea:\nData: {{appointmentDate}}\nOra: {{appointmentTime}}\nMedic: {{doctorName}}\n\nCu stimă,\n{{clinicName}}`,
      variables: [
        { key: '{{patientName}}', label: 'Nume Pacient', example: 'Ion Popescu', description: 'Numele complet al pacientului' },
        { key: '{{appointmentDate}}', label: 'Data Programare', example: '25 Martie 2024', description: 'Data programării' },
        { key: '{{appointmentTime}}', label: 'Ora Programare', example: '14:30', description: 'Ora programării' },
        { key: '{{doctorName}}', label: 'Nume Medic', example: 'Dr. Maria Ionescu', description: 'Numele medicului' },
        { key: '{{appointmentType}}', label: 'Tip Consultație', example: 'Control de rutină', description: 'Tipul consultației' },
        { key: '{{clinicName}}', label: 'Nume Clinică', example: 'Dental Care', description: 'Numele clinicii' },
        { key: '{{clinicPhone}}', label: 'Telefon Clinică', example: '0123 456 789', description: 'Numărul de telefon' }
      ],
      category: 'appointment',
      isActive: true
    },
    {
      id: '2',
      name: 'Reminder Programare',
      subject: 'Reminder: Programare mâine la {{clinicName}}',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #10B981; color: white; padding: 20px; text-align: center;">
            <h1>Reminder Programare</h1>
          </div>
          <div style="padding: 20px;">
            <p>Bună ziua {{patientName}},</p>
            <p>Vă reamintim că aveți o programare mâine:</p>
            <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Data:</strong> {{appointmentDate}}</p>
              <p><strong>Ora:</strong> {{appointmentTime}}</p>
              <p><strong>Medic:</strong> {{doctorName}}</p>
            </div>
            <p>Dacă nu puteți ajunge, vă rugăm să ne anunțați.</p>
            <p>Cu stimă,<br>{{clinicName}}</p>
          </div>
        </div>
      `,
      textContent: `Reminder Programare\n\nBună ziua {{patientName}},\n\nVă reamintim programarea de mâine:\nData: {{appointmentDate}}\nOra: {{appointmentTime}}\nMedic: {{doctorName}}\n\nCu stimă,\n{{clinicName}}`,
      variables: [
        { key: '{{patientName}}', label: 'Nume Pacient', example: 'Ion Popescu', description: 'Numele complet al pacientului' },
        { key: '{{appointmentDate}}', label: 'Data Programare', example: '25 Martie 2024', description: 'Data programării' },
        { key: '{{appointmentTime}}', label: 'Ora Programare', example: '14:30', description: 'Ora programării' },
        { key: '{{doctorName}}', label: 'Nume Medic', example: 'Dr. Maria Ionescu', description: 'Numele medicului' },
        { key: '{{clinicName}}', label: 'Nume Clinică', example: 'Dental Care', description: 'Numele clinicii' }
      ],
      category: 'reminder',
      isActive: true
    },
    {
      id: '3',
      name: 'Bon Fiscal',
      subject: 'Bonul dvs. fiscal - {{receiptNumber}}',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #8B5CF6; color: white; padding: 20px; text-align: center;">
            <h1>Bon Fiscal</h1>
          </div>
          <div style="padding: 20px;">
            <p>Bună ziua {{patientName}},</p>
            <p>Vă trimitem bonul fiscal pentru serviciile efectuate:</p>
            <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Număr bon:</strong> {{receiptNumber}}</p>
              <p><strong>Data:</strong> {{receiptDate}}</p>
              <p><strong>Suma totală:</strong> {{totalAmount}} RON</p>
              <p><strong>Suma plătită:</strong> {{paidAmount}} RON</p>
              <p><strong>Rest de plată:</strong> {{balanceAmount}} RON</p>
            </div>
            <p>Bonul complet este atașat acestui email în format PDF.</p>
            <p>Vă mulțumim pentru încredere!</p>
            <p>Cu stimă,<br>{{clinicName}}</p>
          </div>
        </div>
      `,
      textContent: `Bon Fiscal\n\nBună ziua {{patientName}},\n\nBon fiscal nr. {{receiptNumber}}\nData: {{receiptDate}}\nTotal: {{totalAmount}} RON\nPlătit: {{paidAmount}} RON\n\nCu stimă,\n{{clinicName}}`,
      variables: [
        { key: '{{patientName}}', label: 'Nume Pacient', example: 'Ion Popescu', description: 'Numele pacientului' },
        { key: '{{receiptNumber}}', label: 'Număr Bon', example: 'RCP-2024-001', description: 'Numărul bonului fiscal' },
        { key: '{{receiptDate}}', label: 'Data Bon', example: '25 Martie 2024', description: 'Data emiterii' },
        { key: '{{totalAmount}}', label: 'Suma Totală', example: '500.00', description: 'Suma totală' },
        { key: '{{paidAmount}}', label: 'Suma Plătită', example: '500.00', description: 'Suma plătită' },
        { key: '{{balanceAmount}}', label: 'Rest de Plată', example: '0.00', description: 'Suma rămasă' },
        { key: '{{clinicName}}', label: 'Nume Clinică', example: 'Dental Care', description: 'Numele clinicii' }
      ],
      category: 'financial',
      isActive: true
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState<'html' | 'text'>('html');
  const [showVariables, setShowVariables] = useState(true);

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    appointmentReminder: {
      enabled: true,
      advanceHours: 24,
      channels: [
        { type: 'email', enabled: true },
        { type: 'sms', enabled: true }
      ]
    },
    appointmentConfirmation: {
      enabled: true,
      immediate: true,
      channels: [
        { type: 'email', enabled: true },
        { type: 'sms', enabled: false }
      ]
    },
    cancellationNotice: {
      enabled: true,
      channels: [
        { type: 'email', enabled: true },
        { type: 'sms', enabled: true }
      ]
    },
    paymentReceipt: {
      enabled: true,
      channels: [
        { type: 'email', enabled: true }
      ]
    },
    paymentReminder: {
      enabled: true,
      daysAfterDue: 7,
      channels: [
        { type: 'email', enabled: true },
        { type: 'sms', enabled: false }
      ]
    },
    smsEnabled: true,
    smsProvider: 'twilio',
    smsCredentials: {
      accountSid: '',
      authToken: '',
      phoneNumber: ''
    },
    emailEnabled: true,
    emailProvider: 'smtp',
    emailFrom: 'noreply@clinica.ro',
    emailFromName: 'Dental Care',
    smtpSettings: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      user: '',
      password: ''
    }
  });

  // Test Email State
  const [testEmailData, setTestEmailData] = useState<TestEmailData>({
    to: '',
    template: '',
    testData: {}
  });
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Load templates and settings from API
    } catch (error) {
      console.error('Error loading settings:', error);
      setAlert({ type: 'error', message: 'Eroare la încărcarea setărilor' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update template in list
      setTemplates(templates.map(t => 
        t.id === selectedTemplate.id ? selectedTemplate : t
      ));
      
      setAlert({ type: 'success', message: 'Template salvat cu succes!' });
      setEditMode(false);
    } catch (error) {
      console.error('Error saving template:', error);
      setAlert({ type: 'error', message: 'Eroare la salvarea template-ului' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAlert({ type: 'success', message: 'Setările de notificare au fost salvate!' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setAlert({ type: 'error', message: 'Eroare la salvarea setărilor' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailData.to || !testEmailData.template) {
      setAlert({ type: 'error', message: 'Selectați un template și introduceți adresa de email' });
      return;
    }

    setIsSendingTest(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAlert({ type: 'success', message: `Email de test trimis către ${testEmailData.to}` });
    } catch (error) {
      console.error('Error sending test email:', error);
      setAlert({ type: 'error', message: 'Eroare la trimiterea email-ului de test' });
    } finally {
      setIsSendingTest(false);
    }
  };

  const insertVariable = (variable: string) => {
    if (!selectedTemplate || !editMode) return;
    
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = previewMode === 'html' ? selectedTemplate.htmlContent : selectedTemplate.textContent;
    const newContent = content.substring(0, start) + variable + content.substring(end);
    
    if (previewMode === 'html') {
      setSelectedTemplate({ ...selectedTemplate, htmlContent: newContent });
    } else {
      setSelectedTemplate({ ...selectedTemplate, textContent: newContent });
    }
  };

  const updateNotificationChannel = (
    setting: keyof NotificationSettings,
    channelType: 'email' | 'sms' | 'push',
    enabled: boolean
  ) => {
    const currentSetting = notificationSettings[setting] as any;
    if (currentSetting.channels) {
      const updatedChannels = currentSetting.channels.map((ch: NotificationChannel) =>
        ch.type === channelType ? { ...ch, enabled } : ch
      );
      
      setNotificationSettings({
        ...notificationSettings,
        [setting]: {
          ...currentSetting,
          channels: updatedChannels
        }
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'appointment': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'reminder': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'financial': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
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
            <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Email & Notificări
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestionează template-urile de email și setările de notificare
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
            { id: 'templates', label: 'Template-uri Email', icon: FileText },
            { id: 'settings', label: 'Setări Notificări', icon: Bell },
            { id: 'test', label: 'Test Email', icon: TestTube }
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Email Templates Tab */}
        {activeTab === 'templates' && (
          <>
            {/* Template List */}
            <div className="lg:col-span-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Template-uri Disponibile
                </h3>
                <div className="space-y-2">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTemplate?.id === template.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {template.name}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(template.category)}`}>
                          {template.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {template.subject}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`inline-flex items-center gap-1 text-xs ${
                          template.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            template.isActive ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          {template.isActive ? 'Activ' : 'Inactiv'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Template Editor */}
            <div className="lg:col-span-8">
              {selectedTemplate ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Editor Template
                    </h3>
                    <div className="flex gap-2">
                      {!editMode ? (
                        <button
                          onClick={() => setEditMode(true)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Code className="w-4 h-4" />
                          Editează
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditMode(false)}
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                          >
                            Anulează
                          </button>
                          <button
                            onClick={handleSaveTemplate}
                            disabled={isSaving}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                          >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Salvează
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Template Details */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nume Template
                      </label>
                      <input
                        type="text"
                        value={selectedTemplate.name}
                        onChange={(e) => setSelectedTemplate({ ...selectedTemplate, name: e.target.value })}
                        disabled={!editMode}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subiect Email
                      </label>
                      <input
                        type="text"
                        value={selectedTemplate.subject}
                        onChange={(e) => setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })}
                        disabled={!editMode}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Preview Mode Toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewMode('html')}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          previewMode === 'html'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        HTML
                      </button>
                      <button
                        onClick={() => setPreviewMode('text')}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          previewMode === 'text'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        Text
                      </button>
                    </div>
                    <button
                      onClick={() => setShowVariables(!showVariables)}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    >
                      {showVariables ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      Variabile Disponibile
                    </button>
                  </div>

                  {/* Variables Panel */}
                  {showVariables && (
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Variabile Template
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedTemplate.variables.map(variable => (
                          <div
                            key={variable.key}
                            onClick={() => insertVariable(variable.key)}
                            className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">
                                  {variable.key}
                                </code>
                                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                  {variable.label}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {variable.description}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  Ex: {variable.example}
                                </p>
                              </div>
                              {editMode && (
                                <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Content Editor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Conținut {previewMode === 'html' ? 'HTML' : 'Text'}
                    </label>
                    {editMode ? (
                      <textarea
                        id="template-content"
                        value={previewMode === 'html' ? selectedTemplate.htmlContent : selectedTemplate.textContent}
                        onChange={(e) => {
                          if (previewMode === 'html') {
                            setSelectedTemplate({ ...selectedTemplate, htmlContent: e.target.value });
                          } else {
                            setSelectedTemplate({ ...selectedTemplate, textContent: e.target.value });
                          }
                        }}
                        rows={20}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white font-mono text-sm"
                      />
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                        {previewMode === 'html' ? (
                          <div
                            dangerouslySetInnerHTML={{ __html: selectedTemplate.htmlContent }}
                            className="prose prose-sm max-w-none dark:prose-invert"
                          />
                        ) : (
                          <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                            {selectedTemplate.textContent}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Selectează un Template
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Alege un template din lista din stânga pentru a-l vizualiza și edita.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="lg:col-span-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Setări Notificări
                </h3>
                <button
                  onClick={handleSaveNotificationSettings}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvează Setările
                </button>
              </div>

              <div className="space-y-8">
                {/* Email Settings */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Setări Email
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Adresa Email Expeditor
                      </label>
                      <input
                        type="email"
                        value={notificationSettings.emailFrom}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailFrom: e.target.value
                        })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nume Expeditor
                      </label>
                      <input
                        type="text"
                        value={notificationSettings.emailFromName}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailFromName: e.target.value
                        })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Types */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Tipuri de Notificări
                  </h4>
                  <div className="space-y-6">
                    {/* Appointment Reminder */}
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            Reminder Programare
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Trimite reminder cu X ore înainte de programare
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.appointmentReminder.enabled}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              appointmentReminder: {
                                ...notificationSettings.appointmentReminder,
                                enabled: e.target.checked
                              }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      {notificationSettings.appointmentReminder.enabled && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Cu câte ore înainte
                            </label>
                            <select
                              value={notificationSettings.appointmentReminder.advanceHours}
                              onChange={(e) => setNotificationSettings({
                                ...notificationSettings,
                                appointmentReminder: {
                                  ...notificationSettings.appointmentReminder,
                                  advanceHours: parseInt(e.target.value)
                                }
                              })}
                              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                            >
                              <option value={1}>1 oră</option>
                              <option value={2}>2 ore</option>
                              <option value={4}>4 ore</option>
                              <option value={24}>1 zi</option>
                              <option value={48}>2 zile</option>
                            </select>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Canale de Notificare
                            </p>
                            <div className="flex gap-4">
                              {notificationSettings.appointmentReminder.channels.map(channel => (
                                <label key={channel.type} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={channel.enabled}
                                    onChange={(e) => updateNotificationChannel(
                                      'appointmentReminder',
                                      channel.type,
                                      e.target.checked
                                    )}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                    {channel.type}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Similar blocks for other notification types would go here */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Email Tab */}
        {activeTab === 'test' && (
          <div className="lg:col-span-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Test Email
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selectează Template
                  </label>
                  <select
                    value={testEmailData.template}
                    onChange={(e) => setTestEmailData({
                      ...testEmailData,
                      template: e.target.value
                    })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                  >
                    <option value="">Selectează un template</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adresa Email Destinatar
                  </label>
                  <input
                    type="email"
                    value={testEmailData.to}
                    onChange={(e) => setTestEmailData({
                      ...testEmailData,
                      to: e.target.value
                    })}
                    placeholder="test@example.com"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleSendTestEmail}
                  disabled={isSendingTest || !testEmailData.to || !testEmailData.template}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingTest ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {isSendingTest ? 'Se trimite...' : 'Trimite Email Test'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailNotificationsPage;