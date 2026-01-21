// src/app/patients/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, Eye, Edit, Trash2, X, Users, Calendar, Activity, Loader2, UserCircle } from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  city?: string;
  state?: string;
  isActive: boolean;
  lastVisitAt?: string;
  _count: {
    appointments: number;
    treatments: number;
  };
}

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State-uri pentru căutare
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    gender: "",
    city: "",
    state: "",
    isActive: "",
    minAge: "",
    maxAge: "",
  });

  // 1. Debounce Effect: Așteaptă 500ms după ce te oprești din scris
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // 2. Fetch Effect: Se activează DOAR când se schimbă debouncedSearchQuery (nu searchQuery direct)
  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearchQuery, filters]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: "20",
      });

      // FOLOSIM DOAR VARIANTA DEBOUNCED AICI
      if (debouncedSearchQuery) {
        params.append("query", debouncedSearchQuery);
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const url = `/api/patients/search?${params}`;
      const response = await fetch(url);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        let errorMessage = "Eroare la încărcarea pacienților";
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            console.error("Failed to parse error response");
          }
        }
        throw new Error(errorMessage);
      }

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Răspuns invalid de la server");
      }

      const data = await response.json();
      setPatients(data.patients || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (error: any) {
      console.error("Error fetching patients:", error);
      setPatients([]);
      setTotalPages(1);
      setTotal(0);
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

  const handleDelete = async (patientId: string) => {
    if (!confirm("Sigur vrei să ștergi acest pacient?")) {
      return;
    }

    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: "DELETE",
      });

      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        let errorMessage = "Eroare la ștergerea pacientului";
        if (contentType && contentType.includes("application/json")) {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        }
        throw new Error(errorMessage);
      }

      alert("Pacient șters cu succes");
      fetchPatients();
    } catch (error: any) {
      console.error("Error deleting patient:", error);
      alert(`Eroare: ${error.message}`);
    }
  };

  const resetFilters = () => {
    setFilters({
      gender: "",
      city: "",
      state: "",
      isActive: "",
      minAge: "",
      maxAge: "",
    });
    setSearchQuery(""); // Resetăm și inputul vizual
    // debouncedSearchQuery se va reseta automat datorită useEffect-ului de debounce
    setCurrentPage(1);
  };

  if (loading && patients.length === 0 && !searchQuery) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#020f18] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-lg">Se încarcă pacienții...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020f18]">
      <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-[#0a1929] rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-4 rounded-xl shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Gestionare Pacienți
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Total: <span className="font-semibold text-blue-600 dark:text-blue-400">{total}</span> pacienți înregistrați
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/dashboard3/patients/new")}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow-md font-medium"
            >
              <Plus className="w-4 h-4" />
              Pacient Nou
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#0a1929] rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700/50 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pacienți</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{total}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Înregistrați în sistem</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0a1929] rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700/50 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pacienți Activi</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {patients.filter(p => p.isActive).length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {total > 0 ? Math.round((patients.filter(p => p.isActive).length / total) * 100) : 0}% din total
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Programări</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {patients.reduce((sum, p) => sum + p._count.appointments, 0)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Toate perioadele</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                <Calendar className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-[#0a1929] rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700/50">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Caută după nume, email, telefon..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                />
                {/* Loader mic doar în search bar când scrii și aștepți debounce */}
                {searchQuery !== debouncedSearchQuery && (
                   <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                   </div>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-medium ${
                  showFilters 
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtre
                {showFilters && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">Active</span>
                )}
              </button>
            </div>

            {showFilters && (
              <div className="border-t dark:border-gray-700/50 pt-5 mt-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gen
                    </label>
                    <select
                      value={filters.gender}
                      onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white transition-all"
                    >
                      <option value="">Toți</option>
                      <option value="MALE">Masculin</option>
                      <option value="FEMALE">Feminin</option>
                      <option value="OTHER">Altul</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={filters.isActive}
                      onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white transition-all"
                    >
                      <option value="">Toți</option>
                      <option value="true">Activ</option>
                      <option value="false">Inactiv</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Oraș
                    </label>
                    <input
                      type="text"
                      value={filters.city}
                      onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                      placeholder="Oraș..."
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vârstă minimă
                    </label>
                    <input
                      type="number"
                      value={filters.minAge}
                      onChange={(e) => setFilters({ ...filters, minAge: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vârstă maximă
                    </label>
                    <input
                      type="number"
                      value={filters.maxAge}
                      onChange={(e) => setFilters({ ...filters, maxAge: e.target.value })}
                      placeholder="100"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={resetFilters}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 font-medium"
                    >
                      <X className="w-4 h-4" />
                      Resetează Filtre
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white dark:bg-[#0a1929] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/50 overflow-hidden">
          {patients.length === 0 && !loading ? (
            <div className="p-12 text-center">
              <div className="bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">Nu au fost găsiți pacienți</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mb-6">
                {searchQuery || Object.values(filters).some(f => f) 
                  ? "Încearcă să modifici criteriile de căutare" 
                  : "Începe prin a adăuga primul pacient"}
              </p>
              <button
                onClick={() => router.push("/dashboard3/patients/new")}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-sm hover:shadow-md inline-flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                Adaugă primul pacient
              </button>
            </div>
          ) : (
            <>
               {/* Loading overlay pentru tabel cand facem search */}
               {loading && patients.length > 0 && (
                   <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                   </div>
               )}
              <div className="overflow-x-auto relative min-h-[200px]">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Pacient
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Vârstă
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Locație
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Activitate
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Acțiuni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
                    {patients.map((patient) => (
                      <tr 
                        key={patient.id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-2 rounded-lg">
                              <UserCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {patient.firstName} {patient.lastName}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {patient.gender === "MALE" ? "Masculin" : patient.gender === "FEMALE" ? "Feminin" : "Altul"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white font-medium">{patient.phone}</div>
                          {patient.email && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{patient.email}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {calculateAge(patient.dateOfBirth)} ani
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {patient.city || "-"}
                            {patient.state && `, ${patient.state}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {patient._count.appointments} programări
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {patient._count.treatments} tratamente
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-lg ${
                            patient.isActive
                              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30"
                              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                          }`}>
                            {patient.isActive ? "Activ" : "Inactiv"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => router.push(`/dashboard3/patients/${patient.id}`)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                              title="Vizualizează"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/dashboard3/patients/${patient.id}/edit`)}
                              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                              title="Editează"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(patient.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                              title="Șterge"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white dark:bg-[#0a1929] border border-gray-300 dark:border-gray-600/50 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      ← Anterior
                    </button>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pagina <span className="text-blue-600 dark:text-blue-400 font-bold">{currentPage}</span> din <span className="font-bold">{totalPages}</span>
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white dark:bg-[#0a1929] border border-gray-300 dark:border-gray-600/50 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      Următor →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}