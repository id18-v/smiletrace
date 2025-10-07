// src/app/patients/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  DollarSign, 
  Activity,
  Phone,
  Mail,
  MapPin,
  Heart,
  Pill,
  AlertTriangle,
  FileText,
  Shield,
  UserCircle,
  Loader2,
  User
} from "lucide-react";

interface PatientSummary {
  patient: any;
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  totalTreatments: number;
  totalSpent: number;
  balanceDue: number;
  lastVisit?: string;
  nextAppointment?: string;
}

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientSummary();
  }, [patientId]);

  const fetchPatientSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/patients/${patientId}/summary`);
      
      if (!response.ok) {
        throw new Error("Eroare la încărcarea datelor pacientului");
      }

      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching patient summary:", error);
      alert("Eroare la încărcarea datelor pacientului");
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Se încarcă datele pacientului...</span>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">Pacientul nu a fost găsit.</p>
          <button
            onClick={() => router.push("/dashboard3/patients")}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Înapoi la Pacienți
          </button>
        </div>
      </div>
    );
  }

  const { patient } = summary;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard3/patients")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <UserCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {patient.firstName} {patient.lastName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {calculateAge(patient.dateOfBirth)} ani • {
                    patient.gender === "MALE" ? "Masculin" : 
                    patient.gender === "FEMALE" ? "Feminin" : "Altul"
                  }
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push(`/dashboard3/patients/${patientId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            Editează
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Programări Totale</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {summary.totalAppointments}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Programări Viitoare</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {summary.upcomingAppointments}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Cheltuit</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ${summary.totalSpent.toFixed(2)}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rest de Plată</p>
              <p className={`text-2xl font-bold mt-1 ${
                summary.balanceDue > 0 ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"
              }`}>
                ${summary.balanceDue.toFixed(2)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              summary.balanceDue > 0 
                ? "bg-red-100 dark:bg-red-900/30" 
                : "bg-gray-100 dark:bg-gray-700"
            }`}>
              <DollarSign className={`w-6 h-6 ${
                summary.balanceDue > 0 
                  ? "text-red-600 dark:text-red-400" 
                  : "text-gray-600 dark:text-gray-400"
              }`} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Informații de Contact
              </h2>
            </div>
            
            <div className="space-y-3">
              {patient.phone && (
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                    <Phone className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-gray-900 dark:text-white">{patient.phone}</span>
                </div>
              )}
              
              {patient.email && (
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-gray-900 dark:text-white">{patient.email}</span>
                </div>
              )}
              
              {(patient.address || patient.city) && (
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg mt-0.5">
                    <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="text-gray-900 dark:text-white">
                    {patient.address && <div>{patient.address}</div>}
                    <div>
                      {patient.city && patient.city}
                      {patient.state && `, ${patient.state}`}
                      {patient.zipCode && ` ${patient.zipCode}`}
                    </div>
                    {patient.country && <div>{patient.country}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Informații Medicale
              </h2>
            </div>
            
            <div className="space-y-4">
              {patient.bloodType && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Grupă Sanguină</label>
                  <p className="text-gray-900 dark:text-white mt-1">{patient.bloodType}</p>
                </div>
              )}

              {patient.allergies && patient.allergies.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    Alergii
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-sm"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {patient.medications && patient.medications.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-2">
                    <Pill className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Medicamente
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {patient.medications.map((medication: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                      >
                        {medication}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {patient.medicalHistory && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4" />
                    Istoric Medical
                  </label>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    {patient.medicalHistory}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Insurance Information */}
          {patient.insuranceProvider && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Asigurare
                </h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Furnizor</label>
                  <p className="text-gray-900 dark:text-white mt-1">{patient.insuranceProvider}</p>
                </div>
                
                {patient.insurancePolicyNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Număr Poliță</label>
                    <p className="text-gray-900 dark:text-white mt-1">{patient.insurancePolicyNumber}</p>
                  </div>
                )}
                
                {patient.insuranceGroupNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Număr Grup</label>
                    <p className="text-gray-900 dark:text-white mt-1">{patient.insuranceGroupNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Visit Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Informații Vizite
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ultima Vizită</label>
                <p className="text-gray-900 dark:text-white mt-1">{formatDate(summary.lastVisit)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Următoarea Programare</label>
                <p className="text-gray-900 dark:text-white mt-1">{formatDate(summary.nextAppointment)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tratamente</label>
                <p className="text-gray-900 dark:text-white mt-1">{summary.totalTreatments}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Programări Finalizate</label>
                <p className="text-gray-900 dark:text-white mt-1">{summary.completedAppointments}</p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          {patient.emergencyContactName && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-6">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Contact de Urgență
                </h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nume</label>
                  <p className="text-gray-900 dark:text-white mt-1">{patient.emergencyContactName}</p>
                </div>
                
                {patient.emergencyContactPhone && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Telefon</label>
                    <p className="text-gray-900 dark:text-white mt-1">{patient.emergencyContactPhone}</p>
                  </div>
                )}
                
                {patient.emergencyContactRelation && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Relație</label>
                    <p className="text-gray-900 dark:text-white mt-1">{patient.emergencyContactRelation}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {patient.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notițe
                </h2>
              </div>
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                {patient.notes}
              </p>
            </div>
          )}

          {/* Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Status Pacient
              </h2>
            </div>
            <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
              patient.isActive
                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
            }`}>
              {patient.isActive ? "Activ" : "Inactiv"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}