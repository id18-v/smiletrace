// app/dashboard3/activity/page.tsx - VERSIUNEA FINALĂ
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ActivityPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  // DEBUG: Vezi ce date vin de la sesiune
  console.log('Session data:', session)
  console.log('User data:', session.user)
  console.log('User name:', session.user.name)
  console.log('User email:', session.user.email)

  return (
    <div className="w-full space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bine ai venit, {session.user.name || "Utilizator"}! 👋
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Iată un rezumat al activității clinicii tale pentru astăzi
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Programări Azi */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-lg p-6 hover:shadow-md dark:hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">+2 față de ieri</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">12</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Programări Azi</p>
        </div>

        {/* Pacienți Total */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-lg p-6 hover:shadow-md dark:hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">+18 luna aceasta</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">248</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pacienți Total</p>
        </div>

        {/* Tratamente Active */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-lg p-6 hover:shadow-md dark:hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">8 în așteptare</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">34</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tratamente Active</p>
        </div>

        {/* Venituri */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-lg p-6 hover:shadow-md dark:hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">+12% vs luna trecută</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">45,230 RON</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Venituri Lunare</p>
        </div>
      </div>

      {/* Recent Activity & Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Programări Următoare
          </h3>
          <div className="space-y-4">
            {[
              { time: "09:00", patient: "Maria Ionescu", type: "Consultație" },
              { time: "10:30", patient: "Ion Popescu", type: "Tratament" },
              { time: "14:00", patient: "Ana Dumitrescu", type: "Control" },
            ].map((appointment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{appointment.patient}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{appointment.type}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{appointment.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Activitate Recentă
          </h3>
          <div className="space-y-4">
            {[
              { action: "Pacient nou adăugat", details: "Gheorghe Marin", time: "Acum 2 ore" },
              { action: "Tratament finalizat", details: "Elena Vasilescu", time: "Acum 4 ore" },
              { action: "Programare anulată", details: "Mihai Constantinescu", time: "Ieri" },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 pb-3 border-b dark:border-gray-700 last:border-0"
              >
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full mt-1">
                  <svg className="w-3 h-3 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{activity.details}</p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}