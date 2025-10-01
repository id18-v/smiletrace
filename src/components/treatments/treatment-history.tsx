// src/components/treatments/treatment-history.tsx
'use client';

import React, { useState, useRef } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Euro, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  Printer, 
  Download, 
  Search,
  Activity,
  Stethoscope,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Edit,
  MoreVertical
} from 'lucide-react';
import { ToothChartImages } from './teeth-visual';

// Types
interface TreatmentItem {
  id: string;
  procedureName: string;
  toothNumbers: number[];
  toothSurfaces: string[];
  quantity: number;
  unitCost: number;
  totalCost: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
}

interface Treatment {
  id: string;
  patientId: string;
  patientName: string;
  treatmentDate: string;
  createdAt: string;
  chiefComplaint: string;
  diagnosis: string;
  treatmentPlan: string;
  notes: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  totalCost: number;
  discount: number;
  finalCost: number;
  estimatedDuration: number;
  actualDuration?: number;
  items: TreatmentItem[];
  dentistName: string;
  followUpDate?: string;
}

interface TreatmentHistoryProps {
  patientId?: string;
  treatments: Treatment[];
  onTreatmentEdit?: (treatmentId: string) => void;
  onTreatmentView?: (treatmentId: string) => void;
  showPatientInfo?: boolean;
}

export function TreatmentHistory({
  patientId,
  treatments,
  onTreatmentEdit,
  onTreatmentView,
  showPatientInfo = false
}: TreatmentHistoryProps) {
  const [expandedTreatments, setExpandedTreatments] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [procedureFilter, setProcedureFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Filter treatments
  const filteredTreatments = treatments.filter(treatment => {
    // Search filter
    if (searchTerm && !treatment.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !treatment.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !treatment.patientName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Date filter
    if (dateFilter.from && new Date(treatment.treatmentDate) < new Date(dateFilter.from)) {
      return false;
    }
    if (dateFilter.to && new Date(treatment.treatmentDate) > new Date(dateFilter.to)) {
      return false;
    }

    // Status filter
    if (statusFilter.length > 0 && !statusFilter.includes(treatment.status)) {
      return false;
    }

    // Procedure filter
    if (procedureFilter && !treatment.items.some(item => 
      item.procedureName.toLowerCase().includes(procedureFilter.toLowerCase())
    )) {
      return false;
    }

    return true;
  });

  const toggleExpanded = (treatmentId: string) => {
    setExpandedTreatments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(treatmentId)) {
        newSet.delete(treatmentId);
      } else {
        newSet.add(treatmentId);
      }
      return newSet;
    });
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins} min`;
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Istoric Tratamente</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .treatment-item { page-break-inside: avoid; margin-bottom: 20px; border: 1px solid #ccc; padding: 15px; }
                .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
                .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
                .completed { background: #d4edda; color: #155724; }
                .in_progress { background: #fff3cd; color: #856404; }
                .planned { background: #cce7ff; color: #004085; }
                .cancelled { background: #f8d7da; color: #721c24; }
                @media print { .no-print { display: none; } }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Istoric Tratamente</h1>
                <p>Generat pe: ${new Date().toLocaleDateString('ro-RO')}</p>
              </div>
              ${printContent}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Data', 'Pacient', 'Diagnostic', 'Status', 'Cost Total', 'Durată'],
      ...filteredTreatments.map(t => [
        new Date(t.treatmentDate).toLocaleDateString('ro-RO'),
        t.patientName,
        t.diagnosis,
        t.status,
        `${t.finalCost} RON`,
        formatDuration(t.estimatedDuration)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `istoric_tratamente_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Istoric Tratamente
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filteredTreatments.length} tratament{filteredTreatments.length !== 1 ? 'e' : ''}
            {treatments.length !== filteredTreatments.length && ` din ${treatments.length} total`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtre
          </button>
          
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-300 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>

          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/40 text-green-700 dark:text-green-300 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Căutare
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Diagnostic, simptom, pacient..."
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Perioada
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateFilter.from}
                  onChange={(e) => setDateFilter({...dateFilter, from: e.target.value})}
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                />
                <input
                  type="date"
                  value={dateFilter.to}
                  onChange={(e) => setDateFilter({...dateFilter, to: e.target.value})}
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <div className="space-y-1">
                {['planned', 'in_progress', 'completed', 'cancelled'].map(status => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={statusFilter.includes(status)}
                      onChange={() => handleStatusFilterChange(status)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {status === 'planned' ? 'Planificat' :
                       status === 'in_progress' ? 'În progres' :
                       status === 'completed' ? 'Finalizat' : 'Anulat'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Procedure Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Procedură
              </label>
              <input
                type="text"
                value={procedureFilter}
                onChange={(e) => setProcedureFilter(e.target.value)}
                placeholder="ex: Obturație, Coroană..."
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={() => {
                setSearchTerm('');
                setDateFilter({ from: '', to: '' });
                setStatusFilter([]);
                setProcedureFilter('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium"
            >
              Resetează Filtrele
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4" ref={printRef}>
        {filteredTreatments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nu au fost găsite tratamente
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Încearcă să modifici filtrele sau să adaugi un nou tratament
            </p>
          </div>
        ) : (
          filteredTreatments.map((treatment, index) => (
            <div
              key={treatment.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Treatment Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Date and Status */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {new Date(treatment.treatmentDate).toLocaleDateString('ro-RO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(treatment.status)}`}>
                        {getStatusIcon(treatment.status)}
                        {treatment.status === 'planned' ? 'Planificat' :
                         treatment.status === 'in_progress' ? 'În progres' :
                         treatment.status === 'completed' ? 'Finalizat' : 'Anulat'}
                      </span>

                      {treatment.followUpDate && (
                        <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-1 rounded-full">
                          <Clock className="w-3 h-3" />
                          Follow-up: {new Date(treatment.followUpDate).toLocaleDateString('ro-RO')}
                        </div>
                      )}
                    </div>

                    {/* Patient Info (if showing multiple patients) */}
                    {showPatientInfo && (
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {treatment.patientName}
                        </span>
                      </div>
                    )}

                    {/* Main Info */}
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Simptomatologie:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {treatment.chiefComplaint}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Diagnostic:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {treatment.diagnosis}
                        </p>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Euro className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-600">
                          {treatment.finalCost} RON
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        {formatDuration(treatment.estimatedDuration)}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Stethoscope className="w-4 h-4" />
                        {treatment.dentistName}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <ClipboardList className="w-4 h-4" />
                        {treatment.items.length} procedur{treatment.items.length !== 1 ? 'i' : 'ă'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {onTreatmentView && (
                      <button
                        onClick={() => onTreatmentView(treatment.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Vezi detalii"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    
                    {onTreatmentEdit && treatment.status !== 'completed' && (
                      <button
                        onClick={() => onTreatmentEdit(treatment.id)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        title="Editează"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => toggleExpanded(treatment.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title={expandedTreatments.has(treatment.id) ? 'Ascunde detalii' : 'Arată detalii'}
                    >
                      {expandedTreatments.has(treatment.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedTreatments.has(treatment.id) && (
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 space-y-6">
                  {/* Treatment Plan */}
                  {treatment.treatmentPlan && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Plan de Tratament
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 p-3 rounded-lg">
                        {treatment.treatmentPlan}
                      </p>
                    </div>
                  )}

                  {/* Procedures List */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Proceduri Efectuate
                    </h4>
                    <div className="space-y-2">
                      {treatment.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {item.procedureName}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                {getStatusIcon(item.status)}
                                {item.status === 'planned' ? 'Planificat' :
                                 item.status === 'in_progress' ? 'În progres' :
                                 item.status === 'completed' ? 'Finalizat' : 'Anulat'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              {item.toothNumbers.length > 0 && (
                                <span>
                                  Dinți: {item.toothNumbers.join(', ')}
                                </span>
                              )}
                              {item.toothSurfaces.length > 0 && (
                                <span>
                                  Suprafețe: {item.toothSurfaces.join(', ')}
                                </span>
                              )}
                              <span>
                                Cantitate: {item.quantity}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {item.totalCost} RON
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.unitCost} RON/unitate
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Detalii Cost
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                        <span className="font-medium">{treatment.totalCost} RON</span>
                      </div>
                      {treatment.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Reducere:</span>
                          <span className="text-red-600 font-medium">-{treatment.discount} RON</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                        <span className="font-semibold text-gray-900 dark:text-white">Total Final:</span>
                        <span className="font-bold text-green-600 text-lg">{treatment.finalCost} RON</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {treatment.notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Observații
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 p-3 rounded-lg">
                        {treatment.notes}
                      </p>
                    </div>
                  )}

                  {/* Tooth Chart (if teeth are involved) */}
                  {treatment.items.some(item => item.toothNumbers.length > 0) && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Dinți Tratați
                      </h4>
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                        <ToothChartImages
                          selectedTeeth={treatment.items.flatMap(item => item.toothNumbers)}
                          toothData={[]}
                          onToothSelect={() => {}}
                          readOnly={true}
                          showLabels={true}
                          showQuadrants={true}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Load More / Pagination could go here */}
      {filteredTreatments.length > 10 && (
        <div className="text-center pt-6">
          <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
            Încarcă mai multe
          </button>
        </div>
      )}
    </div>
  );
}