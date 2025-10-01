// src/components/treatments/tooth-chart-svg-advanced.tsx

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Info, ZoomIn, ZoomOut, Move, RotateCcw } from 'lucide-react';

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

export interface SelectedTooth {
  number: number;
  surfaces: ToothSurface[];
}

interface ToothChartSVGAdvancedProps {
  selectedTeeth: SelectedTooth[];
  toothData?: ToothData[];
  onToothSelect?: (tooth: SelectedTooth) => void;
  onSelectionChange?: (teeth: SelectedTooth[]) => void;
  readOnly?: boolean;
  showLabels?: boolean;
  showQuadrants?: boolean;
  className?: string;
}

// Ajustat spacing pentru a evita suprapunerea
const TOOTH_POSITIONS = {
  // Upper jaw - mai sus
  1: { x: 720, y: 100, quadrant: 1, type: 'molar' },
  2: { x: 670, y: 95, quadrant: 1, type: 'molar' },
  3: { x: 620, y: 90, quadrant: 1, type: 'molar' },
  4: { x: 570, y: 85, quadrant: 1, type: 'premolar' },
  5: { x: 520, y: 80, quadrant: 1, type: 'premolar' },
  6: { x: 470, y: 75, quadrant: 1, type: 'canine' },
  7: { x: 420, y: 70, quadrant: 1, type: 'incisor' },
  8: { x: 370, y: 65, quadrant: 1, type: 'incisor' },
  
  9: { x: 320, y: 65, quadrant: 2, type: 'incisor' },
  10: { x: 270, y: 70, quadrant: 2, type: 'incisor' },
  11: { x: 220, y: 75, quadrant: 2, type: 'canine' },
  12: { x: 170, y: 80, quadrant: 2, type: 'premolar' },
  13: { x: 120, y: 85, quadrant: 2, type: 'premolar' },
  14: { x: 70, y: 90, quadrant: 2, type: 'molar' },
  15: { x: 20, y: 95, quadrant: 2, type: 'molar' },
  16: { x: -30, y: 100, quadrant: 2, type: 'molar' },
  
  // Lower jaw - mai jos pentru spacing
  17: { x: -30, y: 380, quadrant: 3, type: 'molar' },
  18: { x: 20, y: 385, quadrant: 3, type: 'molar' },
  19: { x: 70, y: 390, quadrant: 3, type: 'molar' },
  20: { x: 120, y: 395, quadrant: 3, type: 'premolar' },
  21: { x: 170, y: 400, quadrant: 3, type: 'premolar' },
  22: { x: 220, y: 405, quadrant: 3, type: 'canine' },
  23: { x: 270, y: 410, quadrant: 3, type: 'incisor' },
  24: { x: 320, y: 415, quadrant: 3, type: 'incisor' },
  
  25: { x: 370, y: 415, quadrant: 4, type: 'incisor' },
  26: { x: 420, y: 410, quadrant: 4, type: 'incisor' },
  27: { x: 470, y: 405, quadrant: 4, type: 'canine' },
  28: { x: 520, y: 400, quadrant: 4, type: 'premolar' },
  29: { x: 570, y: 395, quadrant: 4, type: 'premolar' },
  30: { x: 620, y: 390, quadrant: 4, type: 'molar' },
  31: { x: 670, y: 385, quadrant: 4, type: 'molar' },
  32: { x: 720, y: 380, quadrant: 4, type: 'molar' },
};

const getToothColor = (status: ToothStatus): string => {
  switch (status) {
    case 'healthy': return '#ffffff';
    case 'treated': return '#ffd4a3';
    case 'missing': return 'transparent';
    case 'cavity': return '#ff6b6b';
    case 'crown': return '#74c0fc';
    case 'implant': return '#d0bfff';
    case 'bridge': return '#8ce99a';
    default: return '#ffffff';
  }
};

