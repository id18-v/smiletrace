// src/components/users/user-permissions.tsx
'use client';

import React, { useState } from 'react';
import {
  Check,
  X,
  Minus,
  Shield,
  Stethoscope,
  UserCog,
  Info,
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  AlertCircle,
  Eye,
  Edit,
  Trash,
  Download,
  Settings,
  Users,
  Calendar,
  FileText,
  CreditCard,
  BarChart3
} from 'lucide-react';

type UserRole = 'ADMIN' | 'DENTIST' | 'ASSISTANT';

interface PermissionCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  permissions: Permission[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  admin: boolean;
  dentist: boolean;
  assistant: boolean;
  requiresLicense?: boolean;
  note?: string;
}

interface UserPermissionsProps {
  currentRole?: UserRole;
  compareRoles?: boolean;
  showDescriptions?: boolean;
  interactive?: boolean;
  onPermissionChange?: (roleId: UserRole, permissionId: string, value: boolean) => void;
}

const permissionCategories: PermissionCategory[] = [
  {
    id: 'users',
    name: 'Gestionare Utilizatori',
    icon: Users,
    description: 'Permisiuni pentru gestionarea utilizatorilor și rolurilor',
    permissions: [
      {
        id: 'users.create',
        name: 'Creare utilizatori',
        description: 'Poate crea conturi noi de utilizatori',
        admin: true,
        dentist: false,
        assistant: false
      },
      {
        id: 'users.edit',
        name: 'Editare utilizatori',
        description: 'Poate modifica informațiile utilizatorilor',
        admin: true,
        dentist: false,
        assistant: false
      },
      {
        id: 'users.delete',
        name: 'Ștergere utilizatori',
        description: 'Poate șterge conturi de utilizatori',
        admin: true,
        dentist: false,
        assistant: false
      },
      {
        id: 'users.roles',
        name: 'Gestionare roluri',
        description: 'Poate atribui și modifica roluri',
        admin: true,
        dentist: false,
        assistant: false
      },
      {
        id: 'users.view',
        name: 'Vizualizare utilizatori',
        description: 'Poate vedea lista de utilizatori',
        admin: true,
        dentist: true,
        assistant: true
      }
    ]
  },
  {
    id: 'patients',
    name: 'Gestionare Pacienți',
    icon: FileText,
    description: 'Permisiuni pentru gestionarea pacienților și datelor medicale',
    permissions: [
      {
        id: 'patients.create',
        name: 'Înregistrare pacienți noi',
        description: 'Poate adăuga pacienți noi în sistem',
        admin: true,
        dentist: true,
        assistant: true
      },
      {
        id: 'patients.edit',
        name: 'Editare date pacienți',
        description: 'Poate modifica informațiile pacienților',
        admin: true,
        dentist: true,
        assistant: true
      },
      {
        id: 'patients.delete',
        name: 'Ștergere pacienți',
        description: 'Poate șterge înregistrări de pacienți',
        admin: true,
        dentist: false,
        assistant: false,
        note: 'Necesită aprobare specială pentru GDPR'
      },
      {
        id: 'patients.medical_history',
        name: 'Acces istoric medical',
        description: 'Poate vedea istoricul medical complet',
        admin: true,
        dentist: true,
        assistant: true
      },
      {
        id: 'patients.export',
        name: 'Export date pacienți',
        description: 'Poate exporta liste și date despre pacienți',
        admin: true,
        dentist: true,
        assistant: false
      }
    ]
  },
  {
    id: 'treatments',
    name: 'Tratamente',
    icon: Stethoscope,
    description: 'Permisiuni pentru gestionarea tratamentelor dentare',
    permissions: [
      {
        id: 'treatments.create',
        name: 'Creare tratamente',
        description: 'Poate crea planuri de tratament noi',
        admin: true,
        dentist: true,
        assistant: false,
        requiresLicense: true
      },
      {
        id: 'treatments.edit',
        name: 'Modificare tratamente',
        description: 'Poate edita tratamente existente',
        admin: true,
        dentist: true,
        assistant: false,
        requiresLicense: true
      },
      {
        id: 'treatments.delete',
        name: 'Ștergere tratamente',
        description: 'Poate șterge tratamente',
        admin: true,
        dentist: false,
        assistant: false
      },
      {
        id: 'treatments.view',
        name: 'Vizualizare tratamente',
        description: 'Poate vedea detaliile tratamentelor',
        admin: true,
        dentist: true,
        assistant: true
      },
      {
        id: 'treatments.diagnose',
        name: 'Stabilire diagnostic',
        description: 'Poate stabili diagnostice medicale',
        admin: false,
        dentist: true,
        assistant: false,
        requiresLicense: true,
        note: 'Necesită licență medicală validă'
      }
    ]
  },
  {
    id: 'appointments',
    name: 'Programări',
    icon: Calendar,
    description: 'Permisiuni pentru gestionarea programărilor',
    permissions: [
      {
        id: 'appointments.create',
        name: 'Creare programări',
        description: 'Poate adăuga programări noi',
        admin: true,
        dentist: true,
        assistant: true
      },
      {
        id: 'appointments.edit',
        name: 'Modificare programări',
        description: 'Poate modifica programări existente',
        admin: true,
        dentist: true,
        assistant: true
      },
      {
        id: 'appointments.cancel',
        name: 'Anulare programări',
        description: 'Poate anula programări',
        admin: true,
        dentist: true,
        assistant: true
      },
      {
        id: 'appointments.view_all',
        name: 'Vezi toate programările',
        description: 'Poate vedea programările tuturor medicilor',
        admin: true,
        dentist: false,
        assistant: true
      }
    ]
  },
  {
    id: 'financial',
    name: 'Financiar',
    icon: CreditCard,
    description: 'Permisiuni pentru operațiuni financiare',
    permissions: [
      {
        id: 'financial.receipts',
        name: 'Emitere bonuri',
        description: 'Poate emite bonuri fiscale',
        admin: true,
        dentist: true,
        assistant: false
      },
      {
        id: 'financial.payments',
        name: 'Procesare plăți',
        description: 'Poate procesa plăți de la pacienți',
        admin: true,
        dentist: true,
        assistant: false
      },
      {
        id: 'financial.discounts',
        name: 'Aplicare reduceri',
        description: 'Poate aplica reduceri la tratamente',
        admin: true,
        dentist: true,
        assistant: false
      },
      {
        id: 'financial.reports',
        name: 'Rapoarte financiare',
        description: 'Poate genera și vedea rapoarte financiare',
        admin: true,
        dentist: false,
        assistant: false
      }
    ]
  },
  {
    id: 'reports',
    name: 'Rapoarte',
    icon: BarChart3,
    description: 'Permisiuni pentru rapoarte și statistici',
    permissions: [
      {
        id: 'reports.view_own',
        name: 'Rapoarte proprii',
        description: 'Poate vedea rapoarte despre propria activitate',
        admin: true,
        dentist: true,
        assistant: true
      },
      {
        id: 'reports.view_all',
        name: 'Toate rapoartele',
        description: 'Poate vedea toate rapoartele din sistem',
        admin: true,
        dentist: false,
        assistant: false
      },
      {
        id: 'reports.export',
        name: 'Export rapoarte',
        description: 'Poate exporta rapoarte în diverse formate',
        admin: true,
        dentist: true,
        assistant: false
      }
    ]
  },
  {
    id: 'system',
    name: 'Sistem',
    icon: Settings,
    description: 'Permisiuni pentru configurarea sistemului',
    permissions: [
      {
        id: 'system.settings',
        name: 'Setări sistem',
        description: 'Poate modifica setările sistemului',
        admin: true,
        dentist: false,
        assistant: false
      },
      {
        id: 'system.backup',
        name: 'Backup date',
        description: 'Poate crea copii de siguranță',
        admin: true,
        dentist: false,
        assistant: false
      },
      {
        id: 'system.audit',
        name: 'Audit logs',
        description: 'Poate vedea jurnalele de audit',
        admin: true,
        dentist: false,
        assistant: false
      },
      {
        id: 'system.integrations',
        name: 'Integrări externe',
        description: 'Poate configura integrări cu alte sisteme',
        admin: true,
        dentist: false,
        assistant: false
      }
    ]
  }
];

