// src/components/treatments/tooth-chart.tsx

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

// Types
export type ToothStatus = 'healthy' | 'treated' | 'missing' | 'cavity' | 'crown' | 'implant' | 'bridge';
export type ToothSurface = 'mesial' | 'distal' | 'occlusal' | 'buccal' | 'lingual' | 'incisal';

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

// Tooth numbering: Universal Numbering System (1-32)
// Upper right: 1-8, Upper left: 9-16
// Lower left: 17-24, Lower right: 25-32

const TOOTH_POSITIONS = {
  // Upper jaw (maxillary)
  1: { x: 740, y: 140, quadrant: 1, type: 'molar' },    // Upper right third molar
  2: { x: 690, y: 130, quadrant: 1, type: 'molar' },    // Upper right second molar
  3: { x: 640, y: 120, quadrant: 1, type: 'molar' },    // Upper right first molar
  4: { x: 590, y: 110, quadrant: 1, type: 'premolar' }, // Upper right second premolar
  5: { x: 540, y: 100, quadrant: 1, type: 'premolar' }, // Upper right first premolar
  6: { x: 490, y: 95, quadrant: 1, type: 'canine' },   // Upper right canine
  7: { x: 440, y: 90, quadrant: 1, type: 'incisor' },  // Upper right lateral incisor
  8: { x: 390, y: 85, quadrant: 1, type: 'incisor' },  // Upper right central incisor
  
  9: { x: 340, y: 85, quadrant: 2, type: 'incisor' },  // Upper left central incisor
  10: { x: 290, y: 90, quadrant: 2, type: 'incisor' }, // Upper left lateral incisor
  11: { x: 240, y: 95, quadrant: 2, type: 'canine' },  // Upper left canine
  12: { x: 190, y: 100, quadrant: 2, type: 'premolar' }, // Upper left first premolar
  13: { x: 140, y: 110, quadrant: 2, type: 'premolar' }, // Upper left second premolar
  14: { x: 90, y: 120, quadrant: 2, type: 'molar' },   // Upper left first molar
  15: { x: 40, y: 130, quadrant: 2, type: 'molar' },   // Upper left second molar
  16: { x: -10, y: 140, quadrant: 2, type: 'molar' },  // Upper left third molar
  
  // Lower jaw (mandibular)
  17: { x: -10, y: 360, quadrant: 3, type: 'molar' },  // Lower left third molar
  18: { x: 40, y: 370, quadrant: 3, type: 'molar' },   // Lower left second molar
  19: { x: 90, y: 380, quadrant: 3, type: 'molar' },   // Lower left first molar
  20: { x: 140, y: 390, quadrant: 3, type: 'premolar' }, // Lower left second premolar
  21: { x: 190, y: 400, quadrant: 3, type: 'premolar' }, // Lower left first premolar
  22: { x: 240, y: 405, quadrant: 3, type: 'canine' },  // Lower left canine
  23: { x: 290, y: 410, quadrant: 3, type: 'incisor' }, // Lower left lateral incisor
  24: { x: 340, y: 415, quadrant: 3, type: 'incisor' }, // Lower left central incisor
  
  25: { x: 390, y: 415, quadrant: 4, type: 'incisor' }, // Lower right central incisor
  26: { x: 440, y: 410, quadrant: 4, type: 'incisor' }, // Lower right lateral incisor
  27: { x: 490, y: 405, quadrant: 4, type: 'canine' },  // Lower right canine
  28: { x: 540, y: 400, quadrant: 4, type: 'premolar' }, // Lower right first premolar
  29: { x: 590, y: 390, quadrant: 4, type: 'premolar' }, // Lower right second premolar
  30: { x: 640, y: 380, quadrant: 4, type: 'molar' },   // Lower right first molar
  31: { x: 690, y: 370, quadrant: 4, type: 'molar' },   // Lower right second molar
  32: { x: 740, y: 360, quadrant: 4, type: 'molar' },   // Lower right third molar
};

