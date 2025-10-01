// src/components/treatments/tooth-selector.tsx

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, RotateCcw, Check, X } from 'lucide-react';

export type ToothSurface = 'mesial' | 'distal' | 'occlusal' | 'buccal' | 'lingual' | 'incisal';

interface SelectedTooth {
  number: number;
  surfaces: ToothSurface[];
}

interface ToothSelectorProps {
  selectedTeeth: SelectedTooth[];
  onSelectionChange: (teeth: SelectedTooth[]) => void;
  allowSurfaceSelection?: boolean;
  allowMultiSelect?: boolean;
  maxSelection?: number;
  readOnly?: boolean;
  className?: string;
  onConfirm?: (teeth: SelectedTooth[]) => void;
  onCancel?: () => void;
}

// Helper to determine tooth type
const getToothType = (toothNumber: number): 'molar' | 'premolar' | 'canine' | 'incisor' => {
  // Molars: 1-3, 14-16, 17-19, 30-32
  if ([1, 2, 3, 14, 15, 16, 17, 18, 19, 30, 31, 32].includes(toothNumber)) {
    return 'molar';
  }
  // Premolars: 4-5, 12-13, 20-21, 28-29
  if ([4, 5, 12, 13, 20, 21, 28, 29].includes(toothNumber)) {
    return 'premolar';
  }
  // Canines: 6, 11, 22, 27
  if ([6, 11, 22, 27].includes(toothNumber)) {
    return 'canine';
  }
  // Incisors: 7-10, 23-26
  return 'incisor';
};

// Get available surfaces based on tooth type
const getAvailableSurfaces = (toothNumber: number): ToothSurface[] => {
  const type = getToothType(toothNumber);
  
  if (type === 'incisor' || type === 'canine') {
    return ['mesial', 'distal', 'buccal', 'lingual', 'incisal'];
  } else {
    return ['mesial', 'distal', 'occlusal', 'buccal', 'lingual'];
  }
};