// SVG paths pentru dinți realistici
const getToothPath = (type: string, isUpper: boolean) => {
  const baseScale = 1.2;
  
  switch (type) {
    case 'molar':
      return isUpper
        ? `M 0,-15 C -8,-15 -12,-10 -12,-5 L -12,5 C -12,10 -10,15 -8,18 L -6,20 L -3,22 L 0,23 L 3,22 L 6,20 L 8,18 C 10,15 12,10 12,5 L 12,-5 C 12,-10 8,-15 0,-15 Z`
        : `M 0,15 C -8,15 -12,10 -12,5 L -12,-5 C -12,-10 -10,-15 -8,-18 L -6,-20 L -3,-22 L 0,-23 L 3,-22 L 6,-20 L 8,-18 C 10,-15 12,-10 12,-5 L 12,5 C 12,10 8,15 0,15 Z`;
    
    case 'premolar':
      return isUpper
        ? `M 0,-12 C -6,-12 -9,-8 -9,-4 L -9,4 C -9,8 -7,12 -5,14 L -2,16 L 0,17 L 2,16 L 5,14 C 7,12 9,8 9,4 L 9,-4 C 9,-8 6,-12 0,-12 Z`
        : `M 0,12 C -6,12 -9,8 -9,4 L -9,-4 C -9,-8 -7,-12 -5,-14 L -2,-16 L 0,-17 L 2,-16 L 5,-14 C 7,-12 9,-8 9,-4 L 9,4 C 9,8 6,12 0,12 Z`;
    
    case 'canine':
      return isUpper
        ? `M 0,-14 C -5,-14 -7,-10 -7,-6 L -6,2 C -5,6 -3,10 0,14 C 3,10 5,6 6,2 L 7,-6 C 7,-10 5,-14 0,-14 Z`
        : `M 0,14 C -5,14 -7,10 -7,6 L -6,-2 C -5,-6 -3,-10 0,-14 C 3,-10 5,-6 6,-2 L 7,6 C 7,10 5,14 0,14 Z`;
    
    case 'incisor':
      return isUpper
        ? `M -5,-10 L -5,8 C -5,10 -3,12 0,12 C 3,12 5,10 5,8 L 5,-10 C 5,-12 3,-14 0,-14 C -3,-14 -5,-12 -5,-10 Z`
        : `M -5,10 L -5,-8 C -5,-10 -3,-12 0,-12 C 3,-12 5,-10 5,-8 L 5,10 C 5,12 3,14 0,14 C -3,14 -5,12 -5,10 Z`;
    
    default:
      return 'M -5,-10 L 5,-10 L 5,10 L -5,10 Z';
  }
};

