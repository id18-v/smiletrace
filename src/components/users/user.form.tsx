// src/components/users/user-form.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Stethoscope,
  UserCog,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  X
} from 'lucide-react';

interface UserFormData {
  email: string;
  name: string;
  role: 'ADMIN' | 'DENTIST' | 'ASSISTANT';
  licenseNumber?: string;
  specialization?: string;
  phone?: string;
  password?: string;
  isActive?: boolean;
}

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
  isSubmitting?: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

export const UserForm: React.FC<UserFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  mode,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    name: '',
    role: 'DENTIST',
    licenseNumber: '',
    specialization: '',
    phone: '',
    password: '',
    isActive: true,
    ...initialData
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [generatePassword, setGeneratePassword] = useState(mode === 'create');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const validateField = (field: string, value: any): string | null => {
    switch (field) {
      case 'email':
        if (!value) return 'Email-ul este obligatoriu';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Email invalid';
        }
        break;
      case 'name':
        if (!value) return 'Numele este obligatoriu';
        if (value.length < 2) return 'Numele trebuie să aibă cel puțin 2 caractere';
        break;
      case 'password':
        if (mode === 'create' && !generatePassword && !value) {
          return 'Parola este obligatorie';
        }
        if (value && value.length < 8) {
          return 'Parola trebuie să aibă cel puțin 8 caractere';
        }
        break;
      case 'phone':
        if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
          return 'Număr de telefon invalid';
        }
        break;
      case 'licenseNumber':
        if (formData.role === 'DENTIST' && !value) {
          return 'Numărul de licență este obligatoriu pentru dentiști';
        }
        break;
    }
    return null;
  };

  const handleFieldChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Mark field as touched
    setTouched(prev => new Set(prev).add(field));
    
    // Validate field
    const error = validateField(field, value);
    setErrors(prev => {
      const filtered = prev.filter(e => e.field !== field);
      if (error) {
        return [...filtered, { field, message: error }];
      }
      return filtered;
    });
  };

  const handleBlur = (field: string) => {
    setTouched(prev => new Set(prev).add(field));
    const error = validateField(field, formData[field as keyof UserFormData]);
    if (error) {
      setErrors(prev => {
        const filtered = prev.filter(e => e.field !== field);
        return [...filtered, { field, message: error }];
      });
    }
  };

  const validateForm = (): boolean => {
    const validationErrors: ValidationError[] = [];
    
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field as keyof UserFormData]);
      if (error) {
        validationErrors.push({ field, message: error });
      }
    });

    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched(new Set(Object.keys(formData)));
    
    if (!validateForm()) {
      return;
    }

    const submitData: UserFormData = {
      ...formData
    };

    // Remove password if not provided or in edit mode
    if (mode === 'edit' || (generatePassword && mode === 'create')) {
      delete submitData.password;
    }

    await onSubmit(submitData);
  };

  const getFieldError = (field: string): string | undefined => {
    if (!touched.has(field)) return undefined;
    return errors.find(e => e.field === field)?.message;
  };

  const specializations = [
    'Ortodonție',
    'Endodonție',
    'Parodontologie',
    'Chirurgie Orală',
    'Protetică',
    'Pedodonție',
    'Estetică Dentară',
    'Implantologie'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
          Informații Generale
        </h4>
        
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              disabled={isSubmitting}
              className={`w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white disabled:opacity-50 ${
                getFieldError('email') 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          {getFieldError('email') && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {getFieldError('email')}
            </p>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nume Complet <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              disabled={isSubmitting}
              className={`w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white disabled:opacity-50 ${
                getFieldError('name')
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          {getFieldError('name') && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {getFieldError('name')}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Telefon
          </label>
          <div className="relative">
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              disabled={isSubmitting}
              className={`w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white disabled:opacity-50 ${
                getFieldError('phone')
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="+40 123 456 789"
            />
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          {getFieldError('phone') && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {getFieldError('phone')}
            </p>
          )}
        </div>
      </div>

      {/* Role and Permissions */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
          Rol și Permisiuni
        </h4>
        
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rol <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'DENTIST', label: 'Dentist', icon: Stethoscope, color: 'blue' },
              { value: 'ASSISTANT', label: 'Asistent', icon: UserCog, color: 'green' },
              { value: 'ADMIN', label: 'Administrator', icon: Shield, color: 'purple' }
            ].map((role) => {
              const Icon = role.icon;
              const isSelected = formData.role === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => handleFieldChange('role', role.value)}
                  disabled={isSubmitting}
                  className={`p-3 rounded-lg border-2 transition-all disabled:opacity-50 ${
                    isSelected
                      ? `border-${role.color}-500 bg-${role.color}-50 dark:bg-${role.color}-900/30`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 mx-auto mb-1 ${
                    isSelected 
                      ? `text-${role.color}-600 dark:text-${role.color}-400`
                      : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  <p className={`text-sm font-medium ${
                    isSelected
                      ? `text-${role.color}-900 dark:text-${role.color}-200`
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {role.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dentist-specific fields */}
        {formData.role === 'DENTIST' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Număr Licență <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.licenseNumber || ''}
                onChange={(e) => handleFieldChange('licenseNumber', e.target.value)}
                onBlur={() => handleBlur('licenseNumber')}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white disabled:opacity-50 ${
                  getFieldError('licenseNumber')
                    ? 'border-red-500 dark:border-red-400'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="ex: 12345"
              />
              {getFieldError('licenseNumber') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError('licenseNumber')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Specializare
              </label>
              <select
                value={formData.specialization || ''}
                onChange={(e) => handleFieldChange('specialization', e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white disabled:opacity-50"
              >
                <option value="">Selectează specializarea</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Status (only for edit mode) */}
        {mode === 'edit' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={formData.isActive === true}
                  onChange={() => handleFieldChange('isActive', true)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Activ</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={formData.isActive === false}
                  onChange={() => handleFieldChange('isActive', false)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Inactiv</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Password Section (only for create mode) */}
      {mode === 'create' && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
            Parolă
          </h4>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={generatePassword}
              onChange={(e) => setGeneratePassword(e.target.checked)}
              disabled={isSubmitting}
              className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Generează parolă automată
            </span>
          </label>

          {!generatePassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Parolă <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password || ''}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  disabled={isSubmitting}
                  className={`w-full pr-10 px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white disabled:opacity-50 ${
                    getFieldError('password')
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Minim 8 caractere"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {getFieldError('password') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError('password')}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          Anulează
        </button>
        <button
          type="submit"
          disabled={isSubmitting || errors.length > 0}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          {isSubmitting ? 'Se salvează...' : mode === 'create' ? 'Creează Utilizator' : 'Salvează Modificări'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;