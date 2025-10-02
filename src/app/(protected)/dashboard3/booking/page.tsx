// app/(dashboard)/bookings/page.tsx
"use client"

import { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MapPin,
  Globe,
  Info,
  Loader2,
  Phone,
  FileText,
  CreditCard,
  Users,
  Activity,
  TrendingUp,
  CalendarDays,
  Filter,
  Search,
  ChevronRight
} from "lucide-react";

interface CalcomBooking {
  id: string;
  uid: string;
  title?: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: string;
  attendeeName?: string;
  attendeeEmail?: string;
  attendeeTimeZone?: string;
  location?: string;
  createdAt: string;
  rescheduled: boolean;
}

interface DatabaseAppointment {
  id: string;
  appointmentDate: string;
  durationMinutes: number;
  type: string;
  reason: string;
  status: string;
  patient: {
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
  };
  dentist: {
    name: string;
    email: string;
  };
}

type TabType = 'calcom' | 'database' | 'analytics';

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('calcom');
  const [calcomBookings, setCalcomBookings] = useState<CalcomBooking[]>([]);
  const [dbAppointments, setDbAppointments] = useState<DatabaseAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Fetch Cal.com bookings
  const fetchCalcomBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/bookings');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch Cal.com bookings');
      }
      const data = await response.json();
      setCalcomBookings(data.bookings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching Cal.com bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch database appointments
  const fetchDatabaseAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/appointments');
      if (!response.ok) {
        throw new Error('Failed to fetch database appointments');
      }
      const data = await response.json();
      setDbAppointments(data.appointments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching database appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync Cal.com bookings to database
  const syncBookingsToDatabase = async () => {
    setSyncStatus('syncing');
    try {
      const response = await fetch('/api/bookings/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookings: calcomBookings })
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      setSyncStatus('success');
      // Refresh both data sources
      await Promise.all([fetchCalcomBookings(), fetchDatabaseAppointments()]);
      
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err) {
      setSyncStatus('error');
      console.error('Sync error:', err);
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  useEffect(() => {
    if (activeTab === 'calcom') {
      fetchCalcomBookings();
    } else if (activeTab === 'database') {
      fetchDatabaseAppointments();
    }
  }, [activeTab]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'calcom') {
        fetchCalcomBookings();
      } else if (activeTab === 'database') {
        fetchDatabaseAppointments();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'CONFIRMED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
      case 'SCHEDULED':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'cancelled':
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'pending':
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'cancelled':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'CONFIRMED':
        return 'Confirmat';
      case 'pending':
      case 'SCHEDULED':
        return 'Programat';
      case 'cancelled':
      case 'CANCELLED':
        return 'Anulat';
      case 'COMPLETED':
        return 'Finalizat';
      case 'rescheduled':
      case 'RESCHEDULED':
        return 'Reprogramat';
      case 'NO_SHOW':
        return 'Neprezentare';
      case 'IN_PROGRESS':
        return 'În Desfășurare';
      default:
        return status;
    }
  };

  // Filter logic
  const filterBookings = (bookings: any[]) => {
    return bookings.filter(booking => {
      const matchesSearch = searchQuery === "" || 
        (booking.attendeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         booking.attendeeEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         booking.title?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const filterAppointments = (appointments: DatabaseAppointment[]) => {
    return appointments.filter(appointment => {
      const matchesSearch = searchQuery === "" || 
        (`${appointment.patient.firstName} ${appointment.patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
         appointment.patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         appointment.reason.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  // Analytics calculations
  const getAnalytics = () => {
    const totalCalcom = calcomBookings.length;
    const totalDb = dbAppointments.length;
    const confirmedCalcom = calcomBookings.filter(b => b.status === 'accepted').length;
    const confirmedDb = dbAppointments.filter(a => a.status === 'CONFIRMED').length;
    const pendingCalcom = calcomBookings.filter(b => b.status === 'pending').length;
    const pendingDb = dbAppointments.filter(a => a.status === 'SCHEDULED').length;
    
    return {
      totalBookings: totalCalcom + totalDb,
      confirmedBookings: confirmedCalcom ,
      pendingBookings: pendingCalcom + pendingDb,
      syncStatus: calcomBookings.length > 0 ? 'Active' : 'Inactive'
    };
  };

  const analytics = getAnalytics();

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestionare Programări
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Vizualizează și sincronizează programările din Cal.com și baza de date
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'calcom' && (
              <button
                onClick={syncBookingsToDatabase}
                disabled={syncStatus === 'syncing' || calcomBookings.length === 0}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  syncStatus === 'success' 
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : syncStatus === 'error'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {syncStatus === 'syncing' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sincronizare...
                  </>
                ) : syncStatus === 'success' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Sincronizat!
                  </>
                ) : syncStatus === 'error' ? (
                  <>
                    <XCircle className="w-4 h-4" />
                    Eroare
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    Sincronizează cu DB
                  </>
                )}
              </button>
            )}
            <button
              onClick={() => activeTab === 'calcom' ? fetchCalcomBookings() : fetchDatabaseAppointments()}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Reîmprospătează
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Programări</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{calcomBookings.length}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Confirmate</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{analytics.confirmedBookings}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">În Așteptare</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{analytics.pendingBookings}</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status Webhook</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{analytics.syncStatus}</p>
            </div>
            <div className={`p-2 rounded-lg ${analytics.syncStatus === 'Active' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-900/30'}`}>
              <Activity className={`w-5 h-5 ${analytics.syncStatus === 'Active' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-8">
          {[
            { id: 'calcom' as TabType, label: 'Programări Cal.com', icon: Globe, count: calcomBookings.length },
            { id: 'database' as TabType, label: 'Programări Database', icon: FileText, count: dbAppointments.length },
            { id: 'analytics' as TabType, label: 'Analiză', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Filter Bar */}
      {activeTab !== 'analytics' && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Caută după nume, email sau motiv..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
            >
              <option value="all">Toate Statusurile</option>
              <option value="accepted">Confirmate</option>
              <option value="pending">În Așteptare</option>
              <option value="cancelled">Anulate</option>
              <option value="COMPLETED">Finalizate</option>
            </select>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        {/* Cal.com Bookings Tab */}
        {activeTab === 'calcom' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Programări Cal.com
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live sync activ</span>
              </div>
            </div>

            {loading && calcomBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Se încarcă programările...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                <XCircle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-3" />
                <p className="text-red-800 dark:text-red-200 font-medium">Eroare la încărcarea programărilor</p>
                <p className="text-red-600 dark:text-red-300 text-sm mt-2">{error}</p>
                <button
                  onClick={fetchCalcomBookings}
                  className="mt-4 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Încearcă din nou
                </button>
              </div>
            ) : filterBookings(calcomBookings).length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Nu s-au găsit programări care să corespundă criteriilor'
                    : 'Nu există programări încă'}
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  Programările create în Cal.com vor apărea aici automat
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filterBookings(calcomBookings).map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-all hover:border-blue-300 dark:hover:border-blue-600 bg-gradient-to-r from-white to-gray-50 dark:gray-1000 dark:to-gray-900"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(booking.status)}
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {booking.title || 'Programare'}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {booking.rescheduled && (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                            Reprogramat
                          </span>
                        )}
                        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatDate(booking.startTime)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                        <span>
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </span>
                      </div>

                      {booking.attendeeName && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          <span>{booking.attendeeName}</span>
                        </div>
                      )}

                      {booking.attendeeEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          <span className="text-xs">{booking.attendeeEmail}</span>
                        </div>
                      )}

                      {booking.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          <span>{booking.location}</span>
                        </div>
                      )}

                      {booking.attendeeTimeZone && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          <span className="text-xs">{booking.attendeeTimeZone}</span>
                        </div>
                      )}
                    </div>

                    {booking.description && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                          {booking.description}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        ID: {booking.uid}
                      </span>
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                        Vezi Detalii
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Database Appointments Tab */}
        {activeTab === 'database' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Programări din Baza de Date
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Info className="w-4 h-4" />
                <span>Date locale</span>
              </div>
            </div>

            {loading && dbAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Se încarcă programările din baza de date...</p>
              </div>
            ) : error ? (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                              <XCircle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-3" />
                              <p className="text-red-800 dark:text-red-200 font-medium">Eroare la încărcarea programărilor</p>
                              <p className="text-red-600 dark:text-red-300 text-sm mt-2">{error}</p>
                              <button
                                onClick={fetchDatabaseAppointments}
                                className="mt-4 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                              >
                                Încearcă din nou
                              </button>
                            </div>
                          ) : filterAppointments(dbAppointments).length === 0 ? (
                            <div className="text-center py-12">
                              <Calendar className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
                              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                                {searchQuery || statusFilter !== 'all' 
                                  ? 'Nu s-au găsit programări care să corespundă criteriilor'
                                  : 'Nu există programări în baza de date încă'}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {filterAppointments(dbAppointments).map((appointment) => (
                                <div
                                  key={appointment.id}
                                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-all hover:border-blue-300 dark:hover:border-blue-600"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(appointment.status)}
                                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                        {appointment.reason}
                                      </h3>
                                    </div>
                                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(appointment.status)}`}>
                                      {getStatusText(appointment.status)}
                                    </span>
                                  </div>
              
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {formatDate(appointment.appointmentDate)}
                                      </span>
                                    </div>
              
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                      <span>{appointment.durationMinutes} minute</span>
                                    </div>
              
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                      <span>{appointment.patient.firstName} {appointment.patient.lastName}</span>
                                    </div>
              
                                    {appointment.patient.email && (
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                        <span className="text-xs">{appointment.patient.email}</span>
                                      </div>
                                    )}
              
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                      <span className="text-xs">{appointment.patient.phone}</span>
                                    </div>
              
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                      <span>Dr. {appointment.dentist.name}</span>
                                    </div>
                                  </div>
              
                                  <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                      Tip: {appointment.type}
                                    </span>
                                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                                      Vezi Detalii
                                      <ChevronRight className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
              
                      {/* Analytics Tab */}
                      {activeTab === 'analytics' && (
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                            Statistici și Analize
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Rezumat General</h3>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Total programări Cal.com:</span>
                                  <span className="font-medium text-gray-900 dark:text-white">{calcomBookings.length}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Total programări database:</span>
                                  <span className="font-medium text-gray-900 dark:text-white">{dbAppointments.length}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Total general:</span>
                                  <span className="font-bold text-blue-600 dark:text-blue-400">{analytics.totalBookings}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Status Distribuție</h3>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Confirmate:</span>
                                  <span className="font-medium text-green-600 dark:text-green-400">{analytics.confirmedBookings}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">În așteptare:</span>
                                  <span className="font-medium text-yellow-600 dark:text-yellow-400">{analytics.pendingBookings}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Rata de confirmare:</span>
                                  <span className="font-bold text-gray-900 dark:text-white">
                                    {analytics.totalBookings > 0 ? Math.round((analytics.confirmedBookings / analytics.totalBookings) * 100) : 0}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }