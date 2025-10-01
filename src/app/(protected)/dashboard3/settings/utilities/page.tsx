// src/app/(dashboard)/settings/utilities/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  Upload,
  Shield,
  Activity,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  HardDrive,
  Server,
  Cpu,
  FileText,
  Search,
  Filter,
  Calendar,
  User,
  RefreshCw,
  Settings,
  Save,
  Loader2,
  X,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Archive,
  Zap,
  TrendingUp,
  TrendingDown,
  Eye,
  Play,
  Pause,
  BarChart3
} from 'lucide-react';

// Types
interface BackupInfo {
  id: string;
  timestamp: Date;
  size: number;
  type: 'manual' | 'automatic';
  status: 'completed' | 'failed' | 'in-progress';
  location: string;
  includesFiles: boolean;
}

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

interface SystemHealth {
  database: {
    status: 'healthy' | 'degraded' | 'error';
    connections: number;
    maxConnections: number;
    responseTime: number;
    size: number;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
  server: {
    uptime: number;
    cpu: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
  services: {
    email: 'operational' | 'degraded' | 'down';
    sms: 'operational' | 'degraded' | 'down';
    backup: 'operational' | 'degraded' | 'down';
    appointments: 'operational' | 'degraded' | 'down';
  };
}

interface DataCleanupOptions {
  oldAppointments: {
    enabled: boolean;
    olderThanMonths: number;
  };
  deletedPatients: {
    enabled: boolean;
    olderThanDays: number;
  };
  auditLogs: {
    enabled: boolean;
    olderThanMonths: number;
  };
  tempFiles: {
    enabled: boolean;
  };
  emailLogs: {
    enabled: boolean;
    olderThanDays: number;
  };
}

const SystemUtilitiesPage = () => {
  const [activeTab, setActiveTab] = useState<'backup' | 'audit' | 'health' | 'cleanup'>('backup');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  } | null>(null);

  // Backup State
  const [backups, setBackups] = useState<BackupInfo[]>([
    {
      id: '1',
      timestamp: new Date('2024-03-15T10:30:00'),
      size: 256000000, // 256 MB
      type: 'automatic',
      status: 'completed',
      location: 'cloud',
      includesFiles: true
    },
    {
      id: '2',
      timestamp: new Date('2024-03-14T22:00:00'),
      size: 245000000,
      type: 'automatic',
      status: 'completed',
      location: 'cloud',
      includesFiles: true
    },
    {
      id: '3',
      timestamp: new Date('2024-03-14T14:15:00'),
      size: 240000000,
      type: 'manual',
      status: 'completed',
      location: 'local',
      includesFiles: false
    }
  ]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [selectedBackup, setSelectedBackup] = useState<BackupInfo | null>(null);

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: '1',
      timestamp: new Date('2024-03-15T14:30:00'),
      userId: 'usr_1',
      userName: 'Dr. Maria Ionescu',
      userEmail: 'maria.ionescu@clinica.ro',
      action: 'CREATE',
      entityType: 'Patient',
      entityId: 'pat_123',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      severity: 'info'
    },
    {
      id: '2',
      timestamp: new Date('2024-03-15T14:25:00'),
      userId: 'usr_2',
      userName: 'Admin User',
      userEmail: 'admin@clinica.ro',
      action: 'UPDATE',
      entityType: 'Settings',
      changes: { emailEnabled: true },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0',
      severity: 'warning'
    },
    {
      id: '3',
      timestamp: new Date('2024-03-15T14:20:00'),
      userId: 'usr_1',
      userName: 'Dr. Maria Ionescu',
      userEmail: 'maria.ionescu@clinica.ro',
      action: 'DELETE',
      entityType: 'Appointment',
      entityId: 'apt_456',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      severity: 'warning'
    }
  ]);
  const [auditFilter, setAuditFilter] = useState({
    user: '',
    action: '',
    entityType: '',
    dateFrom: '',
    dateTo: '',
    severity: ''
  });

  // System Health State
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: {
      status: 'healthy',
      connections: 12,
      maxConnections: 100,
      responseTime: 45,
      size: 512000000 // 512 MB
    },
    storage: {
      used: 5368709120, // 5 GB
      total: 10737418240, // 10 GB
      percentage: 50
    },
    server: {
      uptime: 864000, // 10 days in seconds
      cpu: 35,
      memory: {
        used: 2147483648, // 2 GB
        total: 4294967296, // 4 GB
        percentage: 50
      }
    },
    services: {
      email: 'operational',
      sms: 'operational',
      backup: 'operational',
      appointments: 'operational'
    }
  });
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Data Cleanup State
  const [cleanupOptions, setCleanupOptions] = useState<DataCleanupOptions>({
    oldAppointments: {
      enabled: false,
      olderThanMonths: 24
    },
    deletedPatients: {
      enabled: false,
      olderThanDays: 30
    },
    auditLogs: {
      enabled: false,
      olderThanMonths: 12
    },
    tempFiles: {
      enabled: false
    },
    emailLogs: {
      enabled: false,
      olderThanDays: 90
    }
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cleanupEstimate, setCleanupEstimate] = useState({
    records: 0,
    size: 0
  });
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Auto-refresh for system health
  useEffect(() => {
    if (autoRefresh && activeTab === 'health') {
      const interval = setInterval(() => {
        refreshSystemHealth();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Simulate API calls
      await Promise.all([
        loadBackups(),
        loadAuditLogs(),
        refreshSystemHealth()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      setAlert({ type: 'error', message: 'Eroare la încărcarea datelor' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBackups = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const loadAuditLogs = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const refreshSystemHealth = async () => {
    setIsRefreshingHealth(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update with random variations to simulate real data
      setSystemHealth(prev => ({
        ...prev,
        database: {
          ...prev.database,
          connections: Math.floor(Math.random() * 20) + 10,
          responseTime: Math.floor(Math.random() * 50) + 20
        },
        server: {
          ...prev.server,
          cpu: Math.floor(Math.random() * 60) + 20,
          memory: {
            ...prev.server.memory,
            percentage: Math.floor(Math.random() * 30) + 40
          }
        }
      }));
    } catch (error) {
      console.error('Error refreshing system health:', error);
      setAlert({ type: 'error', message: 'Eroare la actualizarea stării sistemului' });
    } finally {
      setIsRefreshingHealth(false);
    }
  };

  const handleBackup = async (includeFiles: boolean = true) => {
    setIsBackingUp(true);
    setBackupProgress(0);
    
    try {
      // Simulate backup progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setBackupProgress(i);
      }

      const newBackup: BackupInfo = {
        id: Date.now().toString(),
        timestamp: new Date(),
        size: Math.floor(Math.random() * 50000000) + 200000000,
        type: 'manual',
        status: 'completed',
        location: 'cloud',
        includesFiles: includeFiles
      };

      setBackups([newBackup, ...backups]);
      setAlert({ type: 'success', message: 'Backup realizat cu succes!' });
    } catch (error) {
      console.error('Error creating backup:', error);
      setAlert({ type: 'error', message: 'Eroare la crearea backup-ului' });
    } finally {
      setIsBackingUp(false);
      setBackupProgress(0);
    }
  };

  const handleRestore = async (backup: BackupInfo) => {
    if (!confirm(`Sigur doriți să restaurați backup-ul din ${formatDate(backup.timestamp)}? Această acțiune va înlocui toate datele curente.`)) {
      return;
    }

    try {
      setAlert({ type: 'info', message: 'Se restaurează backup-ul...' });
      await new Promise(resolve => setTimeout(resolve, 3000));
      setAlert({ type: 'success', message: 'Backup restaurat cu succes! Sistemul va reporni.' });
    } catch (error) {
      console.error('Error restoring backup:', error);
      setAlert({ type: 'error', message: 'Eroare la restaurarea backup-ului' });
    }
  };

  const handleAnalyzeCleanup = async () => {
    setIsAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Calculate estimated cleanup
      let records = 0;
      let size = 0;
      
      if (cleanupOptions.oldAppointments.enabled) {
        records += 150;
        size += 15000000;
      }
      if (cleanupOptions.deletedPatients.enabled) {
        records += 25;
        size += 5000000;
      }
      if (cleanupOptions.auditLogs.enabled) {
        records += 5000;
        size += 50000000;
      }
      if (cleanupOptions.tempFiles.enabled) {
        size += 100000000;
      }
      if (cleanupOptions.emailLogs.enabled) {
        records += 1000;
        size += 25000000;
      }

      setCleanupEstimate({ records, size });
      setAlert({ type: 'info', message: `Se pot șterge ${records} înregistrări (${formatBytes(size)})` });
    } catch (error) {
      console.error('Error analyzing cleanup:', error);
      setAlert({ type: 'error', message: 'Eroare la analiza curățării' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCleanup = async () => {
    if (!confirm(`Sigur doriți să ștergeți ${cleanupEstimate.records} înregistrări (${formatBytes(cleanupEstimate.size)})? Această acțiune este ireversibilă.`)) {
      return;
    }

    setIsCleaningUp(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setAlert({ type: 'success', message: 'Curățarea datelor a fost finalizată cu succes!' });
      setCleanupEstimate({ records: 0, size: 0 });
    } catch (error) {
      console.error('Error cleaning up:', error);
      setAlert({ type: 'error', message: 'Eroare la curățarea datelor' });
    } finally {
      setIsCleaningUp(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ro-RO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}z ${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'degraded':
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
      case 'down':
      case 'failed':
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'error':
      case 'down':
      case 'failed':
      case 'critical':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      critical: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    };
    return colors[severity as keyof typeof colors] || colors.info;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Se încarcă utilitățile sistemului...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
            <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Utilități Sistem & Mentenanță
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestionează backup-uri, monitorizează sistemul și curăță datele
            </p>
          </div>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`rounded-lg p-4 flex items-start gap-3 ${
          alert.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
          alert.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
          alert.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
          'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex-shrink-0 mt-0.5">
            {alert.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" /> :
             alert.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" /> :
             alert.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" /> :
             <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          </div>
          <div className="flex-1">
            <p className={`font-medium ${
              alert.type === 'success' ? 'text-green-900 dark:text-green-200' :
              alert.type === 'error' ? 'text-red-900 dark:text-red-200' :
              alert.type === 'warning' ? 'text-yellow-900 dark:text-yellow-200' :
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
            { id: 'backup', label: 'Backup & Restaurare', icon: Database },
            { id: 'audit', label: 'Jurnal Audit', icon: Shield },
            { id: 'health', label: 'Stare Sistem', icon: Activity },
            { id: 'cleanup', label: 'Curățare Date', icon: Trash2 }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
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
      <div>
        {/* Backup & Restore Tab */}
        {activeTab === 'backup' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Backup Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Creare Backup
                </h3>
                
                {isBackingUp ? (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <Loader2 className="w-12 h-12 mx-auto text-purple-600 dark:text-purple-400 animate-spin mb-4" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Se creează backup-ul...
                      </p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${backupProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {backupProgress}% completat
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={() => handleBackup(true)}
                      className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Database className="w-5 h-5" />
                      Backup Complet
                    </button>
                    
                    <button
                      onClick={() => handleBackup(false)}
                      className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Archive className="w-5 h-5" />
                      Backup Doar Baza de Date
                    </button>

                    <div className="pt-4 border-t dark:border-gray-700">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Backup Automat
                      </h4>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-purple-600 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Activat (zilnic la 22:00)
                        </span>
                      </label>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-800 dark:text-blue-200">
                          <p className="font-medium mb-1">Informații:</p>
                          <ul className="space-y-1">
                            <li>• Backup-ul complet include fișiere atașate</li>
                            <li>• Backup-urile sunt criptate și stocate securizat</li>
                            <li>• Păstrăm ultimele 30 backup-uri automate</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Backup List */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Backup-uri Disponibile
                  </h3>
                  <button
                    onClick={loadBackups}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {backups.map(backup => (
                    <div
                      key={backup.id}
                      className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`flex items-center gap-1 ${getStatusColor(backup.status)}`}>
                              {getStatusIcon(backup.status)}
                              <span className="font-medium">
                                {backup.status === 'completed' ? 'Completat' :
                                 backup.status === 'failed' ? 'Eșuat' : 'În progres'}
                              </span>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              backup.type === 'automatic' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {backup.type === 'automatic' ? 'Automat' : 'Manual'}
                            </span>
                            {backup.includesFiles && (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                Include fișiere
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(backup.timestamp)}
                            </span>
                            <span className="flex items-center gap-1">
                              <HardDrive className="w-4 h-4" />
                              {formatBytes(backup.size)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Server className="w-4 h-4" />
                              {backup.location === 'cloud' ? 'Cloud' : 'Local'}
                              </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRestore(backup)}
                            className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                            title="Restaurează"
                          >
                            <Upload className="w-5 h-5" />
                          </button>
                          <button
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Descarcă"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {backups.length === 0 && (
                  <div className="text-center py-8">
                    <Database className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Nu există backup-uri disponibile
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Filtre Jurnal Audit
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Utilizator
                  </label>
                  <input
                    type="text"
                    value={auditFilter.user}
                    onChange={(e) => setAuditFilter({ ...auditFilter, user: e.target.value })}
                    placeholder="Caută după nume sau email"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Acțiune
                  </label>
                  <select
                    value={auditFilter.action}
                    onChange={(e) => setAuditFilter({ ...auditFilter, action: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="">Toate acțiunile</option>
                    <option value="CREATE">CREATE</option>
                    <option value="UPDATE">UPDATE</option>
                    <option value="DELETE">DELETE</option>
                    <option value="LOGIN">LOGIN</option>
                    <option value="LOGOUT">LOGOUT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tip Entitate
                  </label>
                  <select
                    value={auditFilter.entityType}
                    onChange={(e) => setAuditFilter({ ...auditFilter, entityType: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="">Toate tipurile</option>
                    <option value="Patient">Pacient</option>
                    <option value="Appointment">Programare</option>
                    <option value="Treatment">Tratament</option>
                    <option value="User">Utilizator</option>
                    <option value="Settings">Setări</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Severitate
                  </label>
                  <select
                    value={auditFilter.severity}
                    onChange={(e) => setAuditFilter({ ...auditFilter, severity: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="">Toate</option>
                    <option value="info">Info</option>
                    <option value="warning">Avertizare</option>
                    <option value="error">Eroare</option>
                    <option value="critical">Critic</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={loadAuditLogs}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Aplică Filtre
                </button>
                <button
                  onClick={() => setAuditFilter({ user: '', action: '', entityType: '', dateFrom: '', dateTo: '', severity: '' })}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  Resetează
                </button>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Utilizator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Acțiune
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Entitate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Severitate
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Detalii
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {log.userName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {log.userEmail}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            log.action === 'CREATE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            log.action === 'DELETE' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {log.entityType}
                            </p>
                            {log.entityId && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {log.entityId}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {log.ipAddress}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getSeverityBadge(log.severity)}`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* System Health Tab */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            {/* Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Database Health */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h4 className="font-medium text-gray-900 dark:text-white">Bază de Date</h4>
                  </div>
                  <div className={`flex items-center gap-1 ${getStatusColor(systemHealth.database.status)}`}>
                    {getStatusIcon(systemHealth.database.status)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Conexiuni:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {systemHealth.database.connections}/{systemHealth.database.maxConnections}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Timp răspuns:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {systemHealth.database.responseTime}ms
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Dimensiune:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatBytes(systemHealth.database.size)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Storage Health */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h4 className="font-medium text-gray-900 dark:text-white">Stocare</h4>
                  </div>
                  <div className={`flex items-center gap-1 ${
                    systemHealth.storage.percentage > 80 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                  }`}>
                    {systemHealth.storage.percentage}%
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Utilizat:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatBytes(systemHealth.storage.used)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatBytes(systemHealth.storage.total)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        systemHealth.storage.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${systemHealth.storage.percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Server Health */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h4 className="font-medium text-gray-900 dark:text-white">Server</h4>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatUptime(systemHealth.server.uptime)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">CPU:</span>
                    <span className={`font-medium ${
                      systemHealth.server.cpu > 70 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'
                    }`}>
                      {systemHealth.server.cpu}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">RAM:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {systemHealth.server.memory.percentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Services Health */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h4 className="font-medium text-gray-900 dark:text-white">Servicii</h4>
                  </div>
                </div>
                <div className="space-y-2">
                  {Object.entries(systemHealth.services).map(([service, status]) => (
                    <div key={service} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">
                        {service === 'sms' ? 'SMS' : service}:
                      </span>
                      <span className={`font-medium ${getStatusColor(status)}`}>
                        {status === 'operational' ? 'Operațional' :
                         status === 'degraded' ? 'Degradat' : 'Nefuncțional'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Metrici Performanță
                </h3>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Auto-refresh (30s)
                    </span>
                  </label>
                  <button
                    onClick={refreshSystemHealth}
                    disabled={isRefreshingHealth}
                    className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isRefreshingHealth ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Utilizare CPU (%)
                  </h4>
                  <div className="h-32 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                    <span className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">
                      {systemHealth.server.cpu}%
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Utilizare Memorie
                  </h4>
                  <div className="h-32 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {systemHealth.server.memory.percentage}%
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatBytes(systemHealth.server.memory.used)} / {formatBytes(systemHealth.server.memory.total)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Cleanup Tab */}
        {activeTab === 'cleanup' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cleanup Options */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Opțiuni Curățare Date
                </h3>

                <div className="space-y-4">
                  {/* Old Appointments */}
                  <div className="border dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={cleanupOptions.oldAppointments.enabled}
                          onChange={(e) => setCleanupOptions({
                            ...cleanupOptions,
                            oldAppointments: { ...cleanupOptions.oldAppointments, enabled: e.target.checked }
                          })}
                          className="w-4 h-4 text-purple-600 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Programări Vechi
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Șterge programările mai vechi de perioada selectată
                          </p>
                        </div>
                      </div>
                      {cleanupOptions.oldAppointments.enabled && (
                        <select
                          value={cleanupOptions.oldAppointments.olderThanMonths}
                          onChange={(e) => setCleanupOptions({
                            ...cleanupOptions,
                            oldAppointments: { ...cleanupOptions.oldAppointments, olderThanMonths: Number(e.target.value) }
                          })}
                          className="px-3 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                        >
                          <option value="12">12 luni</option>
                          <option value="24">24 luni</option>
                          <option value="36">36 luni</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Deleted Patients */}
                  <div className="border dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={cleanupOptions.deletedPatients.enabled}
                          onChange={(e) => setCleanupOptions({
                            ...cleanupOptions,
                            deletedPatients: { ...cleanupOptions.deletedPatients, enabled: e.target.checked }
                          })}
                          className="w-4 h-4 text-purple-600 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Pacienți Șterși
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Curăță permanent pacienții marcați pentru ștergere
                          </p>
                        </div>
                      </div>
                      {cleanupOptions.deletedPatients.enabled && (
                        <select
                          value={cleanupOptions.deletedPatients.olderThanDays}
                          onChange={(e) => setCleanupOptions({
                            ...cleanupOptions,
                            deletedPatients: { ...cleanupOptions.deletedPatients, olderThanDays: Number(e.target.value) }
                          })}
                          className="px-3 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                        >
                          <option value="30">30 zile</option>
                          <option value="60">60 zile</option>
                          <option value="90">90 zile</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Audit Logs */}
                  <div className="border dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={cleanupOptions.auditLogs.enabled}
                          onChange={(e) => setCleanupOptions({
                            ...cleanupOptions,
                            auditLogs: { ...cleanupOptions.auditLogs, enabled: e.target.checked }
                          })}
                          className="w-4 h-4 text-purple-600 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Jurnale Audit
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Arhivează și șterge jurnalele vechi de audit
                          </p>
                        </div>
                      </div>
                      {cleanupOptions.auditLogs.enabled && (
                        <select
                          value={cleanupOptions.auditLogs.olderThanMonths}
                          onChange={(e) => setCleanupOptions({
                            ...cleanupOptions,
                            auditLogs: { ...cleanupOptions.auditLogs, olderThanMonths: Number(e.target.value) }
                          })}
                          className="px-3 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                        >
                          <option value="6">6 luni</option>
                          <option value="12">12 luni</option>
                          <option value="24">24 luni</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Temp Files */}
                  <div className="border dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={cleanupOptions.tempFiles.enabled}
                        onChange={(e) => setCleanupOptions({
                          ...cleanupOptions,
                          tempFiles: { enabled: e.target.checked }
                        })}
                        className="w-4 h-4 text-purple-600 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Fișiere Temporare
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Șterge cache și fișiere temporare
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Email Logs */}
                  <div className="border dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={cleanupOptions.emailLogs.enabled}
                          onChange={(e) => setCleanupOptions({
                            ...cleanupOptions,
                            emailLogs: { ...cleanupOptions.emailLogs, enabled: e.target.checked }
                          })}
                          className="w-4 h-4 text-purple-600 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Jurnale Email
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Șterge jurnalele vechi de email
                          </p>
                        </div>
                      </div>
                      {cleanupOptions.emailLogs.enabled && (
                        <select
                          value={cleanupOptions.emailLogs.olderThanDays}
                          onChange={(e) => setCleanupOptions({
                            ...cleanupOptions,
                            emailLogs: { ...cleanupOptions.emailLogs, olderThanDays: Number(e.target.value) }
                          })}
                          className="px-3 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                        >
                          <option value="30">30 zile</option>
                          <option value="90">90 zile</option>
                          <option value="180">180 zile</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cleanup Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Sumar Curățare
                </h3>

                {cleanupEstimate.records > 0 || cleanupEstimate.size > 0 ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                            Estimare Curățare
                          </p>
                          <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                            Se vor șterge:
                          </p>
                          <ul className="text-sm text-yellow-700 dark:text-yellow-400 mt-2 space-y-1">
                            <li>• {cleanupEstimate.records.toLocaleString()} înregistrări</li>
                            <li>• {formatBytes(cleanupEstimate.size)} spațiu</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleAnalyzeCleanup}
                        disabled={isAnalyzing || isCleaningUp}
                        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analizează...
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            Analizează
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleCleanup}
                        disabled={cleanupEstimate.records === 0 || isCleaningUp}
                        className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {isCleaningUp ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Se curăță...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            Execută Curățare
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Archive className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Selectați opțiunile de curățare
                    </p>
                    <button
                      onClick={handleAnalyzeCleanup}
                      disabled={isAnalyzing}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors mx-auto"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analizează...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          Analizează Opțiuni
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-800 dark:text-blue-200">
                      <p className="font-medium mb-1">Recomandări:</p>
                      <ul className="space-y-1">
                        <li>• Faceți backup înainte de curățare</li>
                        <li>• Curățați date mai vechi de 2 ani</li>
                        <li>• Programați curățări lunare automate</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Statistici Rapide
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Ultima curățare:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        Acum 30 zile
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Spațiu recuperat:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        1.2 GB
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Înregistrări șterse:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        15,432
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemUtilitiesPage;
