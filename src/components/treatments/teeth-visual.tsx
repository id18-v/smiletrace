'use client';

import React, { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

export type ToothStatus =
  | 'healthy'
  | 'treated'
  | 'missing'
  | 'cavity'
  | 'crown'
  | 'implant'
  | 'bridge';

export type ToothSurface =
  | 'mesial'
  | 'distal'
  | 'occlusal'
  | 'buccal'
  | 'lingual'
  | 'incisal';

export interface ToothData {
  number: number;
  status: ToothStatus;
  surfaces?: ToothSurface[];
  procedures?: string[];
  notes?: string;
}

interface ToothChartProps {
  selectedTeeth: number[];
  toothData?: ToothData[];
  onToothSelect?: (toothNumber: number) => void;
  onMultiSelect?: (teeth: number[]) => void;
  readOnly?: boolean;
  showLabels?: boolean;
  showQuadrants?: boolean;
  className?: string;
}

const TOOTH_POSITIONS = {
  // Rândul de sus (17-32) - Maxilar Superior
  17: { x: -1, y: 0, quadrant: 2, type: 'molar', rotation: 0 },
  18: { x: 0, y: 0, quadrant: 2, type: 'molar', rotation: 0 },
  19: { x: 1, y: 0, quadrant: 2, type: 'molar', rotation: 0 },
  20: { x: 2, y: 0, quadrant: 2, type: 'premolar', rotation: 0 },
  21: { x: 3, y: 0, quadrant: 2, type: 'premolar', rotation: 0 },
  22: { x: 4, y: 0, quadrant: 2, type: 'canine', rotation: 0 },
  23: { x: 5, y: 0, quadrant: 2, type: 'incisor', rotation: 0 },
  24: { x: 6, y: 0, quadrant: 2, type: 'incisor', rotation: 0 },
  
  25: { x: 7, y: 0, quadrant: 1, type: 'incisor', rotation: 0 },
  26: { x: 8, y: 0, quadrant: 1, type: 'incisor', rotation: 0 },
  27: { x: 9, y: 0, quadrant: 1, type: 'canine', rotation: 0 },
  28: { x: 10, y: 0, quadrant: 1, type: 'premolar', rotation: 0 },
  29: { x: 11, y: 0, quadrant: 1, type: 'premolar', rotation: 0 },
  30: { x: 12, y: 0, quadrant: 1, type: 'molar', rotation: 0 },
  31: { x: 13, y: 0, quadrant: 1, type: 'molar', rotation: 0 },
  32: { x: 14, y: 0, quadrant: 1, type: 'molar', rotation: 0 },

  // Rândul de jos (1-16) - Maxilar Inferior
  1: { x: 14, y: 1, quadrant: 4, type: 'molar', rotation: 180 },
  2: { x: 13, y: 1, quadrant: 4, type: 'molar', rotation: 180 },
  3: { x: 12, y: 1, quadrant: 4, type: 'molar', rotation: 180 },
  4: { x: 11, y: 1, quadrant: 4, type: 'premolar', rotation: 180 },
  5: { x: 10, y: 1, quadrant: 4, type: 'premolar', rotation: 180 },
  6: { x: 9, y: 1, quadrant: 4, type: 'canine', rotation: 180 },
  7: { x: 8, y: 1, quadrant: 4, type: 'incisor', rotation: 180 },
  8: { x: 7, y: 1, quadrant: 4, type: 'incisor', rotation: 180 },

  9: { x: 6, y: 1, quadrant: 3, type: 'incisor', rotation: 180 },
  10: { x: 5, y: 1, quadrant: 3, type: 'incisor', rotation: 180 },
  11: { x: 4, y: 1, quadrant: 3, type: 'canine', rotation: 180 },
  12: { x: 3, y: 1, quadrant: 3, type: 'premolar', rotation: 180 },
  13: { x: 2, y: 1, quadrant: 3, type: 'premolar', rotation: 180 },
  14: { x: 1, y: 1, quadrant: 3, type: 'molar', rotation: 180 },
  15: { x: 0, y: 1, quadrant: 3, type: 'molar', rotation: 180 },
  16: { x: -1, y: 1, quadrant: 3, type: 'molar', rotation: 180 },
};

const getToothFallback = (type: string) => '🦷';

const ToothImage: React.FC<{
  number: number;
  position: typeof TOOTH_POSITIONS[1];
  status: ToothStatus;
  isSelected: boolean;
  onClick?: () => void;
  readOnly?: boolean;
  showLabel?: boolean;
}> = ({ number, position, status, isSelected, onClick, readOnly, showLabel }) => {
  const size = position.type === 'molar' ? 45 : position.type === 'premolar' ? 40 : 35;

  return (
    <div
      className={cn(
        'relative inline-block transition-all duration-200',
        !readOnly && status !== 'missing' && 'cursor-pointer hover:scale-110',
        isSelected && 'ring-2 ring-orange-500 rounded-lg'
      )}
      onClick={!readOnly && status !== 'missing' ? onClick : undefined}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <div
        className={cn(
          'w-full h-full flex items-center justify-center text-2xl',
          'bg-gray-100 dark:bg-gray-700 rounded-lg border-2',
          status === 'healthy' && 'border-gray-300 bg-white',
          status === 'cavity' && 'border-red-400 bg-red-50',
          status === 'crown' && 'border-blue-400 bg-blue-50',
          status === 'treated' && 'border-orange-400 bg-orange-50',
          status === 'implant' && 'border-purple-400 bg-purple-50',
          status === 'missing' && 'border-gray-200 bg-transparent text-gray-400'
        )}
      >
        {status !== 'missing' ? getToothFallback(position.type) : '✕'}
      </div>

      {status === 'cavity' && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      )}

      {showLabel && (
        <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 dark:text-gray-400">
          {number}
        </div>
      )}

      {isSelected && (
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
      )}
    </div>
  );
};