const getToothColor = (status: ToothStatus): string => {
  switch (status) {
    case 'healthy':
      return '#e8f5e9'; // Light green
    case 'treated':
      return '#fff3e0'; // Light orange
    case 'missing':
      return '#f5f5f5'; // Light gray
    case 'cavity':
      return '#ffebee'; // Light red
    case 'crown':
      return '#e3f2fd'; // Light blue
    case 'implant':
      return '#f3e5f5'; // Light purple
    case 'bridge':
      return '#e0f2f1'; // Light teal
    default:
      return '#fafafa';
  }
};

const getToothBorderColor = (status: ToothStatus): string => {
  switch (status) {
    case 'healthy':
      return '#4caf50';
    case 'treated':
      return '#ff9800';
    case 'missing':
      return '#9e9e9e';
    case 'cavity':
      return '#f44336';
    case 'crown':
      return '#2196f3';
    case 'implant':
      return '#9c27b0';
    case 'bridge':
      return '#009688';
    default:
      return '#e0e0e0';
  }
};

const ToothSVG: React.FC<{
  number: number;
  position: typeof TOOTH_POSITIONS[1];
  status: ToothStatus;
  isSelected: boolean;
  onClick?: () => void;
  readOnly?: boolean;
  showLabel?: boolean;
}> = ({ number, position, status, isSelected, onClick, readOnly, showLabel }) => {
  const fillColor = getToothColor(status);
  const borderColor = getToothBorderColor(status);
  const size = position.type === 'molar' ? 35 : position.type === 'premolar' ? 30 : 25;
  
  return (
    <g>
      {/* Tooth shape */}
      <rect
        x={position.x}
        y={position.y}
        width={size}
        height={size}
        rx={position.type === 'incisor' ? 3 : 5}
        ry={position.type === 'incisor' ? 3 : 5}
        fill={status === 'missing' ? 'url(#missingPattern)' : fillColor}
        stroke={isSelected ? '#ff5722' : borderColor}
        strokeWidth={isSelected ? 3 : 2}
        opacity={status === 'missing' ? 0.5 : 1}
        className={cn(
          'transition-all duration-200',
          !readOnly && status !== 'missing' && 'cursor-pointer hover:opacity-80'
        )}
        onClick={!readOnly && status !== 'missing' ? onClick : undefined}
      />
      
      {/* Tooth number label */}
      {showLabel && (
        <text
          x={position.x + size / 2}
          y={position.y + size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="12"
          fill={status === 'missing' ? '#999' : '#333'}
          pointerEvents="none"
          className="select-none font-medium"
        >
          {number}
        </text>
      )}
      
      {/* Selection indicator */}
      {isSelected && (
        <circle
          cx={position.x + size / 2}
          cy={position.y - 10}
          r="4"
          fill="#ff5722"
          className="animate-pulse"
        />
      )}
    </g>
  );
};

export const ToothChart: React.FC<ToothChartProps> = ({
  selectedTeeth = [],
  toothData = [],
  onToothSelect,
  onMultiSelect,
  readOnly = false,
  showLabels = true,
  showQuadrants = true,
  className,
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [tempSelection, setTempSelection] = useState<number[]>([]);

  // Create a map of tooth data for quick lookup
  const toothDataMap = useMemo(() => {
    const map = new Map<number, ToothData>();
    toothData.forEach(tooth => map.set(tooth.number, tooth));
    return map;
  }, [toothData]);

  const handleToothClick = useCallback((toothNumber: number) => {
    if (readOnly) return;

    const toothInfo = toothDataMap.get(toothNumber);
    if (toothInfo?.status === 'missing') return;

    if (onToothSelect) {
      onToothSelect(toothNumber);
    }

    if (onMultiSelect) {
      const newSelection = selectedTeeth.includes(toothNumber)
        ? selectedTeeth.filter(n => n !== toothNumber)
        : [...selectedTeeth, toothNumber];
      onMultiSelect(newSelection);
    }
  }, [readOnly, selectedTeeth, toothDataMap, onToothSelect, onMultiSelect]);

  const handleMouseDown = (toothNumber: number) => {
    if (readOnly) return;
    setIsSelecting(true);
    setSelectionStart(toothNumber);
    setTempSelection([toothNumber]);
  };

  const handleMouseEnter = (toothNumber: number) => {
    if (!isSelecting || !selectionStart) return;
    
    // Calculate range selection
    const start = Math.min(selectionStart, toothNumber);
    const end = Math.max(selectionStart, toothNumber);
    const range = [];
    for (let i = start; i <= end; i++) {
      const toothInfo = toothDataMap.get(i);
      if (!toothInfo || toothInfo.status !== 'missing') {
        range.push(i);
      }
    }
    setTempSelection(range);
  };

  const handleMouseUp = () => {
    if (isSelecting && onMultiSelect && tempSelection.length > 0) {
      const newSelection = Array.from(new Set([...selectedTeeth, ...tempSelection]));
      onMultiSelect(newSelection);
    }
    setIsSelecting(false);
    setSelectionStart(null);
    setTempSelection([]);
  };

  // Combine selected and temp selection for display
  const displaySelection = isSelecting 
    ? Array.from(new Set([...selectedTeeth, ...tempSelection]))
    : selectedTeeth;

  return (
    <div className={cn('w-full max-w-4xl mx-auto p-4', className)}>
      <svg
        viewBox="-50 0 850 500"
        className="w-full h-auto"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Define patterns */}
        <defs>
          <pattern id="missingPattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <line x1="0" y1="4" x2="4" y2="0" stroke="#ccc" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Quadrant lines */}
        {showQuadrants && (
          <g opacity="0.3">
            {/* Vertical center line */}
            <line x1="365" y1="50" x2="365" y2="450" stroke="#999" strokeWidth="1" strokeDasharray="5,5" />
            {/* Horizontal center line */}
            <line x1="0" y1="250" x2="730" y2="250" stroke="#999" strokeWidth="1" strokeDasharray="5,5" />
            
            {/* Quadrant labels */}
            <text x="550" y="30" fontSize="14" fill="#666" textAnchor="middle">Quadrant 1</text>
            <text x="180" y="30" fontSize="14" fill="#666" textAnchor="middle">Quadrant 2</text>
            <text x="180" y="480" fontSize="14" fill="#666" textAnchor="middle">Quadrant 3</text>
            <text x="550" y="480" fontSize="14" fill="#666" textAnchor="middle">Quadrant 4</text>
          </g>
        )}

        {/* Jaw labels */}
        <text x="365" y="60" fontSize="16" fill="#333" textAnchor="middle" className="font-semibold">
          Upper Jaw (Maxillary)
        </text>
        <text x="365" y="460" fontSize="16" fill="#333" textAnchor="middle" className="font-semibold">
          Lower Jaw (Mandibular)
        </text>

        {/* Render teeth */}
        {Object.entries(TOOTH_POSITIONS).map(([toothNumber, position]) => {
          const number = parseInt(toothNumber);
          const toothInfo = toothDataMap.get(number) || { number, status: 'healthy' };
          
          return (
            <ToothSVG
              key={number}
              number={number}
              position={position}
              status={toothInfo.status}
              isSelected={displaySelection.includes(number)}
              onClick={() => handleToothClick(number)}
              readOnly={readOnly}
              showLabel={showLabels}
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        {(['healthy', 'treated', 'cavity', 'crown', 'implant', 'bridge', 'missing'] as ToothStatus[]).map(status => (
          <div key={status} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded border-2"
              style={{
                backgroundColor: getToothColor(status),
                borderColor: getToothBorderColor(status),
                opacity: status === 'missing' ? 0.5 : 1,
              }}
            />
            <span className="text-sm capitalize text-gray-700">{status}</span>
          </div>
        ))}
      </div>

      {/* Selection info */}
      {selectedTeeth.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Selected teeth:</span> {selectedTeeth.sort((a, b) => a - b).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};