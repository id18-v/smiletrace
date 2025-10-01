// src/components/users/user-list.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  User,
  Users,
  Shield,
  Stethoscope,
  UserCog,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Key,
  Power,
  UserX,
  UserCheck,
  Phone,
  Mail,
  Calendar,
  Activity,
  ChevronUp,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';

interface UserData {
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

interface UserListProps {
  users: UserData[];
  onEdit?: (user: UserData) => void;
  onResetPassword?: (user: UserData) => void;
  onToggleStatus?: (user: UserData) => void;
  onDelete?: (user: UserData) => void;
  isLoading?: boolean;
  currentUserId?: string;
}

type SortField = 'name' | 'email' | 'role' | 'status' | 'createdAt' | 'lastLoginAt';
type SortDirection = 'asc' | 'desc';

export const UserList: React.FC<UserListProps> = ({
  users,
  onEdit,
  onResetPassword,
  onToggleStatus,
  onDelete,
  isLoading = false,
  currentUserId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [actionMenuUserId, setActionMenuUserId] = useState<string | null>(null);

  // Filter and sort users
  const processedUsers = useMemo(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.licenseNumber?.toLowerCase().includes(search) ||
        user.specialization?.toLowerCase().includes(search)
      );
    }

    // Apply role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => 
        filterStatus === 'active' ? user.isActive : !user.isActive
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name || a.email;
          bValue = b.name || b.email;
          break;
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'status':
          aValue = a.isActive ? 1 : 0;
          bValue = b.isActive ? 1 : 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'lastLoginAt':
          aValue = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
          bValue = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [users, searchTerm, filterRole, filterStatus, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
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
      case 'ADMIN': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'DENTIST': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'ASSISTANT': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const SortButton: React.FC<{ field: SortField; label: string }> = ({ field, label }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
    >
      {label}
      {sortField === field ? (
        sortDirection === 'asc' ? 
          <ChevronUp className="w-3 h-3" /> : 
          <ChevronDown className="w-3 h-3" />
      ) : (
        <ArrowUpDown className="w-3 h-3 opacity-50" />
      )}
    </button>
  );

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
              
                return (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    {/* Filters */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                          {/* Search */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Caută utilizatori..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                          </div>
              
                          {/* Role Filter */}
                          <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                              value={filterRole}
                              onChange={(e) => setFilterRole(e.target.value)}
                              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                              <option value="all">Toate rolurile</option>
                              <option value="ADMIN">Administrator</option>
                              <option value="DENTIST">Dentist</option>
                              <option value="ASSISTANT">Asistent</option>
                            </select>
                          </div>
              
                          {/* Status Filter */}
                          <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="all">Toate statusurile</option>
                            <option value="active">Activ</option>
                            <option value="inactive">Inactiv</option>
                          </select>
                        </div>
              
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {processedUsers.length} utilizatori găsiți
                        </div>
                      </div>
                    </div>
              
                    {/* User List */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left p-4">
                              <SortButton field="name" label="Utilizator" />
                            </th>
                            <th className="text-left p-4">
                              <SortButton field="role" label="Rol" />
                            </th>
                            <th className="text-left p-4">
                              <SortButton field="status" label="Status" />
                            </th>
                            <th className="text-left p-4">
                              <SortButton field="lastLoginAt" label="Ultima conectare" />
                            </th>
                            <th className="text-left p-4">
                              <SortButton field="createdAt" label="Data creării" />
                            </th>
                            <th className="text-center p-4">Acțiuni</th>
                          </tr>
                        </thead>
                        <tbody>
                          {processedUsers.map((user) => (
                            <React.Fragment key={user.id}>
                              <tr className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-900 dark:text-white">
                                        {user.name || 'Nume nesetat'}
                                      </div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {user.email}
                                      </div>
                                      {user.licenseNumber && (
                                        <div className="text-xs text-gray-400 dark:text-gray-500">
                                          Licență: {user.licenseNumber}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                                    {getRoleIcon(user.role)}
                                    {user.role === 'ADMIN' ? 'Administrator' : 
                                     user.role === 'DENTIST' ? 'Dentist' : 'Asistent'}
                                  </div>
                                  {user.specialization && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {user.specialization}
                                    </div>
                                  )}
                                </td>
                                <td className="p-4">
                                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                                    user.isActive 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                  }`}>
                                    {user.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                                    {user.isActive ? 'Activ' : 'Inactiv'}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="text-sm text-gray-900 dark:text-white">
                                    {formatDateTime(user.lastLoginAt)}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="text-sm text-gray-900 dark:text-white">
                                    {formatDate(user.createdAt)}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                      title="Vezi detalii"
                                    >
                                      <Activity className="w-4 h-4" />
                                    </button>
                                    
                                    <div className="relative">
                                      <button
                                        onClick={() => setActionMenuUserId(actionMenuUserId === user.id ? null : user.id)}
                                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        disabled={currentUserId === user.id}
                                      >
                                        <MoreVertical className="w-4 h-4" />
                                      </button>
                                      
                                      {actionMenuUserId === user.id && (
                                        <div className="absolute right-0 top-8 z-10 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
                                          <div className="py-1">
                                            {onEdit && (
                                              <button
                                                onClick={() => {
                                                  onEdit(user);
                                                  setActionMenuUserId(null);
                                                }}
                                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                              >
                                                <Edit className="w-4 h-4" />
                                                Editează
                                              </button>
                                            )}
                                            
                                            {onResetPassword && (
                                              <button
                                                onClick={() => {
                                                  onResetPassword(user);
                                                  setActionMenuUserId(null);
                                                }}
                                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                              >
                                                <Key className="w-4 h-4" />
                                                Resetează parola
                                              </button>
                                            )}
                                            
                                            {onToggleStatus && (
                                              <button
                                                onClick={() => {
                                                  onToggleStatus(user);
                                                  setActionMenuUserId(null);
                                                }}
                                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                              >
                                                <Power className="w-4 h-4" />
                                                {user.isActive ? 'Dezactivează' : 'Activează'}
                                              </button>
                                            )}
                                            
                                            {onDelete && currentUserId !== user.id && (
                                              <button
                                                onClick={() => {
                                                  onDelete(user);
                                                  setActionMenuUserId(null);
                                                }}
                                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                              >
                                                <UserX className="w-4 h-4" />
                                                Șterge
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                              
                              {expandedUserId === user.id && (
                                <tr>
                                  <td colSpan={6} className="p-4 bg-gray-50 dark:bg-gray-700/50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                      <div className="space-y-2">
                                        <h4 className="font-medium text-gray-900 dark:text-white">Informații contact</h4>
                                        {user.phone && (
                                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Phone className="w-4 h-4" />
                                            {user.phone}
                                          </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                          <Mail className="w-4 h-4" />
                                          {user.email}
                                          {user.emailVerified && (
                                            <span className="text-green-600 dark:text-green-400">✓</span>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <h4 className="font-medium text-gray-900 dark:text-white">Activitate</h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                          <Calendar className="w-4 h-4" />
                                          Înregistrat: {formatDate(user.createdAt)}
                                        </div>
                                        {user.lastLoginAt && (
                                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Activity className="w-4 h-4" />
                                            Ultima conectare: {formatDateTime(user.lastLoginAt)}
                                          </div>
                                        )}
                                      </div>
                                      
                                      {user._count && (
                                        <div className="space-y-2">
                                          <h4 className="font-medium text-gray-900 dark:text-white">Statistici</h4>
                                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                            <div>Programări: {user._count.appointments}</div>
                                            <div>Tratamente: {user._count.treatments}</div>
                                            <div>Pacienți creați: {user._count.patientsCreated}</div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                      
                      {processedUsers.length === 0 && (
                        <div className="text-center py-12">
                          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Nu au fost găsiți utilizatori
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400">
                            Încearcă să modifici filtrele sau termenul de căutare.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              };