// Component pentru dinte individual cu suprafețe
const ToothSVGWithSurfaces: React.FC<{
  number: number;
  position: typeof TOOTH_POSITIONS[1];
  status: ToothStatus;
  selectedSurfaces: ToothSurface[];
  isSelected: boolean;
  onToothClick: () => void;
  onSurfaceClick: (surface: ToothSurface) => void;
  readOnly?: boolean;
  showLabel?: boolean;
}> = ({ 
  number, 
  position, 
  status, 
  selectedSurfaces, 
  isSelected, 
  onToothClick, 
  onSurfaceClick,
  readOnly, 
  showLabel 
}) => {
  const isUpper = position.quadrant <= 2;
  const toothPath = getToothPath(position.type, isUpper);
  const fillColor = getToothColor(status);
  const [hovered, setHovered] = useState(false);
  const [hoveredSurface, setHoveredSurface] = useState<ToothSurface | null>(null);
  
  // Scale pentru tipuri diferite
  const scale = position.type === 'molar' ? 1.3 : position.type === 'premolar' ? 1.1 : 0.9;
  
  // Surface positions relative to tooth center
  const surfaceAreas = {
    mesial: isUpper ? 'M -15,0 L -8,-5 L -8,5 Z' : 'M -15,0 L -8,5 L -8,-5 Z',
    distal: isUpper ? 'M 15,0 L 8,-5 L 8,5 Z' : 'M 15,0 L 8,5 L 8,-5 Z',
    occlusal: position.type !== 'incisor' && position.type !== 'canine' 
      ? (isUpper ? 'M -5,-12 L 5,-12 L 5,-5 L -5,-5 Z' : 'M -5,12 L 5,12 L 5,5 L -5,5 Z')
      : null,
    incisal: position.type === 'incisor' || position.type === 'canine'
      ? (isUpper ? 'M -5,-12 L 5,-12 L 5,-5 L -5,-5 Z' : 'M -5,12 L 5,12 L 5,5 L -5,5 Z')
      : null,
    buccal: isUpper ? 'M -5,5 L 5,5 L 5,12 L -5,12 Z' : 'M -5,-5 L 5,-5 L 5,-12 L -5,-12 Z',
    lingual: isUpper ? 'M -3,0 L 3,0 L 3,8 L -3,8 Z' : 'M -3,0 L 3,0 L 3,-8 L -3,-8 Z',
  };

  if (status === 'missing') {
    return (
      <g transform={`translate(${position.x}, ${position.y})`}>
        <text
          x="0"
          y="0"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="20"
          fill="#999"
          opacity="0.5"
        >
          ✕
        </text>
        {showLabel && (
          <text
            x="0"
            y="35"
            textAnchor="middle"
            fontSize="10"
            fill="#999"
          >
            {number}
          </text>
        )}
      </g>
    );
  }

  return (
    <g 
      transform={`translate(${position.x}, ${position.y}) scale(${scale})`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setHoveredSurface(null);
      }}
    >
      {/* Shadow/glow when selected */}
      {isSelected && (
        <path
          d={toothPath}
          fill="none"
          stroke="#ff5722"
          strokeWidth="4"
          opacity="0.3"
          className="animate-pulse"
        />
      )}
      
      {/* Main tooth shape */}
      <path
        d={toothPath}
        fill={fillColor}
        stroke={isSelected ? '#ff5722' : '#666'}
        strokeWidth={isSelected ? '2' : '1'}
        className={cn(
          'transition-all duration-200',
          !readOnly && 'cursor-pointer',
          hovered && 'opacity-90'
        )}
        onClick={!readOnly ? onToothClick : undefined}
      />
      
      {/* Surface overlays */}
      {!readOnly && Object.entries(surfaceAreas).map(([surface, path]) => {
        if (!path) return null;
        const surfaceType = surface as ToothSurface;
        const isSelectedSurface = selectedSurfaces.includes(surfaceType);
        
        return (
          <path
            key={surface}
            d={path}
            fill={isSelectedSurface ? 'rgba(59, 130, 246, 0.5)' : 
                  hoveredSurface === surfaceType ? 'rgba(156, 163, 175, 0.3)' : 'transparent'}
            stroke={hoveredSurface === surfaceType ? '#3b82f6' : 'transparent'}
            strokeWidth="1"
            className="cursor-pointer transition-all duration-150"
            onMouseEnter={() => setHoveredSurface(surfaceType)}
            onMouseLeave={() => setHoveredSurface(null)}
            onClick={(e) => {
              e.stopPropagation();
              onSurfaceClick(surfaceType);
            }}
          />
        );
      })}
      
      {/* Status indicators */}
      {status === 'cavity' && (
        <circle cx="0" cy={isUpper ? "5" : "-5"} r="3" fill="#8b0000" opacity="0.7" />
      )}
      
      {status === 'crown' && (
        <rect
          x="-6"
          y={isUpper ? "-14" : "8"}
          width="12"
          height="6"
          fill="#4a90e2"
          opacity="0.5"
          rx="1"
        />
      )}
      
      {/* Tooth number label */}
      {showLabel && (
        <text
          x="0"
          y={isUpper ? "35" : "-35"}
          textAnchor="middle"
          fontSize="10"
          fill="#333"
          className="select-none font-medium pointer-events-none"
        >
          {number}
        </text>
      )}
      
      {/* Hover tooltip for surfaces */}
      {hoveredSurface && !readOnly && (
        <g transform={`translate(0, ${isUpper ? -30 : 30})`}>
          <rect
            x="-20"
            y="-10"
            width="40"
            height="20"
            fill="black"
            opacity="0.8"
            rx="3"
          />
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="white"
            className="pointer-events-none"
          >
            {hoveredSurface.toUpperCase()}
          </text>
        </g>
      )}
    </g>
  );
};