export const ToothChartImages: React.FC<ToothChartProps> = ({
  selectedTeeth = [],
  toothData = [],
  onToothSelect,
  onMultiSelect,
  readOnly = false,
  showLabels = true,
  showQuadrants = true,
  className,
}) => {
  const toothDataMap = useMemo(() => {
    const map = new Map<number, ToothData>();
    toothData.forEach((tooth) => map.set(tooth.number, tooth));
    return map;
  }, [toothData]);

  const handleToothClick = useCallback(
    (toothNumber: number) => {
      if (readOnly) return;
      const toothInfo = toothDataMap.get(toothNumber);
      if (toothInfo?.status === 'missing') return;

      if (onToothSelect) onToothSelect(toothNumber);

      if (onMultiSelect) {
        const newSelection = selectedTeeth.includes(toothNumber)
          ? selectedTeeth.filter((n) => n !== toothNumber)
          : [...selectedTeeth, toothNumber];
        onMultiSelect(newSelection);
      }
    },
    [readOnly, selectedTeeth, toothDataMap, onToothSelect, onMultiSelect]
  );

  return (
    <div className={cn('w-full max-w-4xl mx-auto p-4', className)}>
      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center mb-4">
            Maxilar Superior
          </h3>

          {showQuadrants && (
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Cadran 2</span>
              <span>Cadran 1</span>
            </div>
          )}

          <div className="flex justify-center gap-1 flex-wrap">
            {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => {
              const toothInfo =
                toothDataMap.get(num) || { number: num, status: 'healthy' as ToothStatus };
              const position = TOOTH_POSITIONS[num as keyof typeof TOOTH_POSITIONS];

              return (
                <ToothImage
                  key={num}
                  number={num}
                  position={position}
                  status={toothInfo.status}
                  isSelected={selectedTeeth.includes(num)}
                  onClick={() => handleToothClick(num)}
                  readOnly={readOnly}
                  showLabel={showLabels}
                />
              );
            })}
          </div>
        </div>

        <div className="border-t-2 border-gray-200 dark:border-gray-600 relative">
          <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-4 text-xs text-gray-500">
            Linia mediană
          </span>
        </div>

        <div>
          <div className="flex justify-center gap-1 flex-wrap">
            {Array.from({ length: 16 }, (_, i) => 32 - i).map((num) => {
              const toothInfo =
                toothDataMap.get(num) || { number: num, status: 'healthy' as ToothStatus };
              const position = TOOTH_POSITIONS[num as keyof typeof TOOTH_POSITIONS];

              return (
                <ToothImage
                  key={num}
                  number={num}
                  position={position}
                  status={toothInfo.status}
                  isSelected={selectedTeeth.includes(num)}
                  onClick={() => handleToothClick(num)}
                  readOnly={readOnly}
                  showLabel={showLabels}
                />
              );
            })}
          </div>

          {showQuadrants && (
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Cadran 3</span>
              <span>Cadran 4</span>
            </div>
          )}

          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center mt-4">
            Maxilar Inferior
          </h3>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Legendă:</div>
        {[
          { status: 'healthy', label: 'Sănătos', color: 'bg-white border-gray-300' },
          { status: 'treated', label: 'Tratat', color: 'bg-orange-50 border-orange-300' },
          { status: 'cavity', label: 'Carie', color: 'bg-red-50 border-red-300' },
          { status: 'crown', label: 'Coroană', color: 'bg-blue-50 border-blue-300' },
          { status: 'implant', label: 'Implant', color: 'bg-purple-50 border-purple-300' },
          { status: 'bridge', label: 'Punte', color: 'bg-green-50 border-green-300' },
          { status: 'missing', label: 'Lipsă', color: 'bg-gray-50 border-gray-200' },
        ].map((item) => (
          <div key={item.status} className="flex items-center gap-2">
            <div className={cn('w-4 h-4 rounded border-2', item.color)} />
            <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
          </div>
        ))}
      </div>

      {selectedTeeth.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-medium">Dinți selectați:</span>{' '}
            {selectedTeeth.sort((a, b) => a - b).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};