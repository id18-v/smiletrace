// src/components/users/role-selector.tsx
'use client';

import React, { useState } from 'react';
import {
  Shield,
  Stethoscope,
  UserCog,
  Check,
  AlertTriangle,
  Info,
  ChevronDown
} from 'lucide-react';

export type UserRole = 'ADMIN' | 'DENTIST' | 'ASSISTANT';

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  permissions: string[];
  restrictions?: string[];
}

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
  showDescriptions?: boolean;
  showPermissions?: boolean;
  currentUserRole?: UserRole;
  error?: string;
}

const roleOptions: RoleOption[] = [
  {
    value: 'ADMIN',
    label: 'Administrator',
    description: 'Acces complet la sistem și gestionare utilizatori',
    icon: Shield,
    color: 'purple',
    permissions: [
      'Gestionare utilizatori',
      'Configurare sistem',
      'Acces la toate modulele',
      'Vizualizare rapoarte complete',
      'Export date',
      'Ștergere înregistrări'
    ],
    restrictions: [
      'Nu poate fi șters din sistem',
      'Trebuie să existe cel puțin un administrator activ'
    ]
  },
  {
    value: 'DENTIST',
    label: 'Dentist',
    description: 'Acces la pacienți, tratamente și programări',
    icon: Stethoscope,
    color: 'blue',
    permissions: [
      'Gestionare pacienți',
      'Creare și editare tratamente',
      'Gestionare programări',
      'Emitere bonuri fiscale',
      'Vizualizare rapoarte proprii',
      'Export date pacienți'
    ],
    restrictions: [
      'Nu poate gestiona utilizatori',
      'Nu poate modifica setările sistemului'
    ]
  },
  {
    value: 'ASSISTANT',
    label: 'Asistent Medical',
    description: 'Acces limitat la programări și informații pacienți',
    icon: UserCog,
    color: 'green',
    permissions: [
      'Vizualizare pacienți',
      'Gestionare programări',
      'Vizualizare tratamente',
      'Asistență în tratamente',
      'Actualizare date pacienți'
    ],
    restrictions: [
      'Nu poate crea tratamente noi',
      'Nu poate emite bonuri fiscale',
      'Nu poate șterge înregistrări'
    ]
  }
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  showDescriptions = true,
  showPermissions = false,
  currentUserRole,
  error
}) => {
  const [expandedRole, setExpandedRole] = useState<UserRole | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedRole = roleOptions.find(role => role.value === value);

  const canAssignRole = (role: UserRole): boolean => {
    if (!currentUserRole) return true;
    
    // Only admins can assign admin role
    if (role === 'ADMIN' && currentUserRole !== 'ADMIN') {
      return false;
    }
    
    // Admins can assign any role
    if (currentUserRole === 'ADMIN') {
      return true;
    }
    
    // Non-admins cannot assign any roles
    return false;
  };

  const getRoleStyles = (color: string, isSelected: boolean) => {
    const styles = {
      purple: {
        container: isSelected 
          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' 
          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700',
        icon: isSelected 
          ? 'text-purple-600 dark:text-purple-400' 
          : 'text-gray-500 dark:text-gray-400',
        text: isSelected 
          ? 'text-purple-900 dark:text-purple-200' 
          : 'text-gray-700 dark:text-gray-300',
        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      },
      blue: {
        container: isSelected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700',
        icon: isSelected 
          ? 'text-blue-600 dark:text-blue-400' 
          : 'text-gray-500 dark:text-gray-400',
        text: isSelected 
          ? 'text-blue-900 dark:text-blue-200' 
          : 'text-gray-700 dark:text-gray-300',
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      },
      green: {
        container: isSelected 
          ? 'border-green-500 bg-green-50 dark:bg-green-900/30' 
          : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700',
        icon: isSelected 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-gray-500 dark:text-gray-400',
        text: isSelected 
          ? 'text-green-900 dark:text-green-200' 
          : 'text-gray-700 dark:text-gray-300',
        badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      }
    };

    return styles[color as keyof typeof styles] || styles.blue;
  };

  // Grid Layout Mode
  const renderGridLayout = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roleOptions.map((role) => {
          const Icon = role.icon;
          const isSelected = value === role.value;
          const canAssign = canAssignRole(role.value);
          const styles = getRoleStyles(role.color, isSelected);

          return (
            <button
              key={role.value}
              type="button"
              onClick={() => canAssign && onChange(role.value)}
              disabled={disabled || !canAssign}
              className={`relative p-4 rounded-lg border-2 transition-all ${styles.container} ${
                disabled || !canAssign ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="bg-blue-500 rounded-full p-1">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}

              <div className="text-center">
                <Icon className={`w-8 h-8 mx-auto mb-2 ${styles.icon}`} />
                <h4 className={`font-semibold ${styles.text}`}>{role.label}</h4>
                
                {showDescriptions && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {role.description}
                  </p>
                )}
              </div>

              {!canAssign && currentUserRole && (
                <div className="absolute inset-0 bg-gray-900/10 dark:bg-gray-900/30 rounded-lg flex items-center justify-center">
                  <div className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded text-xs">
                    Doar administratorii
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {showPermissions && value && (
        <div className="mt-6 space-y-4">
          {roleOptions.map((role) => (
            <div
              key={role.value}
              className={`transition-all ${
                expandedRole === role.value || value === role.value
                  ? 'block'
                  : 'hidden'
              }`}
            >
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <role.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Permisiuni {role.label}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wider mb-2">
                      Poate să:
                    </p>
                    <ul className="space-y-1">
                      {role.permissions.map((permission, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{permission}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {role.restrictions && role.restrictions.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wider mb-2">
                        Restricții:
                      </p>
                      <ul className="space-y-1">
                        {role.restrictions.map((restriction, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                            <span>{restriction}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Dropdown Mode
  const renderDropdown = () => (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={disabled}
        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {selectedRole ? (
          <div className="flex items-center gap-2">
            <selectedRole.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-900 dark:text-white">{selectedRole.label}</span>
          </div>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">Selectează rol</span>
        )}
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isDropdownOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
          {roleOptions.map((role) => {
            const Icon = role.icon;
            const canAssign = canAssignRole(role.value);
            
            return (
              <button
                key={role.value}
                type="button"
                                onClick={() => {
                                  if (canAssign) {
                                    onChange(role.value);
                                    setIsDropdownOpen(false);
                                  }
                                }}
                                disabled={!canAssign}
                                className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                                  value === role.value ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                                }`}
                              >
                                <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-white">{role.label}</div>
                                  {showDescriptions && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{role.description}</div>
                                  )}
                                </div>
                                {value === role.value && (
                                  <Check className="w-4 h-4 text-blue-500" />
                                )}
                                {!canAssign && (
                                  <div className="text-xs text-yellow-600 dark:text-yellow-400">Restricționat</div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                
                      {error && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mt-2">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm">{error}</span>
                        </div>
                      )}
                    </div>
                  );
                
                  return (
                    <div className="space-y-4">
                      {showPermissions ? renderGridLayout() : renderDropdown()}
                    </div>
                  );
                };