const SurfaceSelector: React.FC<{
  toothNumber: number;
  selectedSurfaces: ToothSurface[];
  onSurfaceToggle: (surface: ToothSurface) => void;
  disabled?: boolean;
}> = ({ toothNumber, selectedSurfaces, onSurfaceToggle, disabled }) => {
  const availableSurfaces = getAvailableSurfaces(toothNumber);
  const toothType = getToothType(toothNumber);
  
  // Surface abbreviations
  const surfaceLabels: Record<ToothSurface, string> = {
    mesial: 'M',
    distal: 'D',
    occlusal: 'O',
    buccal: 'B',
    lingual: 'L',
    incisal: 'I',
  };

  return (
    <div className="relative w-32 h-32 mx-auto">
      {/* Visual tooth representation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={cn(
          'w-20 h-20 border-2 border-gray-300 bg-gray-50',
          toothType === 'molar' ? 'rounded-lg' : 'rounded-md'
        )}>
          {/* Tooth number in center */}
          <div className="flex items-center justify-center h-full">
            <span className="text-lg font-semibold text-gray-700">{toothNumber}</span>
          </div>
        </div>
      </div>
      
      {/* Surface buttons positioned around the tooth */}
      {availableSurfaces.includes('mesial') && (
        <button
          onClick={() => onSurfaceToggle('mesial')}
          disabled={disabled}
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full text-xs font-medium transition-all',
            selectedSurfaces.includes('mesial')
              ? 'bg-blue-500 text-white shadow-lg scale-110'
              : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {surfaceLabels.mesial}
        </button>
      )}
      
      {availableSurfaces.includes('distal') && (
        <button
          onClick={() => onSurfaceToggle('distal')}
          disabled={disabled}
          className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full text-xs font-medium transition-all',
            selectedSurfaces.includes('distal')
              ? 'bg-blue-500 text-white shadow-lg scale-110'
              : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {surfaceLabels.distal}
        </button>
      )}
      
      {availableSurfaces.includes('occlusal') && (
        <button
          onClick={() => onSurfaceToggle('occlusal')}
          disabled={disabled}
          className={cn(
            'absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full text-xs font-medium transition-all',
            selectedSurfaces.includes('occlusal')
              ? 'bg-blue-500 text-white shadow-lg scale-110'
              : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {surfaceLabels.occlusal}
        </button>
      )}
      
      {availableSurfaces.includes('incisal') && (
        <button
          onClick={() => onSurfaceToggle('incisal')}
          disabled={disabled}
          className={cn(
            'absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full text-xs font-medium transition-all',
            selectedSurfaces.includes('incisal')
              ? 'bg-blue-500 text-white shadow-lg scale-110'
              : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {surfaceLabels.incisal}
        </button>
      )}
      
      {availableSurfaces.includes('buccal') && (
        <button
          onClick={() => onSurfaceToggle('buccal')}
          disabled={disabled}
          className={cn(
            'absolute bottom-0 left-1/2 -translate-x-1/2 translate-x-4 w-8 h-8 rounded-full text-xs font-medium transition-all',
            selectedSurfaces.includes('buccal')
              ? 'bg-blue-500 text-white shadow-lg scale-110'
              : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {surfaceLabels.buccal}
        </button>
      )}
      
      {availableSurfaces.includes('lingual') && (
        <button
          onClick={() => onSurfaceToggle('lingual')}
          disabled={disabled}
          className={cn(
            'absolute bottom-0 left-1/2 -translate-x-1/2 -translate-x-4 w-8 h-8 rounded-full text-xs font-medium transition-all',
            selectedSurfaces.includes('lingual')
              ? 'bg-blue-500 text-white shadow-lg scale-110'
              : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {surfaceLabels.lingual}
        </button>
      )}
    </div>
  );
};

export const ToothSelector: React.FC<ToothSelectorProps> = ({
  selectedTeeth,
  onSelectionChange,
  allowSurfaceSelection = true,
  allowMultiSelect = true,
  maxSelection,
  readOnly = false,
  className,
  onConfirm,
  onCancel,
}) => {
  const [currentToothIndex, setCurrentToothIndex] = useState(0);
  const [localSelection, setLocalSelection] = useState<SelectedTooth[]>(selectedTeeth);
  const [quickSelectMode, setQuickSelectMode] = useState<'quadrant' | 'arch' | null>(null);

  useEffect(() => {
    setLocalSelection(selectedTeeth);
  }, [selectedTeeth]);

  const handleToothToggle = useCallback((toothNumber: number) => {
    if (readOnly) return;

    setLocalSelection(prev => {
      const existing = prev.find(t => t.number === toothNumber);
      
      if (existing) {
        // Remove tooth
        const newSelection = prev.filter(t => t.number !== toothNumber);
        onSelectionChange(newSelection);
        return newSelection;
      } else {
        // Add tooth
        if (maxSelection && prev.length >= maxSelection && !allowMultiSelect) {
          // Replace if max reached and multi-select not allowed
          const newSelection = [{ number: toothNumber, surfaces: [] }];
          onSelectionChange(newSelection);
          return newSelection;
        } else if (!maxSelection || prev.length < maxSelection) {
          const newSelection = [...prev, { number: toothNumber, surfaces: [] }];
          onSelectionChange(newSelection);
          return newSelection;
        }
      }
      return prev;
    });
  }, [readOnly, maxSelection, allowMultiSelect, onSelectionChange]);

  const handleSurfaceToggle = useCallback((toothNumber: number, surface: ToothSurface) => {
    if (readOnly || !allowSurfaceSelection) return;

    setLocalSelection(prev => {
      const newSelection = prev.map(tooth => {
        if (tooth.number === toothNumber) {
          const surfaces = tooth.surfaces.includes(surface)
            ? tooth.surfaces.filter(s => s !== surface)
            : [...tooth.surfaces, surface];
          return { ...tooth, surfaces };
        }
        return tooth;
      });
      onSelectionChange(newSelection);
      return newSelection;
    });
  }, [readOnly, allowSurfaceSelection, onSelectionChange]);

  const handleQuickSelect = useCallback((mode: 'quadrant' | 'arch', value: number) => {
    if (readOnly) return;

    let toothNumbers: number[] = [];
    
    if (mode === 'quadrant') {
      // Quadrant selection
      switch (value) {
        case 1: toothNumbers = [1, 2, 3, 4, 5, 6, 7, 8]; break;
        case 2: toothNumbers = [9, 10, 11, 12, 13, 14, 15, 16]; break;
        case 3: toothNumbers = [17, 18, 19, 20, 21, 22, 23, 24]; break;
        case 4: toothNumbers = [25, 26, 27, 28, 29, 30, 31, 32]; break;
      }
    } else {
      // Arch selection
      if (value === 1) {
        // Upper arch
        toothNumbers = Array.from({ length: 16 }, (_, i) => i + 1);
      } else {
        // Lower arch
        toothNumbers = Array.from({ length: 16 }, (_, i) => i + 17);
      }
    }

    const newTeeth = toothNumbers.map(n => ({ number: n, surfaces: [] }));
    setLocalSelection(newTeeth);
    onSelectionChange(newTeeth);
  }, [readOnly, onSelectionChange]);

  const handleReset = useCallback(() => {
    setLocalSelection([]);
    onSelectionChange([]);
  }, [onSelectionChange]);

  const currentTooth = localSelection[currentToothIndex];

  return (
    <div className={cn('bg-white rounded-lg shadow-lg p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Tooth Selection</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {localSelection.length} teeth selected
          </span>
          {!readOnly && (
            <button
              onClick={handleReset}
              className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
              title="Reset selection"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Select Options */}
      {!readOnly && allowMultiSelect && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Quick Select:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setQuickSelectMode(quickSelectMode === 'quadrant' ? null : 'quadrant')}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-colors',
                  quickSelectMode === 'quadrant'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                By Quadrant
              </button>
              <button
                onClick={() => setQuickSelectMode(quickSelectMode === 'arch' ? null : 'arch')}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-colors',
                  quickSelectMode === 'arch'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                By Arch
              </button>
            </div>
          </div>

          {quickSelectMode === 'quadrant' && (
            <div className="flex gap-2 ml-20">
              {[1, 2, 3, 4].map(q => (
                <button
                  key={q}
                  onClick={() => handleQuickSelect('quadrant', q)}
                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Q{q}
                </button>
              ))}
            </div>
          )}

          {quickSelectMode === 'arch' && (
            <div className="flex gap-2 ml-20">
              <button
                onClick={() => handleQuickSelect('arch', 1)}
                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
              >
                Upper Arch
              </button>
              <button
                onClick={() => handleQuickSelect('arch', 2)}
                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
              >
                Lower Arch
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tooth Grid */}
      <div className="space-y-4">
        {/* Upper Teeth */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Upper Teeth (1-16)</h4>
          <div className="grid grid-cols-8 gap-1">
            {Array.from({ length: 16 }, (_, i) => i + 1).map(toothNumber => {
              const isSelected = localSelection.some(t => t.number === toothNumber);
              const tooth = localSelection.find(t => t.number === toothNumber);
              const hasSurfaces = tooth && tooth.surfaces.length > 0;
              
              return (
                <button
                  key={toothNumber}
                  onClick={() => handleToothToggle(toothNumber)}
                  disabled={readOnly}
                  className={cn(
                    'relative h-12 rounded-md border-2 text-sm font-medium transition-all',
                    'flex items-center justify-center',
                    isSelected
                      ? hasSurfaces
                        ? 'bg-blue-500 text-white border-blue-600 shadow-md'
                        : 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                    readOnly && 'cursor-not-allowed opacity-60'
                  )}
                >
                  {toothNumber}
                  {hasSurfaces && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lower Teeth */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Lower Teeth (17-32)</h4>
          <div className="grid grid-cols-8 gap-1">
            {Array.from({ length: 16 }, (_, i) => i + 17).map(toothNumber => {
              const isSelected = localSelection.some(t => t.number === toothNumber);
              const tooth = localSelection.find(t => t.number === toothNumber);
              const hasSurfaces = tooth && tooth.surfaces.length > 0;
              
              return (
                <button
                  key={toothNumber}
                  onClick={() => handleToothToggle(toothNumber)}
                  disabled={readOnly}
                  className={cn(
                    'relative h-12 rounded-md border-2 text-sm font-medium transition-all',
                    'flex items-center justify-center',
                    isSelected
                      ? hasSurfaces
                        ? 'bg-blue-500 text-white border-blue-600 shadow-md'
                        : 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                    readOnly && 'cursor-not-allowed opacity-60'
                  )}
                >
                  {toothNumber}
                  {hasSurfaces && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Surface Selection for Selected Teeth */}
      {allowSurfaceSelection && localSelection.length > 0 && !readOnly && (
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700">
              Surface Selection for Tooth #{currentTooth?.number || localSelection[0].number}
            </h4>
            {localSelection.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentToothIndex(Math.max(0, currentToothIndex - 1))}
                  disabled={currentToothIndex === 0}
                  className={cn(
                    'p-1 rounded transition-colors',
                    currentToothIndex === 0
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">
                  {currentToothIndex + 1} / {localSelection.length}
                </span>
                <button
                  onClick={() => setCurrentToothIndex(Math.min(localSelection.length - 1, currentToothIndex + 1))}
                  disabled={currentToothIndex === localSelection.length - 1}
                  className={cn(
                    'p-1 rounded transition-colors',
                    currentToothIndex === localSelection.length - 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {currentTooth && (
            <SurfaceSelector
              toothNumber={currentTooth.number}
              selectedSurfaces={currentTooth.surfaces}
              onSurfaceToggle={(surface) => handleSurfaceToggle(currentTooth.number, surface)}
              disabled={readOnly}
            />
          )}
        </div>
      )}

      {/* Selected Teeth Summary */}
      {localSelection.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Teeth Summary</h4>
          <div className="space-y-1">
            {localSelection.map(tooth => (
              <div key={tooth.number} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Tooth #{tooth.number}
                  {tooth.surfaces.length > 0 && (
                    <span className="ml-2 text-blue-600 font-medium">
                      ({tooth.surfaces.join(', ').toUpperCase()})
                    </span>
                  )}
                </span>
                {!readOnly && (
                  <button
                    onClick={() => handleToothToggle(tooth.number)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {(onConfirm || onCancel) && (
        <div className="mt-6 flex justify-end gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          {onConfirm && (
            <button
              onClick={() => onConfirm(localSelection)}
              disabled={localSelection.length === 0}
              className={cn(
                'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2',
                localSelection.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-300 cursor-not-allowed'
              )}
            >
              <Check className="w-4 h-4" />
              Confirm Selection
            </button>
          )}
        </div>
      )}
    </div>
  );
};