export const UserPermissions: React.FC<UserPermissionsProps> = ({
  currentRole,
  compareRoles = true,
  showDescriptions = true,
  interactive = false,
  onPermissionChange
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(permissionCategories.map(cat => cat.id))
  );
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(currentRole || null);
  const [hoveredPermission, setHoveredPermission] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getRoleData = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return { icon: Shield, label: 'Administrator', color: 'purple' };
      case 'DENTIST':
        return { icon: Stethoscope, label: 'Dentist', color: 'blue' };
      case 'ASSISTANT':
        return { icon: UserCog, label: 'Asistent', color: 'green' };
    }
  };

  const getPermissionIcon = (admin: boolean, dentist: boolean, assistant: boolean) => {
    const count = [admin, dentist, assistant].filter(Boolean).length;
    
    if (count === 3) return <Check className="w-4 h-4 text-green-500" />;
    if (count === 0) return <X className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-yellow-500" />;
  };

  const getPermissionValue = (permission: Permission, role: UserRole): boolean => {
    switch (role) {
      case 'ADMIN': return permission.admin;
      case 'DENTIST': return permission.dentist;
      case 'ASSISTANT': return permission.assistant;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Role Selector */}
      {compareRoles && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Matrice Permisiuni pe Roluri
          </h3>
          
          <div className="flex gap-4 mb-4">
            {(['ADMIN', 'DENTIST', 'ASSISTANT'] as UserRole[]).map(role => {
              const roleData = getRoleData(role);
              const Icon = roleData.icon;
              
              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(selectedRole === role ? null : role)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedRole === role
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{roleData.label}</span>
                </button>
              );
            })}
          </div>

          {selectedRole && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Vizualizezi permisiunile pentru rolul <strong>{getRoleData(selectedRole).label}</strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Permissions Matrix */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Permisiune
                </th>
                {compareRoles && (
                  <>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4" />
                        Admin
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        Dentist
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-2">
                        <UserCog className="w-4 h-4" />
                        Asistent
                      </div>
                    </th>
                  </>
                )}
                {showDescriptions && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Descriere
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {permissionCategories.map(category => {
                const CategoryIcon = category.icon;
                const isExpanded = expandedCategories.has(category.id);
                
                return (
                  <React.Fragment key={category.id}>
                    <tr 
                      className="bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => toggleCategory(category.id)}
                    >
                      <td colSpan={compareRoles ? (showDescriptions ? 5 : 4) : 2} className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          <CategoryIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({category.permissions.length} permisiuni)
                          </span>
                        </div>
                      </td>
                    </tr>
                    
                    {isExpanded && category.permissions.map(permission => (
                      <tr 
                        key={permission.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                        onMouseEnter={() => setHoveredPermission(permission.id)}
                        onMouseLeave={() => setHoveredPermission(null)}
                      >
                        <td className="px-6 py-3 pl-14">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {permission.name}
                            </span>
                            {permission.requiresLicense && (
                              <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs rounded-full">
                                Licență
                              </span>
                            )}
                            {permission.note && (
                              <div className="relative group">
                                <Info className="w-3 h-3 text-gray-400" />
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
                                  <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                    {permission.note}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        {compareRoles && (
                          <>
                            <td className="px-6 py-3 text-center">
                              {permission.admin ? (
                                <Check className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                              )}
                            </td>
                            <td className="px-6 py-3 text-center">
                              {permission.dentist ? (
                                <Check className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                              )}
                            </td>
                            <td className="px-6 py-3 text-center">
                              {permission.assistant ? (
                                <Check className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                              )}
                            </td>
                          </>
                        )}
                        
                        {showDescriptions && (
                          <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {permission.description}
                          </td>
                        )}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Sumar Permisiuni
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['ADMIN', 'DENTIST', 'ASSISTANT'] as UserRole[]).map(role => {
            const roleData = getRoleData(role);
            const Icon = roleData.icon;
            const totalPermissions = permissionCategories.reduce((acc, cat) => 
              acc + cat.permissions.filter(p => getPermissionValue(p, role)).length, 0
            );
            const totalPossible = permissionCategories.reduce((acc, cat) => 
              acc + cat.permissions.length, 0
            );
            
            return (
              <div key={role} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {roleData.label}
                  </h5>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Permisiuni active:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {totalPermissions} / {totalPossible}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        role === 'ADMIN' ? 'bg-purple-500' :
                        role === 'DENTIST' ? 'bg-blue-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(totalPermissions / totalPossible) * 100}%` }}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {Math.round((totalPermissions / totalPossible) * 100)}% din toate permisiunile
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserPermissions;