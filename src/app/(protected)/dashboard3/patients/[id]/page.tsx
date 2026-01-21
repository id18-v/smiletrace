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
  User,
  Clock,
  Printer
} from "lucide-react";
import PatientDentalChart from "@/components/treatments/ViewDental";
import SvgChart from "@/components/ui/SvgChart";

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
 
  const handlePrint = () => {
    const printUrl = `/dashboard3/patients/${patientId}/print`;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = printUrl;
    document.body.appendChild(iframe);
  
    // Ascultă mesajul de la pagina de print
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "ready_to_print") {
        window.removeEventListener("message", handleMessage);
        
        // Printare imediată după ce datele sunt gata
        setTimeout(() => {
          if (iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          }
          setTimeout(() => document.body.removeChild(iframe), 1000);
        }, 100); // Doar 100ms pentru siguranță
      }
    };
    
    window.addEventListener("message", handleMessage);
    
    // Fallback: dacă nu primim mesaj în 5 secunde, printăm oricum
    setTimeout(() => {
      window.removeEventListener("message", handleMessage);
      if (iframe.contentWindow && document.body.contains(iframe)) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }
    }, 5000);
  };
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
      <div className="min-h-screen bg-gray-50 dark:bg-[#020f18] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-lg">Se încarcă datele pacientului...</span>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#020f18] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white dark:bg-[#0a1929] rounded-2xl shadow-sm p-12 border border-gray-200 dark:border-gray-700/50">
            <User className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">Pacientul nu a fost găsit.</p>
            <button
              onClick={() => router.push("/dashboard3/patients")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-all shadow-sm hover:shadow-md font-medium"
            >
              Înapoi la Pacienți
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { patient } = summary;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020f18]">
      <link rel="prefetch" href={`/dashboard3/patients/${patientId}/print`} as="document" />
      <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-[#0a1929] rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard3/patients")}
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-4 rounded-xl shadow-lg">
                  <UserCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {patient.firstName} {patient.lastName}
                  </h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      {calculateAge(patient.dateOfBirth)} ani
                    </span>
                    <span className="text-gray-400 dark:text-gray-600">•</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {patient.gender === "MALE" ? "Masculin" : 
                       patient.gender === "FEMALE" ? "Feminin" : "Altul"}
                    </span>
                    <span className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full ${
                      patient.isActive
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    }`}>
                      {patient.isActive ? "Activ" : "Inactiv"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3"> {/* Container pentru ambele butoane */}
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-all shadow-sm font-medium"
      >
        <Printer className="w-4 h-4" />
        Printează Fișa
      </button>

      <button
        onClick={() => router.push(`/dashboard3/patients/${patientId}/edit`)}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-all shadow-sm hover:shadow-md font-medium"
      >
        <Edit className="w-4 h-4" />
        Editează Pacient
      </button>
    </div>

          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#0a1929] rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700/50 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Programări Totale</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {summary.totalAppointments}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {summary.completedAppointments} finalizate
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                <Calendar className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0a1929] rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700/50 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Programări Viitoare</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {summary.upcomingAppointments}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  În următoarele luni
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                <Activity className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0a1929] rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700/50 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cheltuit</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  ${summary.totalSpent.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {summary.totalTreatments} tratamente
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                <DollarSign className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0a1929] rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700/50 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rest de Plată</p>
                <p className={`text-3xl font-bold mt-2 ${
                  summary.balanceDue > 0 
                    ? "text-red-600 dark:text-red-400" 
                    : "text-green-600 dark:text-green-400"
                }`}>
                  ${summary.balanceDue.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {summary.balanceDue > 0 ? "De achitat" : "La zi"}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${
                summary.balanceDue > 0 
                  ? "bg-red-50 dark:bg-red-900/20" 
                  : "bg-green-50 dark:bg-green-900/20"
              }`}>
                <DollarSign className={`w-7 h-7 ${
                  summary.balanceDue > 0 
                    ? "text-red-600 dark:text-red-400" 
                    : "text-green-600 dark:text-green-400"
                }`} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white dark:bg-[#0a1929] rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700/50">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Informații de Contact
                </h2>
              </div>
              
              <div className="space-y-4">
                {patient.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="bg-white dark:bg-gray-700 p-2 rounded-lg">
                      <Phone className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Telefon</p>
                      <p className="text-gray-900 dark:text-white font-medium">{patient.phone}</p>
                    </div>
                  </div>
                )}
                
                {patient.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="bg-white dark:bg-gray-700 p-2 rounded-lg">
                      <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Email</p>
                      <p className="text-gray-900 dark:text-white font-medium">{patient.email}</p>
                    </div>
                  </div>
                )}
                
                {(patient.address || patient.city) && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="bg-white dark:bg-gray-700 p-2 rounded-lg mt-0.5">
                      <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Adresă</p>
                      <div className="text-gray-900 dark:text-white font-medium">
                        {patient.address && <div>{patient.address}</div>}
                        <div>
                          {patient.city && patient.city}
                          {patient.state && `, ${patient.state}`}
                          {patient.zipCode && ` ${patient.zipCode}`}
                        </div>
                        {patient.country && <div>{patient.country}</div>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <SvgChart patientId={patientId} />

            {/* Medical Information */}
            <div className="bg-white dark:bg-[#0a1929] rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700/50">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                  <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Informații Medicale
                </h2>
              </div>
              
              <div className="space-y-5">
                {patient.bloodType && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                      Grupă Sanguină
                    </label>
                    <p className="text-gray-900 dark:text-white font-semibold text-lg mt-1">
                      {patient.bloodType}
                    </p>
                  </div>
                )}

                {patient.allergies && patient.allergies.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      Alergii
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((allergy: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium border border-red-100 dark:border-red-900/30"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {patient.medications && patient.medications.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-3">
                      <Pill className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Medicamente
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {patient.medications.map((medication: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-900/30"
                        >
                          {medication}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {patient.medicalHistory && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4" />
                      Istoric Medical
                    </label>
                    <div className="text-gray-900 dark:text-white whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700/50">
                      {patient.medicalHistory}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Insurance Information */}
            {patient.insuranceProvider && (
              <div className="bg-white dark:bg-[#0a1929] rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700/50">
                <div className="flex items-center gap-2 mb-6">
                  <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Informații Asigurare
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                      Furnizor Asigurare
                    </label>
                    <p className="text-gray-900 dark:text-white font-semibold mt-1">
                      {patient.insuranceProvider}
                    </p>
                  </div>
                  
                  {patient.insurancePolicyNumber && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                        Număr Poliță
                      </label>
                      <p className="text-gray-900 dark:text-white font-semibold mt-1">
                        {patient.insurancePolicyNumber}
                      </p>
                    </div>
                  )}
                  
                  {patient.insuranceGroupNumber && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                        Număr Grup
                      </label>
                      <p className="text-gray-900 dark:text-white font-semibold mt-1">
                        {patient.insuranceGroupNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Visit Information */}
            <div className="bg-white dark:bg-[#0a1929] rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700/50">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Informații Vizite
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-500 dark:text-gray-500" />
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                      Ultima Vizită
                    </label>
                  </div>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {formatDate(summary.lastVisit)}
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <label className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      Următoarea Programare
                    </label>
                  </div>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {formatDate(summary.nextAppointment)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <label className="text-xs text-gray-500 dark:text-gray-500">Tratamente</label>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                      {summary.totalTreatments}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <label className="text-xs text-gray-500 dark:text-gray-500">Finalizate</label>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                      {summary.completedAppointments}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            {patient.emergencyContactName && (
              <div className="bg-white dark:bg-[#0a1929] rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700/50">
                <div className="flex items-center gap-2 mb-6">
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Contact de Urgență
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                      Nume
                    </label>
                    <p className="text-gray-900 dark:text-white font-semibold mt-1">
                      {patient.emergencyContactName}
                    </p>
                  </div>
                  
                  {patient.emergencyContactPhone && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                        Telefon
                      </label>
                      <p className="text-gray-900 dark:text-white font-semibold mt-1">
                        {patient.emergencyContactPhone}
                      </p>
                    </div>
                  )}
                  
                  {patient.emergencyContactRelation && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                        Relație
                      </label>
                      <p className="text-gray-900 dark:text-white font-semibold mt-1">
                        {patient.emergencyContactRelation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {patient.notes && (
              <div className="bg-white dark:bg-[#0a1929] rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700/50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notițe Adiționale
                  </h2>
                </div>
                <div className="text-gray-900 dark:text-white whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700/50 text-sm leading-relaxed">
                  {patient.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}