export const ToothChartSVGAdvanced: React.FC<ToothChartSVGAdvancedProps> = ({
  selectedTeeth = [],
  toothData = [],
  onToothSelect,
  onSelectionChange,
  readOnly = false,
  showLabels = true,
  showQuadrants = true,
  className,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedToothDetails, setSelectedToothDetails] = useState<SelectedTooth | null>(null);

  // Create maps for quick lookup
  const toothDataMap = useMemo(() => {
    const map = new Map<number, ToothData>();
    toothData.forEach(tooth => map.set(tooth.number, tooth));
    return map;
  }, [toothData]);

  const selectedTeethMap = useMemo(() => {
    const map = new Map<number, SelectedTooth>();
    selectedTeeth.forEach(tooth => map.set(tooth.number, tooth));
    return map;
  }, [selectedTeeth]);

  const handleToothClick = useCallback((toothNumber: number) => {
    if (readOnly) return;

    const existingTooth = selectedTeethMap.get(toothNumber);
    
    if (existingTooth) {
      // Remove tooth
      const newSelection = selectedTeeth.filter(t => t.number !== toothNumber);
      onSelectionChange?.(newSelection);
    } else {
      // Add tooth
      const newTooth: SelectedTooth = { number: toothNumber, surfaces: [] };
      onToothSelect?.(newTooth);
      onSelectionChange?.([...selectedTeeth, newTooth]);
    }
    
    setSelectedToothDetails(existingTooth || { number: toothNumber, surfaces: [] });
  }, [readOnly, selectedTeeth, selectedTeethMap, onToothSelect, onSelectionChange]);

  const handleSurfaceClick = useCallback((toothNumber: number, surface: ToothSurface) => {
    if (readOnly) return;

    const tooth = selectedTeethMap.get(toothNumber);
    
    if (!tooth) {
      // Tooth not selected, select it with this surface
      const newTooth: SelectedTooth = { number: toothNumber, surfaces: [surface] };
      onToothSelect?.(newTooth);
      onSelectionChange?.([...selectedTeeth, newTooth]);
    } else {
      // Toggle surface
      const newSurfaces = tooth.surfaces.includes(surface)
        ? tooth.surfaces.filter(s => s !== surface)
        : [...tooth.surfaces, surface];
      
      const updatedTooth = { ...tooth, surfaces: newSurfaces };
      const newSelection = selectedTeeth.map(t => 
        t.number === toothNumber ? updatedTooth : t
      );
      
      onToothSelect?.(updatedTooth);
      onSelectionChange?.(newSelection);
    }
  }, [readOnly, selectedTeeth, selectedTeethMap, onToothSelect, onSelectionChange]);

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    onSelectionChange?.([]);
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
            className="p-2 bg-white dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
            className="p-2 bg-white dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-white dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span>Click pe dinte pentru selectare, click pe suprafață pentru detalii</span>
          </div>
        </div>
      </div>

      {/* Main SVG Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 overflow-hidden">
        <svg
          viewBox="-50 0 800 500"
          className="w-full h-auto cursor-move"
          style={{ maxHeight: '600px' }}
          onMouseDown={(e) => {
            if (e.shiftKey) {
              setIsDragging(true);
              setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
            }
          }}
          onMouseMove={(e) => {
            if (isDragging) {
              setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
            }
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Background patterns */}
            <defs>
              <linearGradient id="upperJawBg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f0f9ff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="lowerJawBg" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Background areas for jaws */}
            <rect x="-50" y="30" width="800" height="150" fill="url(#upperJawBg)" rx="10" />
            <rect x="-50" y="320" width="800" height="150" fill="url(#lowerJawBg)" rx="10" />

            {/* Quadrant lines */}
            {showQuadrants && (
              <g opacity="0.2">
                <line x1="345" y1="50" x2="345" y2="450" stroke="#999" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="0" y1="250" x2="690" y2="250" stroke="#999" strokeWidth="1" strokeDasharray="5,5" />
                
                <text x="520" y="25" fontSize="12" fill="#666" textAnchor="middle">Cadran 1</text>
                <text x="170" y="25" fontSize="12" fill="#666" textAnchor="middle">Cadran 2</text>
                <text x="170" y="475" fontSize="12" fill="#666" textAnchor="middle">Cadran 3</text>
                <text x="520" y="475" fontSize="12" fill="#666" textAnchor="middle">Cadran 4</text>
              </g>
            )}

            {/* Jaw labels */}
            <text x="345" y="50" fontSize="14" fill="#333" textAnchor="middle" className="font-semibold">
              Maxilar Superior
            </text>
            <text x="345" y="460" fontSize="14" fill="#333" textAnchor="middle" className="font-semibold">
              Maxilar Inferior
            </text>

            {/* Render teeth */}
            {Object.entries(TOOTH_POSITIONS).map(([toothNumber, position]) => {
              const number = parseInt(toothNumber);
              const toothInfo = toothDataMap.get(number) || { number, status: 'healthy' as ToothStatus };
              const selectedTooth = selectedTeethMap.get(number);
              
              return (
                <ToothSVGWithSurfaces
                  key={number}
                  number={number}
                  position={position}
                  status={toothInfo.status}
                  selectedSurfaces={selectedTooth?.surfaces || []}
                  isSelected={!!selectedTooth}
                  onToothClick={() => handleToothClick(number)}
                  onSurfaceClick={(surface) => handleSurfaceClick(number, surface)}
                  readOnly={readOnly}
                  showLabel={showLabels}
                />
              );
            })}
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Legendă:</span>
          {[
            { status: 'healthy', label: 'Sănătos', color: '#ffffff', border: '#666' },
            { status: 'treated', label: 'Tratat', color: '#ffd4a3', border: '#666' },
            { status: 'cavity', label: 'Carie', color: '#ff6b6b', border: '#666' },
            { status: 'crown', label: 'Coroană', color: '#74c0fc', border: '#666' },
            { status: 'implant', label: 'Implant', color: '#d0bfff', border: '#666' },
            { status: 'bridge', label: 'Punte', color: '#8ce99a', border: '#666' },
            { status: 'missing', label: 'Lipsă', color: 'transparent', border: '#999' }
          ].map(item => (
            <div key={item.status} className="flex items-center gap-2">
              <svg width="20" height="20">
                <rect
                  x="2"
                  y="2"
                  width="16"
                  height="16"
                  fill={item.color}
                  stroke={item.border}
                  strokeWidth="1"
                  rx="2"
                  opacity={item.status === 'missing' ? 0.3 : 1}
                />
              </svg>
              <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Surface selection info */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Suprafețe:</span>
            <div className="flex gap-3 text-xs">
              <span><span className="font-semibold">M</span> - Mesial</span>
              <span><span className="font-semibold">D</span> - Distal</span>
              <span><span className="font-semibold">O/I</span> - Occlusal/Incisal</span>
              <span><span className="font-semibold">B</span> - Buccal</span>
              <span><span className="font-semibold">L</span> - Lingual</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selection summary */}
      {selectedTeeth.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
            Dinți selectați ({selectedTeeth.length}):
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedTeeth.map(tooth => (
              <div
                key={tooth.number}
                className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg border border-blue-300 dark:border-blue-700"
              >
                <span className="font-medium text-blue-900 dark:text-blue-200">
                  #{tooth.number}
                </span>
                {tooth.surfaces.length > 0 && (
                  <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                    ({tooth.surfaces.map(s => s[0].toUpperCase()).join(',')})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToothChartSVGAdvanced;