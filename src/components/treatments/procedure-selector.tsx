// src/components/treatments/procedure-selector.tsx

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { 
  Search, 
  Clock, 
  DollarSign, 
  Plus, 
  X, 
  ChevronRight, 
  ChevronDown,
  Info,
  Tag,
  Zap,
  Filter,
  CheckCircle,
  AlertCircle,
  Shield,
  Euro
} from 'lucide-react';
import { 
  ProcedureItem, 
  ProcedureCategory,
  categoryInfo,
  defaultProcedures,
  getCommonlyUsedProcedures,
  searchProcedures,
  calculateTotalCost,
  calculateTotalDuration
} from '@/config/procedures';
import { cn } from '@/lib/utils';

export interface SelectedProcedure extends Omit<ProcedureItem, 'surfaces'> {
  toothNumbers?: number[];
  surfaces?: string[];
  notes?: string;
  quantity?: number;
}

interface ProcedureSelectorProps {
  selectedProcedures: SelectedProcedure[];
  onProcedureAdd: (procedure: ProcedureItem) => void;
  onProcedureRemove: (procedureId: string) => void;
  onSelectionChange?: (procedures: SelectedProcedure[]) => void;
  useInsurancePricing?: boolean;
  showQuickSelect?: boolean;
  className?: string;
  onConfirm?: (procedures: SelectedProcedure[]) => void;
}

export const ProcedureSelector: React.FC<ProcedureSelectorProps> = ({
  selectedProcedures = [],
  onProcedureAdd,
  onProcedureRemove,
  onSelectionChange,
  useInsurancePricing = false,
  showQuickSelect = true,
  className,
  onConfirm
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProcedureCategory | 'ALL'>('ALL');
  const [expandedCategories, setExpandedCategories] = useState<Set<ProcedureCategory>>(new Set());
  const [showInfo, setShowInfo] = useState<string | null>(null);

  // Filter procedures based on search and category
  const filteredProcedures = useMemo(() => {
    let procedures = searchTerm 
      ? searchProcedures(searchTerm)
      : defaultProcedures;

    if (selectedCategory !== 'ALL') {
      procedures = procedures.filter(p => p.category === selectedCategory);
    }

    return procedures;
  }, [searchTerm, selectedCategory]);

  // Group procedures by category
  const groupedProcedures = useMemo(() => {
    const groups = new Map<ProcedureCategory, ProcedureItem[]>();
    
    filteredProcedures.forEach(procedure => {
      if (!groups.has(procedure.category)) {
        groups.set(procedure.category, []);
      }
      groups.get(procedure.category)!.push(procedure);
    });

    return groups;
  }, [filteredProcedures]);

  // Common procedures for quick select
  const commonProcedures = useMemo(() => getCommonlyUsedProcedures(), []);

  // Calculate totals
  const totals = useMemo(() => {
    const procedureIds = selectedProcedures.map(p => p.id);
    return {
      cost: calculateTotalCost(procedureIds, useInsurancePricing),
      duration: calculateTotalDuration(procedureIds),
      count: selectedProcedures.length
    };
  }, [selectedProcedures, useInsurancePricing]);

  // Toggle category expansion
  const toggleCategory = useCallback((category: ProcedureCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  // Handle procedure selection
  const handleProcedureSelect = useCallback((procedure: ProcedureItem) => {
    const isSelected = selectedProcedures.some(p => p.id === procedure.id);
    
    if (isSelected) {
      onProcedureRemove(procedure.id);
    } else {
      onProcedureAdd(procedure);
    }
  }, [selectedProcedures, onProcedureAdd, onProcedureRemove]);

  // Format duration
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? mins + 'min' : ''}`;
    }
    return `${mins} min`;
  };

  // Get price for display
  const getPrice = (procedure: ProcedureItem): number => {
    return useInsurancePricing && procedure.insuranceCost 
      ? procedure.insuranceCost 
      : procedure.defaultCost;
  };

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm', className)}>
      {/* Header */}
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Selectare Proceduri
          </h3>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <input
                type="checkbox"
                checked={useInsurancePricing}
                onChange={(e) => onSelectionChange?.(selectedProcedures)}
                className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Prețuri Asigurare</span>
            </label>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Caută procedură după nume, cod sau tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
          />
        </div>

        {/* Category Filter */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              selectedCategory === 'ALL'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            Toate
          </button>
          {Object.values(ProcedureCategory).map(category => {
            const info = categoryInfo[category];
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1',
                  selectedCategory === category
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                )}
              >
                <span>{info.icon}</span>
                <span>{info.labelRo}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Select - Common Procedures */}
      {showQuickSelect && !searchTerm && selectedCategory === 'ALL' && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-900 dark:text-amber-200">
              Proceduri Frecvente
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {commonProcedures.map(procedure => {
              const isSelected = selectedProcedures.some(p => p.id === procedure.id);
              return (
                <button
                  key={procedure.id}
                  onClick={() => handleProcedureSelect(procedure)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1',
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  )}
                >
                  {isSelected && <CheckCircle className="w-3 h-3" />}
                  <span>{procedure.nameRo || procedure.name}</span>
                  <span className="text-xs opacity-75">
                    {getPrice(procedure)} RON
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Procedures List */}
      <div className="max-h-96 overflow-y-auto">
        {groupedProcedures.size === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Nu s-au găsit proceduri
          </div>
        ) : (
          Array.from(groupedProcedures.entries()).map(([category, procedures]) => {
            const info = categoryInfo[category];
            const isExpanded = expandedCategories.has(category) || selectedCategory !== 'ALL';
            
            return (
              <div key={category} className="border-b dark:border-gray-700 last:border-b-0">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{info.icon}</span>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {info.labelRo}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {procedures.length} proceduri • {info.description}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* Procedures in Category */}
                {isExpanded && (
                  <div className="bg-gray-50 dark:bg-gray-900/50">
                    {procedures.map(procedure => {
                      const isSelected = selectedProcedures.some(p => p.id === procedure.id);
                      const price = getPrice(procedure);
                      
                      return (
                        <div
                          key={procedure.id}
                          className={cn(
                            'px-6 py-3 flex items-center justify-between hover:bg-white dark:hover:bg-gray-800 transition-colors border-l-4',
                            isSelected
                              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                              : 'border-transparent'
                          )}
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <button
                              onClick={() => handleProcedureSelect(procedure)}
                              className={cn(
                                'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                                isSelected
                                  ? 'bg-blue-600 border-blue-600'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                              )}
                            >
                              {isSelected && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </button>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-white">
                                    {procedure.nameRo || procedure.name}
                                  </h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Cod: {procedure.code}
                                    {procedure.description && ` • ${procedure.description}`}
                                  </p>
                                  
                                  <div className="flex items-center gap-4 mt-1">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatDuration(procedure.estimatedDurationMinutes)}
                                    </span>
                                    
                                    {procedure.requiresAnesthesia && (
                                      <span className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Anestezie
                                      </span>
                                    )}
                                    
                                    {procedure.perTooth && (
                                      <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        Per dinte
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="text-right ml-4">
                                  <div className="font-semibold text-gray-900 dark:text-white">
                                    {price} RON
                                  </div>
                                  {useInsurancePricing && procedure.insuranceCost && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 line-through">
                                      {procedure.defaultCost} RON
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer - Selected Procedures Summary */}
      {selectedProcedures.length > 0 && (
        <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Proceduri Selectate ({totals.count})
            </h4>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(totals.duration)}
              </span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                <Euro className="w-5 h-5" />
                {totals.cost} RON
              </span>
            </div>
          </div>

          <div className="space-y-2 max-h-32 overflow-y-auto">
            {selectedProcedures.map(procedure => (
              <div
                key={procedure.id}
                className="flex items-center justify-between py-1 px-2 bg-white dark:bg-gray-800 rounded"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {procedure.nameRo || procedure.name}
                </span>
                <button
                  onClick={() => onProcedureRemove(procedure.id)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {onConfirm && (
            <button
              onClick={() => onConfirm(selectedProcedures)}
              className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
            >
              Confirmă Selecția
            </button>
          )}
        </div>
      )}
    </div>
  );
};