// src/app/(dashboard)/users/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Power,
  Shield,
  Key,
  MoreVertical,
  User,
  UserCheck,
  UserX,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Copy,
  Eye,
  EyeOff,
  Stethoscope,
  UserCog,
  Mail,
  Phone,
  Calendar,
  Activity
} from 'lucide-react';
import UserForm from '@/components/users/user.form';
import { UserList } from '@/components/users/user-list';
import UserPermissions from '@/components/users/user-permission';
import { RoleSelector } from '@/components/users/role-sector';
// Types
interface User {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'DENTIST' | 'ASSISTANT';
  licenseNumber?: string;
  specialization?: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
  emailVerified?: string;
  image?: string;
  _count?: {
    appointments: number;
    treatments: number;
    patientsCreated: number;
  };
}

interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  byRole: {
    ADMIN?: number;
    DENTIST?: number;
    ASSISTANT?: number;
  };
}

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionMenuUserId, setActionMenuUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'ADMIN' | 'DENTIST' | 'ASSISTANT'>('ADMIN');

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'DENTIST' as 'ADMIN' | 'DENTIST' | 'ASSISTANT',
    licenseNumber: '',
    specialization: '',
    phone: '',
    password: '',
    generatePassword: true
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
    generatePassword: true,
    showPassword: false
  });

  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    temporaryPassword?: string;
  } | null>(null);

  // Load users and statistics on mount
  useEffect(() => {
    loadUsers();
    loadStatistics();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => 
        filterStatus === 'active' ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterRole, filterStatus]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
      } else {
        throw new Error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setAlert({ type: 'error', message: 'Eroare la încărcarea utilizatorilor' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await fetch('/api/users/statistics');
      if (response.ok) {
        const data = await response.json();
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleAddUser = async () => {
    try {
      const userData: any = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        licenseNumber: formData.licenseNumber || undefined,
        specialization: formData.specialization || undefined,
        phone: formData.phone || undefined
      };

      if (!formData.generatePassword && formData.password) {
        userData.password = formData.password;
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        
        // Try to parse error message from response
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Parse successful response
      const result = await response.json();

      await loadUsers();
      await loadStatistics();
      setShowAddModal(false);
      resetForm();
      
      if (result.data?.temporaryPassword) {
        setAlert({
          type: 'success',
          message: 'Utilizator creat cu succes!',
          temporaryPassword: result.data.temporaryPassword
        });
      } else {
        setAlert({
          type: 'success',
          message: 'Utilizator creat cu succes!'
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Eroare la crearea utilizatorului'
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          role: formData.role,
          licenseNumber: formData.licenseNumber || undefined,
          specialization: formData.specialization || undefined,
          phone: formData.phone || undefined
        })
      });

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      await loadUsers();
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
      setAlert({
        type: 'success',
        message: 'Utilizator actualizat cu succes!'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      setAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Eroare la actualizarea utilizatorului'
      });
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/deactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      await loadUsers();
      await loadStatistics();
      setAlert({
        type: 'success',
        message: 'Utilizator dezactivat cu succes!'
      });
    } catch (error) {
      console.error('Error deactivating user:', error);
      setAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Eroare la dezactivarea utilizatorului'
      });
    }
    setActionMenuUserId(null);
  };

  const handleReactivateUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/reactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      await loadUsers();
      await loadStatistics();
      setAlert({
        type: 'success',
        message: 'Utilizator reactivat cu succes!'
      });
    } catch (error) {
      console.error('Error reactivating user:', error);
      setAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Eroare la reactivarea utilizatorului'
      });
    }
    setActionMenuUserId(null);
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    try {
      const requestData: any = {};
      
      if (!passwordData.generatePassword) {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          setAlert({
            type: 'error',
            message: 'Parolele nu coincid!'
          });
          return;
        }
        requestData.newPassword = passwordData.newPassword;
      }

      const response = await fetch(`/api/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      setShowPasswordModal(false);
      setSelectedUser(null);
      resetPasswordForm();
      
      if (result.data?.temporaryPassword) {
        setAlert({
          type: 'success',
          message: 'Parola a fost resetată!',
          temporaryPassword: result.data.temporaryPassword
        });
      } else {
        setAlert({
          type: 'success',
          message: 'Parola a fost resetată cu succes!'
        });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Eroare la resetarea parolei'
      });
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      name: user.name || '',
      role: user.role,
      licenseNumber: user.licenseNumber || '',
      specialization: user.specialization || '',
      phone: user.phone || '',
      password: '',
      generatePassword: true
    });
    setShowEditModal(true);
    setActionMenuUserId(null);
  };

  const openPasswordModal = (user: User) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
    setActionMenuUserId(null);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      role: 'DENTIST',
      licenseNumber: '',
      specialization: '',
      phone: '',
      password: '',
      generatePassword: true
    });
  };

  const resetPasswordForm = () => {
    setPasswordData({
      newPassword: '',
      confirmPassword: '',
      generatePassword: true,
      showPassword: false
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    const prevAlert = alert;
    setAlert({ type: 'info', message: 'Copiat în clipboard!' });
    setTimeout(() => setAlert(prevAlert), 2000);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Shield className="w-4 h-4" />;
      case 'DENTIST': return <Stethoscope className="w-4 h-4" />;
      case 'ASSISTANT': return <UserCog className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'DENTIST': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'ASSISTANT': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Se încarcă utilizatorii...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestionare Utilizatori 👥
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administrează utilizatorii și permisiunile sistemului
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Adaugă Utilizator</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {statistics.total}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Utilizatori</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {statistics.active}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Activi</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <UserX className="w-5 h-5 text-gray-400" />
              <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {statistics.inactive}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Inactivi</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-5 h-5 text-purple-500" />
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {statistics.byRole.ADMIN || 0}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Administratori</p>
          </div>
        </div>
      )}



      {/* Alert Messages */}
      {alert && (
        <div className={`rounded-lg p-4 flex items-start gap-3 ${
          alert.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
          alert.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
          'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex-shrink-0 mt-0.5">
            {alert.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" /> :
             alert.type === 'error' ? <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" /> :
             <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          </div>
          <div className="flex-1">
            <p className={`font-medium ${
              alert.type === 'success' ? 'text-green-900 dark:text-green-200' :
              alert.type === 'error' ? 'text-red-900 dark:text-red-200' :
              'text-blue-900 dark:text-blue-200'
            }`}>
              {alert.message}
            </p>
            {alert.temporaryPassword && (
              <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Parola temporară:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded font-mono text-sm text-gray-900 dark:text-white">
                    {alert.temporaryPassword}
                  </code>
                  <button
                    onClick={() => copyToClipboard(alert.temporaryPassword!)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setAlert(null)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Users Table */}
      
           <UserList users={users} onEdit={openEditModal} onResetPassword={openPasswordModal} />

      {/* Add/Edit User Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {showAddModal ? 'Adaugă Utilizator Nou' : 'Editează Utilizator'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nume Complet *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rol *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white"
                  >
                    <option value="DENTIST">Dentist</option>
                    <option value="ASSISTANT">Asistent</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                {formData.role === 'DENTIST' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Număr Licență
                      </label>
                      <input
                        type="text"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Specializare
                      </label>
                      <input
                        type="text"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white"
                        placeholder="ex. Ortodonție, Endodonție"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white"
                  />
                </div>

                {showAddModal && (
                  <div>
                    <label className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={formData.generatePassword}
                        onChange={(e) => setFormData({ ...formData, generatePassword: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Generează parolă automată
                      </span>
                    </label>

                    {!formData.generatePassword && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Parolă
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white"
                          placeholder="Minim 8 caractere"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Anulează
                </button>
                <button
                  onClick={showAddModal ? handleAddUser : handleUpdateUser}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  {showAddModal ? 'Adaugă' : 'Salvează'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Resetează Parola
                </h3>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedUser(null);
                    resetPasswordForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Resetează parola pentru:
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedUser.name || selectedUser.email}
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={passwordData.generatePassword}
                    onChange={(e) => setPasswordData({ ...passwordData, generatePassword: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Generează parolă automată
                  </span>
                </label>

                {!passwordData.generatePassword && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Parolă Nouă
                      </label>
                      <div className="relative">
                        <input
                          type={passwordData.showPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-3 py-2 pr-10 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white"
                          placeholder="Minim 8 caractere"
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordData({ ...passwordData, showPassword: !passwordData.showPassword })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          {passwordData.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirmă Parola
                      </label>
                      <input
                        type={passwordData.showPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white"
                        placeholder="Reintroducere parolă"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedUser(null);
                    resetPasswordForm();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Anulează
                </button>
                <button
                  onClick={handleResetPassword}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  Resetează Parola
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <UserForm 
  mode="create"
  onSubmit={handleUpdateUser}
  onCancel={() => setShowAddModal(false)}
/>
     <UserPermissions currentRole={currentUserRole} compareRoles={false} showDescriptions={true} interactive={true} onPermissionChange={(permission, value) => console.log('Permission changed:', permission, value)}   />
      <RoleSelector onChange={(newRole) => console.log('Role changed to:', newRole)} value={'ADMIN'} />

    </div>
    
  );
};

export default UserManagementPage;